import { requireAdmin, json, safeError } from '../../../_shared/auth.js';
import { sendReviewEmail } from '../../../_shared/email.js';

export async function onRequestPost({ params, request, env }) {
    const { response: authError } = await requireAdmin(request, env);
    if (authError) return authError;

    const orderId = params.id;
    if (!orderId) return safeError(400, 'Order ID is required');

    try {
        // Optional: send review for a specific product only
        let body = {};
        try { body = await request.json(); } catch {}
        const targetProductId = body.product_id || null;

        // Fetch order + customer info
        const order = await env.DB.prepare(
            `SELECT o.id, o.client_id, o.total, o.status, o.review_sent, o.created_date,
                    c.name as customer_name, c.email as customer_email
             FROM orders o
             LEFT JOIN clients c ON o.client_id = c.id
             WHERE o.id = ?1`
        ).bind(orderId).first();

        if (!order) return safeError(404, 'Order not found');
        if (!order.customer_email) return safeError(400, 'Order has no associated customer email');

        // Fetch order items with product info
        let itemQuery = `SELECT oi.product_id, oi.quantity, oi.price, p.name, p.brand
             FROM order_items oi
             LEFT JOIN products p ON oi.product_id = p.id
             WHERE oi.order_id = ?1`;
        const itemBindings = [orderId];

        if (targetProductId) {
            itemQuery += ' AND oi.product_id = ?2';
            itemBindings.push(targetProductId);
        }

        const { results: items } = await env.DB.prepare(itemQuery).bind(...itemBindings).all();
        if (!items || items.length === 0) return safeError(400, 'No matching items found');

        // Check if a review already exists for this product+order combo
        if (targetProductId) {
            const existing = await env.DB.prepare(
                `SELECT id FROM reviews WHERE order_id = ?1 AND product_id = ?2`
            ).bind(orderId, targetProductId).first();
            if (existing) return safeError(409, 'Review request already sent for this watch');
        }

        // Create a pending review for each item
        const reviewIds = [];
        const queries = [];
        const purchaseDate = order.created_date
            ? new Date(order.created_date).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0];

        for (const item of items) {
            const reviewId = crypto.randomUUID();
            reviewIds.push({ id: reviewId, product_id: item.product_id, name: item.name, brand: item.brand });
            queries.push(
                env.DB.prepare(
                    `INSERT INTO reviews (id, order_id, product_id, customer_name, customer_email, status, purchase_date)
                     VALUES (?1, ?2, ?3, ?4, ?5, 'pending', ?6)`
                ).bind(reviewId, orderId, item.product_id, order.customer_name, order.customer_email, purchaseDate)
            );
        }

        // Mark order as review_sent
        queries.push(
            env.DB.prepare('UPDATE orders SET review_sent = 1 WHERE id = ?1').bind(orderId)
        );

        await env.DB.batch(queries);

        // Build review URL
        const origin = new URL(request.url).origin;
        const reviewUrl = `${origin}/review?token=${reviewIds[0].id}`;

        // Send email via Resend
        const watches = reviewIds.map(r => ({ name: r.name || 'Watch', brand: r.brand || '' }));
        await sendReviewEmail({
            to: order.customer_email,
            customerName: order.customer_name,
            watches,
            reviewUrl,
            env,
        });

        console.log(`[audit] Review email sent: order=${orderId} product=${targetProductId || 'all'} to=${order.customer_email}`);

        return json({
            success: true,
            reviews_created: reviewIds.length,
            review_url: reviewUrl,
            email_sent_to: order.customer_email,
        });
    } catch (err) {
        console.error('[orders/send-review] Error:', err.message);
        return safeError(500);
    }
}

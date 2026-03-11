import { requireAuth, requireAdmin, json, safeError } from '../../_shared/auth.js';

// ── GET /api/orders — Admin: list all orders with customer + item details ────
export async function onRequestGet({ request, env }) {
    const { response: authError } = await requireAdmin(request, env);
    if (authError) return authError;

    try {
        const url = new URL(request.url);
        const statusFilter = url.searchParams.get('status');
        const reviewSentFilter = url.searchParams.get('review_sent');

        let query = `
            SELECT o.id, o.client_id, o.total, o.status, o.created_date, o.review_sent,
                   c.name as customer_name, c.email as customer_email
            FROM orders o
            LEFT JOIN clients c ON o.client_id = c.id
            WHERE 1=1
        `;
        const bindings = [];
        let bindIdx = 1;

        if (statusFilter) {
            query += ` AND o.status = ?${bindIdx}`;
            bindings.push(statusFilter);
            bindIdx++;
        }
        if (reviewSentFilter !== null && reviewSentFilter !== undefined && reviewSentFilter !== '') {
            query += ` AND o.review_sent = ?${bindIdx}`;
            bindings.push(parseInt(reviewSentFilter));
            bindIdx++;
        }

        query += ` ORDER BY o.created_date DESC LIMIT 200`;

        let stmt = env.DB.prepare(query);
        if (bindings.length > 0) stmt = stmt.bind(...bindings);
        const { results: orders } = await stmt.all();

        // Fetch items for each order
        if (orders && orders.length > 0) {
            const orderIds = orders.map(o => o.id);
            const placeholders = orderIds.map((_, i) => `?${i + 1}`).join(',');
            const { results: items } = await env.DB.prepare(
                `SELECT oi.order_id, oi.product_id, oi.quantity, oi.price,
                        p.name as watch_name, p.brand as watch_brand, p.images
                 FROM order_items oi
                 LEFT JOIN products p ON oi.product_id = p.id
                 WHERE oi.order_id IN (${placeholders})`
            ).bind(...orderIds).all();

            const itemsByOrder = {};
            for (const item of (items || [])) {
                if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = [];
                let imageUrl = null;
                try {
                    const imgs = JSON.parse(item.images || '[]');
                    imageUrl = imgs[0] || null;
                } catch {}
                itemsByOrder[item.order_id].push({
                    product_id: item.product_id,
                    watch_name: item.watch_name,
                    watch_brand: item.watch_brand,
                    quantity: item.quantity,
                    price: item.price,
                    image_url: imageUrl,
                });
            }

            for (const order of orders) {
                order.items = itemsByOrder[order.id] || [];
            }
        }

        return json(orders || []);
    } catch (err) {
        console.error('[orders] List error:', err.message);
        return safeError(500);
    }
}

// ── POST /api/orders — Create order (existing) ──────────────────────────────
const MAX_ITEMS = 50;
const MAX_QUANTITY_PER_ITEM = 100;

export async function onRequestPost({ request, env }) {
    // Orders require an authenticated session — no anonymous order injection
    const { user, response: authError } = await requireAuth(request, env);
    if (authError) return authError;

    try {
        let data;
        try { data = await request.json(); } catch { return safeError(400, 'Invalid JSON'); }

        const { customer_name, items, total_amount } = data;

        // ── Input validation ──────────────────────────────────────────────────
        if (!Array.isArray(items) || items.length === 0) return safeError(400, 'items must be a non-empty array');
        if (items.length > MAX_ITEMS) return safeError(400, `Too many items (max ${MAX_ITEMS})`);
        if (typeof total_amount !== 'number' || total_amount <= 0 || !isFinite(total_amount)) {
            return safeError(400, 'total_amount must be a positive number');
        }
        if (total_amount > 10_000_000) return safeError(400, 'total_amount exceeds limit');

        for (const item of items) {
            if (!item.watch_id || typeof item.watch_id !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(item.watch_id)) {
                return safeError(400, 'Invalid item watch_id');
            }
            if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > MAX_QUANTITY_PER_ITEM) {
                return safeError(400, 'item.quantity must be an integer between 1 and 100');
            }
            if (typeof item.price !== 'number' || item.price < 0 || !isFinite(item.price)) {
                return safeError(400, 'item.price must be a non-negative number');
            }
        }

        // ── Use the authenticated user's ID — never trust client-supplied clientId ──
        const clientId = user.id;
        const orderId  = crypto.randomUUID();
        const queries  = [];

        queries.push(
            env.DB.prepare('INSERT INTO orders (id, client_id, total, status) VALUES (?1, ?2, ?3, ?4)')
                  .bind(orderId, clientId, total_amount, 'pending') // status always 'pending' on creation
        );

        for (const item of items) {
            queries.push(
                env.DB.prepare('INSERT INTO order_items (id, order_id, product_id, quantity, price) VALUES (?1,?2,?3,?4,?5)')
                      .bind(crypto.randomUUID(), orderId, item.watch_id, item.quantity, item.price)
            );
            // Prevent stock going below 0 — WHERE stock >= quantity acts as a guard
            queries.push(
                env.DB.prepare('UPDATE products SET stock = stock - ?1 WHERE id = ?2 AND stock >= ?1')
                      .bind(item.quantity, item.watch_id)
            );
        }

        await env.DB.batch(queries);

        // ── Google Forms webhook (fire-and-forget) ────────────────────────────
        if (env.GOOGLE_FORM_URL) {
            try {
                const watchNames = items.map(i => i.name || i.watch_id).join(', ');
                const quantities = items.map(i => `${i.name || i.watch_id}: ${i.quantity}`).join('\n');
                const formBody   = new URLSearchParams();
                formBody.append(env.FORM_ENTRY_ORDER_ID     || 'entry.1', orderId);
                formBody.append(env.FORM_ENTRY_CLIENT_NAME  || 'entry.2', customer_name?.trim() || '');
                formBody.append(env.FORM_ENTRY_CLIENT_EMAIL || 'entry.3', user.email);
                formBody.append(env.FORM_ENTRY_WATCHES      || 'entry.4', watchNames);
                formBody.append(env.FORM_ENTRY_QUANTITY     || 'entry.5', quantities);
                formBody.append(env.FORM_ENTRY_TOTAL_PRICE  || 'entry.6', total_amount.toString());
                formBody.append(env.FORM_ENTRY_CURRENCY     || 'entry.7', 'USD');
                formBody.append(env.FORM_ENTRY_STATUS       || 'entry.8', 'pending');
                formBody.append(env.FORM_ENTRY_DATE         || 'entry.9', new Date().toISOString().split('T')[0]);
                await fetch(env.GOOGLE_FORM_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: formBody.toString(),
                }).catch(e => console.error('[orders] Google Forms error:', e.message));
            } catch (formErr) {
                console.error('[orders] Google Forms error:', formErr.message);
            }
        }

        console.log(`[audit] Order created: id=${orderId} client=${clientId} total=${total_amount}`);

        return new Response(JSON.stringify({ success: true, orderId }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (err) {
        console.error('[orders] Unexpected error:', err.message);
        return safeError(500);
    }
}

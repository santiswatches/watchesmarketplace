import { requireAdmin, json, safeError, sanitizeString, isValidEmail } from '../../_shared/auth.js';

export async function onRequestGet({ request, env }) {
    const { response: authError } = await requireAdmin(request, env);
    if (authError) return authError;

    try {
        const { results } = await env.DB.prepare(
            `SELECT r.*, p.name as product_name, p.brand as product_brand
             FROM reviews r
             LEFT JOIN products p ON r.product_id = p.id
             ORDER BY r.created_at DESC`
        ).all();

        return json(results || []);
    } catch (err) {
        console.error('[reviews] List error:', err.message);
        return safeError(500);
    }
}

export async function onRequestPost({ request, env }) {
    const { response: authError } = await requireAdmin(request, env);
    if (authError) return authError;

    try {
        let data;
        try { data = await request.json(); } catch { return safeError(400, 'Invalid JSON'); }

        const customer_name = sanitizeString(data.customer_name, 200);
        const customer_email = data.customer_email?.trim();
        const product_id = data.product_id?.trim() || null;
        const order_id = data.order_id?.trim() || null;
        const purchase_date = data.purchase_date?.trim() || null;

        if (!customer_name) return safeError(400, 'customer_name is required');
        if (!customer_email || !isValidEmail(customer_email)) return safeError(400, 'Valid customer_email is required');

        // Validate product_id exists if provided
        if (product_id) {
            const product = await env.DB.prepare('SELECT id FROM products WHERE id = ?1').bind(product_id).first();
            if (!product) return safeError(400, 'Product not found');
        }

        const id = crypto.randomUUID();

        await env.DB.prepare(
            `INSERT INTO reviews (id, order_id, product_id, customer_name, customer_email, status, purchase_date)
             VALUES (?1, ?2, ?3, ?4, ?5, 'pending', ?6)`
        ).bind(id, order_id, product_id, customer_name, customer_email, purchase_date).run();

        const origin = new URL(request.url).origin;
        const review_url = `${origin}/review?token=${id}`;

        console.log(`[audit] Review invitation created: id=${id} email=${customer_email}`);

        return json({ id, review_url }, 201);
    } catch (err) {
        console.error('[reviews] Create error:', err.message);
        return safeError(500);
    }
}

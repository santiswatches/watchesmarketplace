import { json, safeError } from '../../../_shared/auth.js';

export async function onRequestGet({ params, env }) {
    const { productId } = params;
    if (!productId) return safeError(400, 'productId is required');

    try {
        const { results } = await env.DB.prepare(
            `SELECT id, customer_name, rating, testimonial, purchase_date, submitted_at
             FROM reviews
             WHERE product_id = ?1 AND status = 'active'
             ORDER BY submitted_at DESC`
        ).bind(productId).all();

        return json(results || []);
    } catch (err) {
        console.error('[reviews/product] Error:', err.message);
        return safeError(500);
    }
}

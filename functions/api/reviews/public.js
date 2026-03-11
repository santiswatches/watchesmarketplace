import { json, safeError } from '../../_shared/auth.js';

export async function onRequestGet({ env }) {
    try {
        const { results } = await env.DB.prepare(
            `SELECT r.id, r.customer_name, r.rating, r.testimonial, r.purchase_date, r.submitted_at,
                    r.product_id, r.product_name, r.product_brand,
                    p.images as product_images
             FROM reviews r
             LEFT JOIN products p ON r.product_id = p.id
             WHERE r.status = 'active'
             ORDER BY r.submitted_at DESC`
        ).all();

        // Parse product images to get first image URL
        for (const r of results) {
            try {
                const imgs = JSON.parse(r.product_images || '[]');
                r.product_image = imgs[0] || null;
            } catch {
                r.product_image = null;
            }
            delete r.product_images;
        }

        return json(results || []);
    } catch (err) {
        console.error('[reviews/public] Error:', err.message);
        return safeError(500);
    }
}
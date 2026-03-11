import { requireAuth, json, safeError } from '../../_shared/auth.js';

// ── GET /api/favorites — List user's favorites with product details ──────────
export async function onRequestGet({ request, env }) {
    const { user, response: authError } = await requireAuth(request, env);
    if (authError) return authError;

    try {
        const { results } = await env.DB.prepare(`
            SELECT f.id, f.product_id, f.created_at,
                   p.name, p.brand, p.price, p.original_price, p.images, p.category
            FROM favorites f
            JOIN products p ON f.product_id = p.id
            WHERE f.client_id = ?1
            ORDER BY f.created_at DESC
        `).bind(user.id).all();

        const favorites = (results || []).map(row => {
            let image_url = null;
            try {
                const imgs = JSON.parse(row.images || '[]');
                image_url = imgs[0] || null;
            } catch {}
            return {
                id: row.id,
                product_id: row.product_id,
                name: row.name,
                brand: row.brand,
                price: row.price,
                original_price: row.original_price,
                image_url,
                category: row.category,
                created_at: row.created_at,
            };
        });

        return json(favorites);
    } catch (err) {
        console.error('[favorites] List error:', err.message);
        return safeError(500);
    }
}

// ── POST /api/favorites — Add a product to favorites ─────────────────────────
export async function onRequestPost({ request, env }) {
    const { user, response: authError } = await requireAuth(request, env);
    if (authError) return authError;

    try {
        let data;
        try { data = await request.json(); } catch { return safeError(400, 'Invalid JSON'); }

        const { product_id } = data;
        if (!product_id || typeof product_id !== 'string') {
            return safeError(400, 'product_id is required');
        }

        // Check product exists
        const product = await env.DB.prepare('SELECT id FROM products WHERE id = ?1').bind(product_id).first();
        if (!product) return safeError(404, 'Product not found');

        // Check if already favorited
        const existing = await env.DB.prepare(
            'SELECT id FROM favorites WHERE client_id = ?1 AND product_id = ?2'
        ).bind(user.id, product_id).first();

        if (existing) {
            return json({ success: true, id: existing.id, already_exists: true });
        }

        const id = crypto.randomUUID();
        await env.DB.prepare(
            'INSERT INTO favorites (id, client_id, product_id) VALUES (?1, ?2, ?3)'
        ).bind(id, user.id, product_id).run();

        return json({ success: true, id }, 201);
    } catch (err) {
        console.error('[favorites] Add error:', err.message);
        return safeError(500);
    }
}

// ── DELETE /api/favorites — Remove a product from favorites ──────────────────
export async function onRequestDelete({ request, env }) {
    const { user, response: authError } = await requireAuth(request, env);
    if (authError) return authError;

    try {
        const url = new URL(request.url);
        const productId = url.searchParams.get('product_id');
        if (!productId) return safeError(400, 'product_id query param is required');

        await env.DB.prepare(
            'DELETE FROM favorites WHERE client_id = ?1 AND product_id = ?2'
        ).bind(user.id, productId).run();

        return json({ success: true });
    } catch (err) {
        console.error('[favorites] Remove error:', err.message);
        return safeError(500);
    }
}

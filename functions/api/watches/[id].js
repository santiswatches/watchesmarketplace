import { requireAdmin, safeError } from '../../_shared/auth.js';

// ─── GET /api/watches/:id — public ───────────────────────────────────────────
export async function onRequestGet(context) {
    try {
        const { env, params } = context;
        const id = params.id;

        // Basic UUID/ID sanity check — prevent unusual characters from reaching the DB
        if (!id || !/^[a-zA-Z0-9_-]+$/.test(id) || id.length > 128) {
            return safeError(400, 'Invalid id');
        }

        const result = await env.DB
            .prepare('SELECT id, name, brand, price, images, videos, description, specs, tags, material, category, created_date FROM products WHERE id = ?1')
            .bind(id)
            .first();

        if (!result) return safeError(404);

        const watch = {
            ...result,
            image_url: JSON.parse(result.images || '[]')[0] || '/assets/watches/1-rolex-submariner.jpg',
            images: JSON.parse(result.images || '[]'),
            videos: JSON.parse(result.videos || '[]'),
            specs:  JSON.parse(result.specs  || '{}'),
            tags:   JSON.parse(result.tags   || '[]'),
        };

        return new Response(JSON.stringify(watch), { headers: { 'Content-Type': 'application/json' } });
    } catch (err) {
        console.error('[watches GET/:id] error:', err.message);
        return safeError(500);
    }
}

// ─── PUT /api/watches/:id — admin only ───────────────────────────────────────
export async function onRequestPut(context) {
    const { env, params, request } = context;

    const { response: authError } = await requireAdmin(request, env);
    if (authError) return authError;

    try {
        const id = params.id;
        if (!id || !/^[a-zA-Z0-9_-]+$/.test(id) || id.length > 128) return safeError(400, 'Invalid id');

        let body;
        try { body = await request.json(); } catch { return safeError(400, 'Invalid JSON'); }

        const { name, brand, price, images, videos, description, specs, tags, material, category, currency, stock } = body;

        // Required field validation
        if (!name || typeof name !== 'string' || name.trim().length === 0) return safeError(400, 'name is required');
        if (!brand || typeof brand !== 'string' || brand.trim().length === 0) return safeError(400, 'brand is required');
        if (price == null || typeof price !== 'number' || price < 0 || !isFinite(price)) return safeError(400, 'price must be a non-negative number');
        if (name.length > 200) return safeError(400, 'name too long');
        if (brand.length > 100) return safeError(400, 'brand too long');
        if (description && description.length > 5000) return safeError(400, 'description too long');

        const existing = await env.DB.prepare('SELECT id FROM products WHERE id = ?1').bind(id).first();
        if (!existing) return safeError(404);

        await env.DB.prepare(
            'UPDATE products SET name=?1, brand=?2, price=?3, images=?4, videos=?5, description=?6, specs=?7, tags=?8, material=?9, category=?10, currency=?11, stock=?12 WHERE id=?13'
        ).bind(
            name.trim(), brand.trim(), price,
            JSON.stringify(Array.isArray(images) ? images : []),
            JSON.stringify(Array.isArray(videos) ? videos : []),
            description?.trim() || null,
            JSON.stringify(specs && typeof specs === 'object' && !Array.isArray(specs) ? specs : {}),
            JSON.stringify(Array.isArray(tags) ? tags : []),
            material?.trim() || null,
            category?.trim() || null,
            typeof currency === 'string' ? currency.trim() : 'USD',
            typeof stock === 'number' && stock >= 0 ? Math.floor(stock) : 0,
            id
        ).run();

        console.log(`[audit] Watch updated: id=${id} by admin`);

        return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
    } catch (err) {
        console.error('[watches PUT] error:', err.message);
        return safeError(500);
    }
}

// ─── DELETE /api/watches/:id — admin only ────────────────────────────────────
export async function onRequestDelete(context) {
    const { env, params, request } = context;

    const { response: authError } = await requireAdmin(request, env);
    if (authError) return authError;

    try {
        const id = params.id;
        if (!id || !/^[a-zA-Z0-9_-]+$/.test(id) || id.length > 128) return safeError(400, 'Invalid id');

        await env.DB.prepare('DELETE FROM products WHERE id = ?1').bind(id).run();

        console.log(`[audit] Watch deleted: id=${id} by admin`);

        return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
    } catch (err) {
        console.error('[watches DELETE] error:', err.message);
        return safeError(500);
    }
}

import { requireAdmin, safeError } from '../../_shared/auth.js';

// ─── POST /api/watches — admin only ───────────────────────────────────────────
export async function onRequestPost(context) {
    const { env, request } = context;

    const { response: authError } = await requireAdmin(request, env);
    if (authError) return authError;

    try {
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

        const id = crypto.randomUUID();

        await env.DB.prepare(
            'INSERT INTO products (id, name, brand, price, images, videos, description, specs, tags, material, category, currency, stock) VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13)'
        ).bind(
            id,
            name.trim(), brand.trim(), price,
            JSON.stringify(Array.isArray(images) ? images : []),
            JSON.stringify(Array.isArray(videos) ? videos : []),
            description?.trim() || null,
            JSON.stringify(specs && typeof specs === 'object' && !Array.isArray(specs) ? specs : {}),
            JSON.stringify(Array.isArray(tags) ? tags : []),
            material?.trim() || null,
            category?.trim() || null,
            typeof currency === 'string' ? currency.trim() : 'USD',
            typeof stock === 'number' && stock >= 0 ? Math.floor(stock) : 0
        ).run();

        console.log(`[audit] Watch created: id=${id} name="${name.trim()}" by admin`);

        return new Response(JSON.stringify({ id, success: true }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (err) {
        console.error('[watches POST] error:', err.message);
        return safeError(500);
    }
}

// ─── GET /api/watches — public ────────────────────────────────────────────────
export async function onRequestGet(context) {
    try {
        const { env, request } = context;
        const url = new URL(request.url);

        const brand    = url.searchParams.get('brand');
        const category = url.searchParams.get('category');
        const sort_by  = url.searchParams.get('sort_by');

        // Allowlist sort values — never interpolate raw user input into ORDER BY
        const SORT_MAP = {
            price_asc:  'ORDER BY price ASC',
            price_desc: 'ORDER BY price DESC',
            name_asc:   'ORDER BY name ASC',
            newest:     'ORDER BY created_date DESC',
            oldest:     'ORDER BY created_date ASC',
        };
        const orderClause = SORT_MAP[sort_by] ?? 'ORDER BY created_date DESC';

        let query = 'SELECT id, name, brand, price, images, videos, description, specs, tags, material, category, created_date FROM products WHERE 1=1';
        const params = [];

        if (brand && brand !== 'All')    { query += ' AND brand = ?';    params.push(brand.slice(0, 100)); }
        if (category && category !== 'all') { query += ' AND category = ?'; params.push(category.slice(0, 100)); }
        query += ' ' + orderClause;

        const { results } = await env.DB.prepare(query).bind(...params).all();

        const parsed = results.map(row => ({
            ...row,
            image_url: JSON.parse(row.images || '[]')[0] || '/assets/watches/1-rolex-submariner.jpg',
            images: JSON.parse(row.images || '[]'),
            videos: JSON.parse(row.videos || '[]'),
            specs:  JSON.parse(row.specs  || '{}'),
            tags:   JSON.parse(row.tags   || '[]'),
        }));

        return new Response(JSON.stringify(parsed), { headers: { 'Content-Type': 'application/json' } });
    } catch (err) {
        console.error('[watches GET] error:', err.message);
        return safeError(500);
    }
}

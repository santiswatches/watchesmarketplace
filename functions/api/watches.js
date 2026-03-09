import { safeError } from '../_shared/auth.js';

export async function onRequestGet(context) {
    const { request, env } = context;
    const url = new URL(request.url);

    const brand    = url.searchParams.get('brand');
    const category = url.searchParams.get('category');
    const sortBy   = url.searchParams.get('sort_by');

    // Allowlist sort values — never interpolate raw input into ORDER BY
    const SORT_MAP = {
        price_asc:  'ORDER BY price ASC',
        price_desc: 'ORDER BY price DESC',
        time_asc:   'ORDER BY created_date ASC',
        time_desc:  'ORDER BY created_date DESC',
    };
    const orderClause = SORT_MAP[sortBy] ?? 'ORDER BY created_date DESC';

    // Explicit column list — no SELECT * to avoid leaking future sensitive columns
    let query = 'SELECT id, name, brand, price, images, videos, description, specs, tags, material, category, created_date FROM products WHERE 1=1';
    const params = [];

    if (brand)    { query += ' AND brand = ?';    params.push(brand.slice(0, 100)); }
    if (category) { query += ' AND category = ?'; params.push(category.slice(0, 100)); }
    query += ' ' + orderClause;

    try {
        const { results } = await env.DB.prepare(query).bind(...params).all();
        return Response.json(results);
    } catch (err) {
        console.error('[watches.js GET] error:', err.message);
        return safeError(500);
    }
}

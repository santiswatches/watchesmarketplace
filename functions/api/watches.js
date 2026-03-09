export async function onRequestGet(context) {
    const { request, env } = context;
    const url = new URL(request.url);

    // Extract query parameters for filtering and sorting
    const brand = url.searchParams.get('brand');
    const category = url.searchParams.get('category');
    const sortBy = url.searchParams.get('sort_by'); // 'price_asc', 'price_desc', 'time_asc', 'time_desc'

    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (brand) {
        query += ' AND brand = ?';
        params.push(brand);
    }

    if (category) {
        query += ' AND category = ?';
        params.push(category);
    }

    if (sortBy === 'price_asc') {
        query += ' ORDER BY price ASC';
    } else if (sortBy === 'price_desc') {
        query += ' ORDER BY price DESC';
    } else if (sortBy === 'time_asc') {
        query += ' ORDER BY created_at ASC';
    } else if (sortBy === 'time_desc') {
        query += ' ORDER BY created_at DESC';
    }

    try {
        const { results } = await env.DB.prepare(query).bind(...params).all();
        return Response.json(results);
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}

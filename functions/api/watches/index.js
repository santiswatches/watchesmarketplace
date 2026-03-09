export async function onRequestGet(context) {
    try {
        const { env, request } = context;
        const url = new URL(request.url);

        const brand = url.searchParams.get('brand');
        const category = url.searchParams.get('category');
        const sort_by = url.searchParams.get('sort_by');

        let query = 'SELECT id, name, brand, price, images, videos, description, specs, tags, material, category, created_date FROM Products WHERE 1=1';
        let params = [];
        let paramIndex = 1;

        if (brand && brand !== 'All') {
            query += ` AND brand = ?${paramIndex++}`;
            params.push(brand);
        }

        if (category && category !== 'all') {
            query += ` AND category = ?${paramIndex++}`;
            params.push(category);
        }

        if (sort_by) {
            if (sort_by === 'price_asc') {
                query += ' ORDER BY price ASC';
            } else if (sort_by === 'price_desc') {
                query += ' ORDER BY price DESC';
            } else if (sort_by === 'name_asc') {
                query += ' ORDER BY name ASC';
            } else if (sort_by === 'newest') {
                query += ' ORDER BY created_date DESC';
            } else if (sort_by === 'oldest') {
                query += ' ORDER BY created_date ASC';
            } else {
                query += ' ORDER BY created_date DESC';
            }
        } else {
            query += ' ORDER BY created_date DESC';
        }

        const { results } = await env.DB.prepare(query).bind(...params).all();

        // Parse JSON fields (images, videos, specs, tags) back into JS arrays/objects
        const parsedResults = results.map(row => {
            return {
                ...row,
                image_url: JSON.parse(row.images || '[]')[0] || "/assets/watches/1-rolex-submariner.jpg", // legacy property for the frontend
                images: JSON.parse(row.images || '[]'),
                videos: JSON.parse(row.videos || '[]'),
                specs: JSON.parse(row.specs || '{}'),
                tags: JSON.parse(row.tags || '[]'),
            };
        });

        return new Response(JSON.stringify(parsedResults), {
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}

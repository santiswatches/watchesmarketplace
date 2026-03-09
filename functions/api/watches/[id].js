export async function onRequestGet(context) {
    try {
        const { env, params } = context;
        const id = params.id;

        const query = 'SELECT id, name, brand, price, images, videos, description, specs, tags, material, category, created_date FROM Products WHERE id = ?1';
        const result = await env.DB.prepare(query).bind(id).first();

        if (!result) {
            return new Response(JSON.stringify({ error: 'Watch not found' }), {
                status: 404,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        const watch = {
            ...result,
            image_url: JSON.parse(result.images || '[]')[0] || "/assets/watches/1-rolex-submariner.jpg", // legacy property for the frontend
            images: JSON.parse(result.images || '[]'),
            videos: JSON.parse(result.videos || '[]'),
            specs: JSON.parse(result.specs || '{}'),
            tags: JSON.parse(result.tags || '[]'),
        };

        return new Response(JSON.stringify(watch), {
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

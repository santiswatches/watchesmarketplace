export async function onRequestPost({ request, env }) {
    try {
        const data = await request.json();
        const { products, total } = data;

        // In a real app, you would retrieve the client_id from the session (JWT).
        // Extract token from cookie
        const cookies = request.headers.get("Cookie") || "";
        let clientId = "client-admin"; // Fallback for now

        // Very basic transaction implementation: D1 supports batching
        const orderId = crypto.randomUUID();

        const queries = [];

        // 1. Insert Order
        queries.push(
            env.DB.prepare('INSERT INTO orders (id, client_id, total, status) VALUES (?, ?, ?, ?)').bind(orderId, clientId, total, 'pending')
        );

        // 2. Insert Order Items and reduce stock
        for (const item of products) {
            const orderItemId = crypto.randomUUID();
            queries.push(
                env.DB.prepare('INSERT INTO order_items (id, order_id, product_id, quantity, price) VALUES (?, ?, ?, ?, ?)').bind(orderItemId, orderId, item.id, item.quantity || 1, item.price)
            );

            queries.push(
                env.DB.prepare('UPDATE products SET stock = stock - ? WHERE id = ?').bind(item.quantity || 1, item.id)
            );
        }

        // Execute batch
        await env.DB.batch(queries);

        return Response.json({ success: true, orderId: orderId, total: total });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}

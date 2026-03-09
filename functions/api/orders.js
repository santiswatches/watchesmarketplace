export async function onRequestPost({ request, env }) {
    try {
        const data = await request.json();
        // Frontend Checkout.jsx sends:
        // { customer_email, customer_name, items, total_amount, status, paypal_order_id, shipping_address }
        const { customer_email, customer_name, items, total_amount, status, shipping_address } = data;

        // In a real app, you would retrieve the client_id from the session (JWT).
        // For now, we use the customer_email from the payload or fallback to a default
        const clientId = customer_email || "guest-" + Date.now();

        // D1 supports batching
        const orderId = crypto.randomUUID();

        const queries = [];

        // 1. Insert Order
        queries.push(
            env.DB.prepare('INSERT INTO orders (id, client_id, total, status) VALUES (?, ?, ?, ?)').bind(orderId, clientId, total_amount, status || 'pending')
        );

        // 2. Insert Order Items and reduce stock
        if (items && Array.isArray(items)) {
            for (const item of items) {
                const orderItemId = crypto.randomUUID();
                queries.push(
                    env.DB.prepare('INSERT INTO order_items (id, order_id, product_id, quantity, price) VALUES (?, ?, ?, ?, ?)').bind(orderItemId, orderId, item.watch_id, item.quantity || 1, item.price)
                );

                queries.push(
                    env.DB.prepare('UPDATE products SET stock = stock - ? WHERE id = ?').bind(item.quantity || 1, item.watch_id)
                );
            }
        }

        // Execute batch
        await env.DB.batch(queries);

        // 3. Google Forms Webhook Automation
        if (env.GOOGLE_FORM_URL) {
            try {
                // Parse items into readable strings for Google Sheets
                const watchesPurchased = items?.map(item => item.name).join(", ") || "";
                const quantities = items?.map(item => `${item.name}: ${item.quantity || 1}`).join("\n") || "";

                const formBody = new URLSearchParams();

                // Use environment variables for the Google Form entry IDs, fallback to placeholders string
                formBody.append(env.FORM_ENTRY_ORDER_ID || 'entry.xxxxxx1', orderId);
                formBody.append(env.FORM_ENTRY_CLIENT_NAME || 'entry.xxxxxx2', customer_name || "");
                formBody.append(env.FORM_ENTRY_CLIENT_EMAIL || 'entry.xxxxxx3', customer_email || "");
                formBody.append(env.FORM_ENTRY_WATCHES || 'entry.xxxxxx4', watchesPurchased);
                formBody.append(env.FORM_ENTRY_QUANTITY || 'entry.xxxxxx5', quantities);
                formBody.append(env.FORM_ENTRY_TOTAL_PRICE || 'entry.xxxxxx6', total_amount ? total_amount.toString() : "0");
                formBody.append(env.FORM_ENTRY_CURRENCY || 'entry.xxxxxx7', 'USD');
                formBody.append(env.FORM_ENTRY_STATUS || 'entry.xxxxxx8', status || 'pending');
                formBody.append(env.FORM_ENTRY_DATE || 'entry.xxxxxx9', new Date().toISOString().split('T')[0]);

                // Perform the POST request to Google Forms without blocking the response
                const formResponsePromise = fetch(env.GOOGLE_FORM_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: formBody.toString()
                }).catch(err => {
                    console.error("Failed to submit to Google Form:", err);
                });

                // Standard way to ensure async operations complete if the worker returns
                // (Depends on if context is available, but making the fetch directly works in most cases here)
                // We're deliberately just firing and not strictly awaiting it to avoid slowing down checkout,
                // or we await it depending on preference. Awaiting it so we can log:
                await formResponsePromise;

            } catch (formErr) {
                console.error("Google Forms Automation Error:", formErr);
                // We DO NOT throw the error here because the order was successfully saved in our DB.
            }
        }

        return Response.json({ success: true, orderId: orderId, total: total_amount });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}

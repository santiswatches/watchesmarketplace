import bcrypt from 'bcryptjs';

export async function onRequestPost({ request, env }) {
    try {
        const data = await request.json();
        const { email, password, name, phone } = data;

        if (!email || !password || !name) {
            return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
        }

        // Check if user exists
        const existing = await env.DB.prepare('SELECT id FROM clients WHERE email = ?').bind(email).first();
        if (existing) {
            return new Response(JSON.stringify({ error: "Email already in use" }), { status: 409 });
        }

        // Hash password
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);
        const clientId = crypto.randomUUID();

        // Insert to D1
        await env.DB.prepare('INSERT INTO clients (id, email, name, password_hash, phone, role) VALUES (?, ?, ?, ?, ?, ?)')
            .bind(clientId, email, name, hash, phone || '', 'user')
            .run();

        return Response.json({ success: true, clientId, email, name });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}

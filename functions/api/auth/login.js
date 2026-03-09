import bcrypt from 'bcryptjs';
import jwt from '@tsndr/cloudflare-worker-jwt';
import cookie from 'cookie';

export async function onRequestPost({ request, env }) {
    try {
        const data = await request.json();
        const { email, password } = data;

        if (!email || !password) {
            return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
        }

        // Fetch user
        const client = await env.DB.prepare('SELECT * FROM clients WHERE email = ?').bind(email).first();
        if (!client) {
            return new Response(JSON.stringify({ error: "Invalid credentials" }), { status: 401 });
        }

        // Check password
        const valid = bcrypt.compareSync(password, client.password_hash);
        if (!valid) {
            return new Response(JSON.stringify({ error: "Invalid credentials" }), { status: 401 });
        }

        // Generate JWT
        const token = await jwt.sign({
            id: client.id,
            email: client.email,
            name: client.name,
            role: client.role
        }, env.JWT_SECRET || 'secret123'); // Should use a secret from environment variables

        // Set HttpOnly cookie
        const serializedCookie = cookie.serialize('auth_token', token, {
            httpOnly: true,
            secure: new URL(request.url).protocol === 'https:',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: '/'
        });

        return new Response(JSON.stringify({ success: true, user: { id: client.id, email: client.email, name: client.name, role: client.role } }), {
            headers: {
                'Content-Type': 'application/json',
                'Set-Cookie': serializedCookie
            }
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}

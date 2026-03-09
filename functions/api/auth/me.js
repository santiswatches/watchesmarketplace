import jwt from '@tsndr/cloudflare-worker-jwt';
import cookie from 'cookie';

export async function onRequestGet({ request, env }) {
    try {
        const cookieHeader = request.headers.get("Cookie");
        if (!cookieHeader) {
            return new Response(JSON.stringify({ user: null }), { status: 401 });
        }

        const cookies = cookie.parse(cookieHeader);
        const token = cookies.auth_token;

        if (!token) {
            return new Response(JSON.stringify({ user: null }), { status: 401 });
        }

        // Verify JWT
        const isValid = await jwt.verify(token, env.JWT_SECRET || 'secret123');
        if (!isValid) {
            return new Response(JSON.stringify({ user: null }), { status: 401 });
        }

        const { payload } = jwt.decode(token);
        return Response.json({ user: payload });
    } catch (err) {
        return new Response(JSON.stringify({ user: null }), { status: 401 });
    }
}

import jwt from '@tsndr/cloudflare-worker-jwt';
import cookie from 'cookie';

export async function onRequestGet({ request, env }) {
    try {
        const cookieHeader = request.headers.get("Cookie");
        if (!cookieHeader) {
            return Response.json({ user: null });
        }

        const cookies = cookie.parse(cookieHeader);
        const token = cookies.auth_token;

        if (!token) {
            return Response.json({ user: null });
        }

        // Verify JWT
        const isValid = await jwt.verify(token, env.JWT_SECRET || 'secret123');
        if (!isValid) {
            return Response.json({ user: null });
        }

        const { payload } = jwt.decode(token);
        return Response.json({ user: payload });
    } catch (err) {
        return Response.json({ user: null });
    }
}

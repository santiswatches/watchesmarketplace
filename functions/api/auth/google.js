import jwt from '@tsndr/cloudflare-worker-jwt';
import cookie from 'cookie';
import { ADMIN_EMAILS, safeError } from '../../_shared/auth.js';

export async function onRequestPost({ request, env }) {
    try {
        if (!env.JWT_SECRET) {
            console.error('[google] JWT_SECRET is not configured');
            return safeError(500);
        }

        let body;
        try {
            body = await request.json();
        } catch {
            return safeError(400, 'Invalid JSON');
        }

        const { access_token } = body;
        if (!access_token || typeof access_token !== 'string') {
            return safeError(400, 'Missing access_token');
        }

        // Verify token with Google and get user info
        const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${access_token}` },
        });

        if (!googleRes.ok) {
            return safeError(401, 'Invalid Google token');
        }

        const googleUser = await googleRes.json();
        const { email, name, sub: googleId } = googleUser;

        if (!email) return safeError(400, 'Google account has no email');

        const normalizedEmail = email.toLowerCase().trim();

        // Find or create user
        let client = await env.DB
            .prepare('SELECT id, email, name, role FROM clients WHERE email = ?1')
            .bind(normalizedEmail)
            .first();

        if (!client) {
            const clientId = crypto.randomUUID();
            const displayName = name?.trim() || normalizedEmail.split('@')[0];
            await env.DB
                .prepare('INSERT INTO clients (id, email, name, password_hash, role) VALUES (?1, ?2, ?3, ?4, ?5)')
                .bind(clientId, normalizedEmail, displayName, `google:${googleId}`, 'user')
                .run();
            client = { id: clientId, email: normalizedEmail, name: displayName, role: 'user' };
        }

        const role = ADMIN_EMAILS.includes(client.email) ? 'admin' : (client.role || 'user');

        const token = await jwt.sign(
            {
                id: client.id,
                email: client.email,
                name: client.name || client.email.split('@')[0],
                role,
                exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
            },
            env.JWT_SECRET
        );

        const isSecure = new URL(request.url).protocol === 'https:';
        const serializedCookie = cookie.serialize('auth_token', token, {
            httpOnly: true,
            secure: isSecure,
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 7,
            path: '/',
        });

        return new Response(JSON.stringify({
            success: true,
            user: { id: client.id, email: client.email, name: client.name, role },
        }), {
            headers: { 'Content-Type': 'application/json', 'Set-Cookie': serializedCookie },
        });
    } catch (err) {
        console.error('[google] Unexpected error:', err.message);
        return safeError(500);
    }
}

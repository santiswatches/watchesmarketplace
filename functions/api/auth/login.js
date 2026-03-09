import bcrypt from 'bcryptjs';
import jwt from '@tsndr/cloudflare-worker-jwt';
import cookie from 'cookie';
import { ADMIN_EMAILS, isValidEmail, safeError } from '../../_shared/auth.js';

export async function onRequestPost({ request, env }) {
    try {
        // JWT_SECRET must be configured — fail closed, never use a fallback
        if (!env.JWT_SECRET) {
            console.error('[login] JWT_SECRET is not configured');
            return safeError(500);
        }

        let body;
        try {
            body = await request.json();
        } catch {
            return safeError(400, 'Invalid JSON');
        }

        const { email, password } = body;

        // Input validation
        if (!email || !password) return safeError(400, 'Missing required fields');
        if (!isValidEmail(email)) return safeError(400, 'Invalid email format');
        if (typeof password !== 'string' || password.length < 1 || password.length > 128) {
            return safeError(400, 'Invalid password');
        }

        // Fetch user — parameterised query, only the columns we need
        const client = await env.DB
            .prepare('SELECT id, email, name, password_hash, role FROM clients WHERE email = ?1')
            .bind(email.toLowerCase().trim())
            .first();

        // Always run bcrypt compare to prevent timing-based user enumeration
        const hashToCheck = client?.password_hash ?? '$2a$12$placeholderHashToPreventTimingAttack000000000000000000';
        const valid = bcrypt.compareSync(password, hashToCheck);

        if (!client || !valid) {
            // Generic message — do not reveal whether email exists
            return safeError(401, 'Invalid credentials');
        }

        const role = ADMIN_EMAILS.includes(client.email) ? 'admin' : (client.role || 'user');

        // Sign JWT — embed exp in payload (library-agnostic, works with @tsndr/cloudflare-worker-jwt)
        const token = await jwt.sign(
            {
                id: client.id,
                email: client.email,
                name: client.name || client.email.split('@')[0],
                role,
                exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
            },
            env.JWT_SECRET
        );

        const isSecure = new URL(request.url).protocol === 'https:';
        const serializedCookie = cookie.serialize('auth_token', token, {
            httpOnly: true,
            secure: isSecure,
            sameSite: 'strict',   // Upgraded from lax → strict for CSRF protection
            maxAge: 60 * 60 * 24 * 7,
            path: '/',
        });

        // Log admin logins for audit trail
        if (role === 'admin') {
            console.log(`[audit] Admin login: ${client.email} at ${new Date().toISOString()}`);
        }

        return new Response(JSON.stringify({
            success: true,
            user: { id: client.id, email: client.email, name: client.name || client.email.split('@')[0], role },
        }), {
            headers: { 'Content-Type': 'application/json', 'Set-Cookie': serializedCookie },
        });
    } catch (err) {
        console.error('[login] Unexpected error:', err.message);
        return safeError(500);
    }
}

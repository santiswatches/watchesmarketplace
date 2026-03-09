import bcrypt from 'bcryptjs';
import { isValidEmail, safeError } from '../../_shared/auth.js';

export async function onRequestPost({ request, env }) {
    try {
        let body;
        try {
            body = await request.json();
        } catch {
            return safeError(400, 'Invalid JSON');
        }

        const { email, password, name, phone } = body;

        // Input validation
        if (!email || !password) return safeError(400, 'Missing required fields');
        if (!isValidEmail(email)) return safeError(400, 'Invalid email format');
        if (typeof password !== 'string' || password.length < 8) {
            return safeError(400, 'Password must be at least 8 characters');
        }
        if (password.length > 128) return safeError(400, 'Password too long');
        if (name && (typeof name !== 'string' || name.length > 100)) {
            return safeError(400, 'Invalid name');
        }
        if (phone && (typeof phone !== 'string' || phone.length > 30)) {
            return safeError(400, 'Invalid phone');
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Check if user exists — parameterised
        const existing = await env.DB
            .prepare('SELECT id FROM clients WHERE email = ?1')
            .bind(normalizedEmail)
            .first();
        if (existing) return safeError(409, 'Email already in use');

        const hash = await bcrypt.hash(password, 10); // cost 10 — safe for Workers (12 blocks the event loop)
        const clientId = crypto.randomUUID();

        await env.DB
            .prepare('INSERT INTO clients (id, email, name, password_hash, phone, role) VALUES (?1, ?2, ?3, ?4, ?5, ?6)')
            .bind(clientId, normalizedEmail, name?.trim() || normalizedEmail.split('@')[0], hash, phone?.trim() || null, 'user')
            .run();

        return new Response(JSON.stringify({ success: true }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (err) {
        console.error('[register] Unexpected error:', err.message);
        return safeError(500);
    }
}

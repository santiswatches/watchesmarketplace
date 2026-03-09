import jwt from '@tsndr/cloudflare-worker-jwt';
import cookie from 'cookie';

export const ADMIN_EMAILS = [
    "admin112874@chronoluxe.com",
    "uberuhanunal@gmail.com",
    "templateseverlasting@gmail.com",
    "santis.watches.managment@gmail.com",
];

/**
 * Parse and verify the auth_token JWT from the request cookie.
 * Returns the decoded payload on success, null on any failure.
 * Fails CLOSED — if JWT_SECRET is not configured, no one is authenticated.
 */
export async function verifyAuth(request, env) {
    const secret = env.JWT_SECRET;
    if (!secret) return null; // Fail closed — no secret = no access

    const cookieHeader = request.headers.get('Cookie');
    if (!cookieHeader) return null;

    const cookies = cookie.parse(cookieHeader);
    const token = cookies.auth_token;
    if (!token) return null;

    try {
        const isValid = await jwt.verify(token, secret);
        if (!isValid) return null;
        const { payload } = jwt.decode(token);
        return payload;
    } catch {
        return null;
    }
}

/**
 * Require a valid session. Returns { user } or sends a 401 response.
 */
export async function requireAuth(request, env) {
    const user = await verifyAuth(request, env);
    if (!user) {
        return {
            user: null,
            response: json({ error: 'Unauthorized' }, 401),
        };
    }
    return { user, response: null };
}

/**
 * Require an admin session. Returns { user } or sends 401/403 response.
 */
export async function requireAdmin(request, env) {
    const { user, response } = await requireAuth(request, env);
    if (response) return { user: null, response };

    const isAdmin = user.role === 'admin' || ADMIN_EMAILS.includes(user.email);
    if (!isAdmin) {
        return {
            user: null,
            response: json({ error: 'Forbidden' }, 403),
        };
    }
    return { user, response: null };
}

/**
 * Return a JSON response — never expose internal error details on 5xx.
 */
export function json(body, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}

export function safeError(status = 500, detail = null) {
    const messages = {
        400: detail || 'Bad request',
        401: 'Unauthorized',
        403: 'Forbidden',
        404: 'Not found',
        409: detail || 'Conflict',
        413: detail || 'Payload too large',
        415: detail || 'Unsupported media type',
        500: 'Internal server error',
    };
    return json({ error: messages[status] ?? 'Error' }, status);
}

/**
 * Validate and sanitise a plain string field.
 * Returns the trimmed value, or null if invalid.
 */
export function sanitizeString(value, maxLength = 1000) {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    if (trimmed.length === 0 || trimmed.length > maxLength) return null;
    return trimmed;
}

/** Basic email format check */
export function isValidEmail(email) {
    return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

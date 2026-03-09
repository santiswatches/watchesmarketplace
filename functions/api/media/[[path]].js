import { safeError } from '../../_shared/auth.js';

export async function onRequestGet(context) {
    try {
        const { env, params } = context;
        const segments = Array.isArray(params.path) ? params.path : [params.path];

        // Path traversal protection — reject any segment that is or contains '..'
        if (segments.some(s => s === '..' || s.includes('..') || s.includes('\0'))) {
            return safeError(400, 'Invalid path');
        }

        // Allowlist characters in each segment
        if (segments.some(s => !/^[a-zA-Z0-9._-]+$/.test(s))) {
            return safeError(400, 'Invalid path');
        }

        const key = segments.join('/');

        const object = await env.BUCKET.get(key);
        if (!object) return safeError(404);

        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set('etag', object.httpEtag);
        headers.set('cache-control', 'public, max-age=31536000, immutable');
        // Prevent browser from executing uploaded content as scripts
        headers.set('x-content-type-options', 'nosniff');
        headers.set('content-disposition', 'inline');

        return new Response(object.body, { headers });
    } catch (err) {
        console.error('[media] error:', err.message);
        return safeError(500);
    }
}

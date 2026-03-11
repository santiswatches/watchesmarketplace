import { requireAdmin, safeError } from '../_shared/auth.js';

const IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const VIDEO_MIME_TYPES = new Set(['video/mp4', 'video/webm', 'video/quicktime']);
const ALLOWED_MIME_TYPES = new Set([...IMAGE_MIME_TYPES, ...VIDEO_MIME_TYPES]);

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
const VIDEO_EXTENSIONS = new Set(['.mp4', '.webm', '.mov']);
const ALLOWED_EXTENSIONS = new Set([...IMAGE_EXTENSIONS, ...VIDEO_EXTENSIONS]);

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;  // 10 MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100 MB

export async function onRequestPost(context) {
    const { env, request } = context;

    // Admin-only — anyone who can upload controls what appears on the store
    const { response: authError } = await requireAdmin(request, env);
    if (authError) return authError;

    try {
        let formData;
        try {
            formData = await request.formData();
        } catch {
            return safeError(400, 'Invalid form data');
        }

        const file = formData.get('file');
        if (!file || typeof file === 'string') return safeError(400, 'No file provided');

        // MIME type allowlist — validate server-side, not from client header alone
        const mime = file.type?.toLowerCase();
        if (!ALLOWED_MIME_TYPES.has(mime)) {
            return safeError(415, 'Only JPEG, PNG, WebP, GIF images and MP4, WebM, MOV videos are allowed');
        }

        // Extension allowlist — double-check against the declared MIME
        const originalName = file.name ?? '';
        const ext = ('.' + originalName.split('.').pop()).toLowerCase();
        if (!ALLOWED_EXTENSIONS.has(ext)) {
            return safeError(415, 'Invalid file extension');
        }

        // Determine media type and apply appropriate size limit
        const isVideo = VIDEO_MIME_TYPES.has(mime);
        const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
        if (file.size > maxSize) {
            return safeError(413, `File exceeds ${isVideo ? '100' : '10'} MB limit`);
        }

        // Use UUID for the stored key — never trust the original filename in the path
        const safeExt = ext; // already validated above
        const prefix = isVideo ? 'watches/videos' : 'watches';
        const key = `${prefix}/${crypto.randomUUID()}${safeExt}`;

        await env.BUCKET.put(key, file.stream(), {
            httpMetadata: { contentType: mime },
        });

        console.log(`[audit] ${isVideo ? 'Video' : 'Image'} uploaded: ${key} by admin`);

        return new Response(JSON.stringify({
            file_url: `/api/media/${key}`,
            media_type: isVideo ? 'video' : 'image',
        }), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (err) {
        console.error('[upload] Unexpected error:', err.message);
        return safeError(500);
    }
}

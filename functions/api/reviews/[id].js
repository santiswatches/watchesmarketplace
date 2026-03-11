import { requireAdmin, json, safeError, sanitizeString } from '../../_shared/auth.js';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function onRequestGet({ params, env }) {
    const { id } = params;
    if (!id || !UUID_RE.test(id)) return safeError(404);

    try {
        const review = await env.DB.prepare(
            `SELECT r.id, r.customer_name, r.customer_email, r.product_id, r.purchase_date, r.status,
                    p.name as product_name, p.brand as product_brand
             FROM reviews r
             LEFT JOIN products p ON r.product_id = p.id
             WHERE r.id = ?1`
        ).bind(id).first();

        if (!review) return safeError(404);
        if (review.status !== 'pending') {
            return json({ error: 'Review already submitted' }, 410);
        }

        return json({
            id: review.id,
            customer_name: review.customer_name,
            customer_email: review.customer_email,
            product_id: review.product_id,
            product_name: review.product_name,
            product_brand: review.product_brand,
            purchase_date: review.purchase_date,
        });
    } catch (err) {
        console.error('[reviews] Get error:', err.message);
        return safeError(500);
    }
}

export async function onRequestPut({ params, request, env }) {
    const { id } = params;
    if (!id || !UUID_RE.test(id)) return safeError(404);

    try {
        let data;
        try { data = await request.json(); } catch { return safeError(400, 'Invalid JSON'); }

        const { rating, testimonial, customer_name, purchase_date } = data;

        // Validate rating
        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
            return safeError(400, 'rating must be an integer between 1 and 5');
        }

        // Validate testimonial
        const cleanTestimonial = sanitizeString(testimonial, 2000);
        if (!cleanTestimonial) return safeError(400, 'testimonial is required (max 2000 characters)');

        // Optional fields
        const cleanName = customer_name ? sanitizeString(customer_name, 200) : null;
        const cleanDate = purchase_date?.trim() || null;

        // Conditional update — only if still pending (prevents double-submit)
        const result = await env.DB.prepare(
            `UPDATE reviews
             SET rating = ?1, testimonial = ?2, status = 'submitted', submitted_at = CURRENT_TIMESTAMP,
                 customer_name = COALESCE(?3, customer_name),
                 purchase_date = COALESCE(?4, purchase_date)
             WHERE id = ?5 AND status = 'pending'`
        ).bind(rating, cleanTestimonial, cleanName, cleanDate, id).run();

        if (result.meta.changes === 0) {
            // Check if it exists at all
            const exists = await env.DB.prepare('SELECT status FROM reviews WHERE id = ?1').bind(id).first();
            if (!exists) return safeError(404);
            return json({ error: 'Review already submitted' }, 410);
        }

        console.log(`[audit] Review submitted: id=${id} rating=${rating}`);

        return json({ success: true });
    } catch (err) {
        console.error('[reviews] Submit error:', err.message);
        return safeError(500);
    }
}

// ── PATCH /api/reviews/:id — Admin: edit review fields and/or change status ──
export async function onRequestPatch({ params, request, env }) {
    const { response: authError } = await requireAdmin(request, env);
    if (authError) return authError;

    const { id } = params;
    if (!id || !UUID_RE.test(id)) return safeError(404);

    try {
        let data;
        try { data = await request.json(); } catch { return safeError(400, 'Invalid JSON'); }

        const updates = [];
        const bindings = [];
        let bindIdx = 1;

        // Status transition
        const VALID_STATUSES = ['pending', 'submitted', 'active', 'inactive'];
        if (data.status !== undefined) {
            if (!VALID_STATUSES.includes(data.status)) return safeError(400, 'Invalid status');
            updates.push(`status = ?${bindIdx}`);
            bindings.push(data.status);
            bindIdx++;
        }

        // Editable fields
        if (data.rating !== undefined) {
            if (!Number.isInteger(data.rating) || data.rating < 1 || data.rating > 5) {
                return safeError(400, 'rating must be 1-5');
            }
            updates.push(`rating = ?${bindIdx}`);
            bindings.push(data.rating);
            bindIdx++;
        }

        if (data.testimonial !== undefined) {
            const clean = sanitizeString(data.testimonial, 2000);
            if (!clean) return safeError(400, 'Invalid testimonial');
            updates.push(`testimonial = ?${bindIdx}`);
            bindings.push(clean);
            bindIdx++;
        }

        if (data.customer_name !== undefined) {
            const clean = sanitizeString(data.customer_name, 200);
            if (clean) {
                updates.push(`customer_name = ?${bindIdx}`);
                bindings.push(clean);
                bindIdx++;
            }
        }

        if (updates.length === 0) return safeError(400, 'No fields to update');

        bindings.push(id);
        const result = await env.DB.prepare(
            `UPDATE reviews SET ${updates.join(', ')} WHERE id = ?${bindIdx}`
        ).bind(...bindings).run();

        if (result.meta.changes === 0) return safeError(404);

        console.log(`[audit] Review updated by admin: id=${id} fields=${updates.length}`);
        return json({ success: true });
    } catch (err) {
        console.error('[reviews] Patch error:', err.message);
        return safeError(500);
    }
}

export async function onRequestDelete({ params, request, env }) {
    const { response: authError } = await requireAdmin(request, env);
    if (authError) return authError;

    const { id } = params;
    if (!id || !UUID_RE.test(id)) return safeError(404);

    try {
        const result = await env.DB.prepare('DELETE FROM reviews WHERE id = ?1').bind(id).run();
        if (result.meta.changes === 0) return safeError(404);

        console.log(`[audit] Review deleted: id=${id}`);
        return json({ success: true });
    } catch (err) {
        console.error('[reviews] Delete error:', err.message);
        return safeError(500);
    }
}

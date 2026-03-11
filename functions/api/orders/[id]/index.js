import { requireAdmin, json, safeError, sanitizeString } from '../../../_shared/auth.js';

const VALID_STATUSES = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];

export async function onRequestPatch({ params, request, env }) {
    const { response: authError } = await requireAdmin(request, env);
    if (authError) return authError;

    const orderId = params.id;
    if (!orderId) return safeError(400, 'Order ID is required');

    try {
        let data;
        try { data = await request.json(); } catch { return safeError(400, 'Invalid JSON'); }

        const updates = [];
        const bindings = [];
        let idx = 1;

        if (data.status !== undefined) {
            if (!VALID_STATUSES.includes(data.status)) {
                return safeError(400, `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`);
            }
            updates.push(`status = ?${idx}`);
            bindings.push(data.status);
            idx++;
        }

        if (data.customer_name !== undefined) {
            updates.push(`client_id = (SELECT id FROM clients WHERE name = ?${idx} LIMIT 1)`);
            bindings.push(sanitizeString(data.customer_name));
            idx++;
        }

        if (data.total !== undefined) {
            if (typeof data.total !== 'number' || data.total < 0) {
                return safeError(400, 'Total must be a non-negative number');
            }
            updates.push(`total = ?${idx}`);
            bindings.push(data.total);
            idx++;
        }

        if (updates.length === 0) return safeError(400, 'No valid fields to update');

        bindings.push(orderId);
        const query = `UPDATE orders SET ${updates.join(', ')} WHERE id = ?${idx}`;
        await env.DB.prepare(query).bind(...bindings).run();

        console.log(`[audit] Order updated: id=${orderId} fields=${updates.length}`);
        return json({ success: true });
    } catch (err) {
        console.error('[orders/patch] Error:', err.message);
        return safeError(500);
    }
}

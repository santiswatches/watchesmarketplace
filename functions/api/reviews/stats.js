import { json, safeError } from '../../_shared/auth.js';

export async function onRequestGet({ env }) {
    try {
        const row = await env.DB.prepare(
            `SELECT COUNT(*) as count, ROUND(AVG(rating), 1) as average
             FROM reviews WHERE status = 'active'`
        ).first();

        return json({
            count: row?.count || 0,
            average: row?.average || 0,
        });
    } catch (err) {
        console.error('[reviews/stats] Error:', err.message);
        return safeError(500);
    }
}

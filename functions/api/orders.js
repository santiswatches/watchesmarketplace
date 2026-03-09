import { requireAuth, safeError } from '../_shared/auth.js';

const MAX_ITEMS = 50;
const MAX_QUANTITY_PER_ITEM = 100;

export async function onRequestPost({ request, env }) {
    // Orders require an authenticated session — no anonymous order injection
    const { user, response: authError } = await requireAuth(request, env);
    if (authError) return authError;

    try {
        let data;
        try { data = await request.json(); } catch { return safeError(400, 'Invalid JSON'); }

        const { customer_name, items, total_amount } = data;

        // ── Input validation ──────────────────────────────────────────────────
        if (!Array.isArray(items) || items.length === 0) return safeError(400, 'items must be a non-empty array');
        if (items.length > MAX_ITEMS) return safeError(400, `Too many items (max ${MAX_ITEMS})`);
        if (typeof total_amount !== 'number' || total_amount <= 0 || !isFinite(total_amount)) {
            return safeError(400, 'total_amount must be a positive number');
        }
        if (total_amount > 10_000_000) return safeError(400, 'total_amount exceeds limit');

        for (const item of items) {
            if (!item.watch_id || typeof item.watch_id !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(item.watch_id)) {
                return safeError(400, 'Invalid item watch_id');
            }
            if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > MAX_QUANTITY_PER_ITEM) {
                return safeError(400, 'item.quantity must be an integer between 1 and 100');
            }
            if (typeof item.price !== 'number' || item.price < 0 || !isFinite(item.price)) {
                return safeError(400, 'item.price must be a non-negative number');
            }
        }

        // ── Use the authenticated user's ID — never trust client-supplied clientId ──
        const clientId = user.id;
        const orderId  = crypto.randomUUID();
        const queries  = [];

        queries.push(
            env.DB.prepare('INSERT INTO orders (id, client_id, total, status) VALUES (?1, ?2, ?3, ?4)')
                  .bind(orderId, clientId, total_amount, 'pending') // status always 'pending' on creation
        );

        for (const item of items) {
            queries.push(
                env.DB.prepare('INSERT INTO order_items (id, order_id, product_id, quantity, price) VALUES (?1,?2,?3,?4,?5)')
                      .bind(crypto.randomUUID(), orderId, item.watch_id, item.quantity, item.price)
            );
            // Prevent stock going below 0 — WHERE stock >= quantity acts as a guard
            queries.push(
                env.DB.prepare('UPDATE products SET stock = stock - ?1 WHERE id = ?2 AND stock >= ?1')
                      .bind(item.quantity, item.watch_id)
            );
        }

        await env.DB.batch(queries);

        // ── Google Forms webhook (fire-and-forget) ────────────────────────────
        if (env.GOOGLE_FORM_URL) {
            try {
                const watchNames = items.map(i => i.name || i.watch_id).join(', ');
                const quantities = items.map(i => `${i.name || i.watch_id}: ${i.quantity}`).join('\n');
                const formBody   = new URLSearchParams();
                formBody.append(env.FORM_ENTRY_ORDER_ID     || 'entry.1', orderId);
                formBody.append(env.FORM_ENTRY_CLIENT_NAME  || 'entry.2', customer_name?.trim() || '');
                formBody.append(env.FORM_ENTRY_CLIENT_EMAIL || 'entry.3', user.email);
                formBody.append(env.FORM_ENTRY_WATCHES      || 'entry.4', watchNames);
                formBody.append(env.FORM_ENTRY_QUANTITY     || 'entry.5', quantities);
                formBody.append(env.FORM_ENTRY_TOTAL_PRICE  || 'entry.6', total_amount.toString());
                formBody.append(env.FORM_ENTRY_CURRENCY     || 'entry.7', 'USD');
                formBody.append(env.FORM_ENTRY_STATUS       || 'entry.8', 'pending');
                formBody.append(env.FORM_ENTRY_DATE         || 'entry.9', new Date().toISOString().split('T')[0]);
                await fetch(env.GOOGLE_FORM_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: formBody.toString(),
                }).catch(e => console.error('[orders] Google Forms error:', e.message));
            } catch (formErr) {
                console.error('[orders] Google Forms error:', formErr.message);
            }
        }

        console.log(`[audit] Order created: id=${orderId} client=${clientId} total=${total_amount}`);

        return new Response(JSON.stringify({ success: true, orderId }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (err) {
        console.error('[orders] Unexpected error:', err.message);
        return safeError(500);
    }
}

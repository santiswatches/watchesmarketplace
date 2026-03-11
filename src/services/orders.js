// Orders API service — standalone fetch wrappers

export async function fetchAdminOrders({ status, review_sent } = {}) {
    const url = new URL(window.location.origin + '/api/orders');
    if (status) url.searchParams.append('status', status);
    if (review_sent !== undefined && review_sent !== '') {
        url.searchParams.append('review_sent', review_sent);
    }

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
}

export async function sendReviewEmail(orderId, productId) {
    const res = await fetch(`/api/orders/${orderId}/send-review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productId ? { product_id: productId } : {}),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to send review email');
    return json;
}

export async function updateOrder(orderId, data) {
    const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update order');
    return json;
}

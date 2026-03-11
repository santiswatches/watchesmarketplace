// Review API service — standalone fetch wrappers

export async function fetchReviewStats() {
    const res = await fetch('/api/reviews/stats');
    if (!res.ok) throw new Error('Failed to fetch review stats');
    return res.json();
}

export async function fetchAdminReviews() {
    const res = await fetch('/api/reviews');
    if (!res.ok) throw new Error('Failed to fetch reviews');
    return res.json();
}

export async function createReviewInvitation(data) {
    const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to create review invitation');
    return json;
}

export async function deleteReview(id) {
    const res = await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to delete review');
    return json;
}

export async function fetchReviewByToken(token) {
    const res = await fetch(`/api/reviews/${token}`);
    const json = await res.json();
    if (!res.ok) {
        const err = new Error(json.error || 'Invalid or expired review link');
        err.status = res.status;
        throw err;
    }
    return json;
}

export async function submitReview(token, data) {
    const res = await fetch(`/api/reviews/${token}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to submit review');
    return json;
}

export async function fetchPublicReviews() {
    const res = await fetch('/api/reviews/public');
    if (!res.ok) throw new Error('Failed to fetch reviews');
    return res.json();
}

export async function fetchProductReviews(productId) {
    const res = await fetch(`/api/reviews/product/${productId}`);
    if (!res.ok) throw new Error('Failed to fetch product reviews');
    return res.json();
}

export async function approveReview(id) {
    return patchReview(id, { status: 'active' });
}

export async function rejectReview(id) {
    return patchReview(id, { status: 'inactive' });
}

export async function editReview(id, data) {
    return patchReview(id, data);
}

async function patchReview(id, data) {
    const res = await fetch(`/api/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update review');
    return json;
}

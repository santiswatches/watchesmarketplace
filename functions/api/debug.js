export async function onRequestGet({ env }) {
    return new Response(JSON.stringify({
        has_jwt_secret: !!env.JWT_SECRET,
        has_db: !!env.DB,
        has_bucket: !!env.BUCKET,
    }), {
        headers: { 'Content-Type': 'application/json' },
    });
}

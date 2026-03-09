import cookie from 'cookie';

export async function onRequestPost({ request }) {
    // Clear the auth_token cookie
    const serializedCookie = cookie.serialize('auth_token', '', {
        httpOnly: true,
        secure: new URL(request.url).protocol === 'https:',
        sameSite: 'lax',
        maxAge: -1, // Expire immediately
        path: '/'
    });

    return new Response(JSON.stringify({ success: true }), {
        headers: {
            'Content-Type': 'application/json',
            'Set-Cookie': serializedCookie
        }
    });
}

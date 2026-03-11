export const api = {
    watches: {
        list: async ({ brand, category, sort_by } = {}) => {
            const url = new URL(window.location.origin + '/api/watches');
            if (brand) url.searchParams.append('brand', brand);
            if (category) url.searchParams.append('category', category);
            if (sort_by) url.searchParams.append('sort_by', sort_by);
            const res = await fetch(url.toString());
            if (!res.ok) throw new Error('Failed to fetch watches');
            return res.json();
        },
        get: async (id) => {
            const res = await fetch(`/api/watches/${id}`);
            if (!res.ok) throw new Error('Failed to fetch watch');
            return res.json();
        },
        create: async (data) => {
            const res = await fetch('/api/watches', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || 'Failed to create watch');
            return json;
        },
        update: async (id, data) => {
            const res = await fetch(`/api/watches/${id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || 'Failed to update watch');
            return json;
        },
        remove: async (id) => {
            const res = await fetch(`/api/watches/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || 'Failed to delete watch');
            return json;
        },
    },
    favorites: {
        list: async () => {
            const res = await fetch('/api/favorites', { credentials: 'include' });
            if (!res.ok) throw new Error('Failed to fetch favorites');
            return res.json();
        },
        add: async (product_id) => {
            const res = await fetch('/api/favorites', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ product_id: String(product_id) }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to add favorite');
            return data;
        },
        remove: async (product_id) => {
            const res = await fetch(`/api/favorites?product_id=${encodeURIComponent(product_id)}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to remove favorite');
            return data;
        },
    },
    orders: {
        create: async (data) => {
            const res = await fetch('/api/orders', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error('Failed to create order');
            return res.json();
        },
        list: async () => {
            const res = await fetch('/api/orders', { credentials: 'include' });
            if (!res.ok) throw new Error('Failed to fetch orders');
            return res.json();
        },
    },
    auth: {
        isAuthenticated: async () => {
            try {
                const res = await fetch('/api/auth/me', { credentials: 'include' });
                const data = await res.json();
                return !!data?.user;
            } catch {
                return false;
            }
        },
        me: async () => {
            try {
                const res = await fetch('/api/auth/me', { credentials: 'include' });
                if (!res.ok) return null;
                const data = await res.json();
                return data?.user || null;
            } catch {
                return null;
            }
        },
        login: async ({ email, password }) => {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Login failed');
            return data;
        },
        register: async ({ email, password, name, phone }) => {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, name, phone }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Registration failed');
            return data;
        },
        loginWithOAuth: async (provider, accessToken) => {
            if (provider !== 'google') throw new Error('Unsupported provider');
            const res = await fetch('/api/auth/google', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ access_token: accessToken }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Google login failed');
            return data;
        },
        logout: async () => {
            await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
            window.location.href = "/";
        },
        redirectToLogin: () => { window.location.href = "/login"; },
    },
    upload: {
        file: async ({ file }) => {
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch('/api/upload', {
                method: 'POST',
                credentials: 'include',
                body: formData,
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Upload failed');
            return { file_url: data.file_url, media_type: data.media_type };
        },
        fileWithProgress: ({ file, onProgress }) => {
            return new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                const formData = new FormData();
                formData.append('file', file);
                xhr.upload.addEventListener('progress', (e) => {
                    if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100));
                });
                xhr.addEventListener('load', () => {
                    try {
                        const data = JSON.parse(xhr.responseText);
                        if (xhr.status >= 200 && xhr.status < 300) {
                            resolve({ file_url: data.file_url, media_type: data.media_type });
                        } else {
                            reject(new Error(data.error || 'Upload failed'));
                        }
                    } catch {
                        reject(new Error('Upload failed'));
                    }
                });
                xhr.addEventListener('error', () => reject(new Error('Upload failed')));
                xhr.open('POST', '/api/upload');
                xhr.send(formData);
            });
        },
    },
};

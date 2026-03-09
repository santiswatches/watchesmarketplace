export const base44 = {
    entities: {
        Watch: {
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
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });
                const json = await res.json();
                if (!res.ok) throw new Error(json.error || 'Failed to update watch');
                return json;
            },
            delete: async (id) => {
                const res = await fetch(`/api/watches/${id}`, { method: 'DELETE' });
                const json = await res.json();
                if (!res.ok) throw new Error(json.error || 'Failed to delete watch');
                return json;
            },
        },
        Order: {
            create: async (data) => {
                const res = await fetch('/api/orders', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                if (!res.ok) throw new Error('Failed to create order');
                return res.json();
            }
        }
    },
    auth: {
        isAuthenticated: async () => {
            try {
                const res = await fetch('/api/auth/me');
                const data = await res.json();
                return !!data?.user;
            } catch {
                return false;
            }
        },
        me: async () => {
            try {
                const res = await fetch('/api/auth/me');
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Login failed');
            return data;
        },
        register: async ({ email, password, name, phone }) => {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, name, phone })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Registration failed');
            return data;
        },
        loginWithOAuth: async (provider, accessToken) => {
            if (provider !== 'google') throw new Error('Unsupported provider');
            const res = await fetch('/api/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ access_token: accessToken }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Google login failed');
            return data;
        },
        logout: async () => {
            await fetch('/api/auth/logout', { method: 'POST' });
            window.location.href = "/";
        },
        redirectToLogin: () => { window.location.href = "/login"; }
    },
    integrations: {
        Core: {
            UploadFile: async ({ file }) => {
                const formData = new FormData();
                formData.append('file', file);
                const res = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Upload failed');
                return { file_url: data.file_url };
            }
        }
    },
    appLogs: {
        logUserInApp: async () => { }
    }
};

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
            }
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
        logout: async () => {
            await fetch('/api/auth/logout', { method: 'POST' });
            window.location.href = "/";
        },
        redirectToLogin: () => { window.location.href = "/login"; }
    },
    integrations: {
        Core: {
            UploadFile: async ({ file }) => {
                if (file) {
                    return { file_url: URL.createObjectURL(file) };
                }
                return { file_url: "/assets/watches/1-rolex-submariner.jpg" };
            }
        }
    },
    appLogs: {
        logUserInApp: async () => { }
    }
};

// Mock data to replace Base44 entities

const mockWatches = [
    { id: 1, name: "Submariner", brand: "Rolex", price: 10500, category: "bestseller", image_url: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&q=80&w=1000" },
    { id: 2, name: "Speedmaster Professional", brand: "Omega", price: 7000, category: "new_arrival", image_url: "https://images.unsplash.com/photo-1548171915-e7afaca00782?auto=format&fit=crop&q=80&w=1000" },
    { id: 3, name: "Carrera", brand: "Tag Heuer", price: 3200, category: "sale", image_url: "https://images.unsplash.com/photo-1539874754764-5a96559165b0?auto=format&fit=crop&q=80&w=1000" },
    { id: 4, name: "Santos de Cartier", brand: "Cartier", price: 7800, category: "bestseller", image_url: "https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?auto=format&fit=crop&q=80&w=1000" },
    { id: 5, name: "Navitimer", brand: "Breitling", price: 9000, category: "limited_edition", image_url: "https://images.unsplash.com/photo-1622434641406-a158123450f9?auto=format&fit=crop&q=80&w=1000" },
    { id: 6, name: "Nautilus", brand: "Patek Philippe", price: 35000, category: "limited_edition", image_url: "https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?auto=format&fit=crop&q=80&w=1000" }
];

const mockBrands = [
    { id: 1, name: "Rolex" },
    { id: 2, name: "Omega" },
    { id: 3, name: "Tag Heuer" },
    { id: 4, name: "Cartier" },
    { id: 5, name: "Breitling" },
    { id: 6, name: "Patek Philippe" }
];

const mockOrders = [
    { id: 101, total: 10500, status: "Delivered", created_date: new Date().toISOString() }
];

let watchesStore = [...mockWatches];
let brandsStore = [...mockBrands];
let ordersStore = [...mockOrders];

export const base44 = {
    entities: {
        Watch: {
            list: async () => [...watchesStore],
            get: async (id) => watchesStore.find(w => w.id == id),
            create: async (data) => {
                const newWatch = { id: Date.now(), ...data };
                watchesStore.push(newWatch);
                return newWatch;
            },
            update: async (id, data) => {
                const idx = watchesStore.findIndex(w => w.id == id);
                if (idx !== -1) {
                    watchesStore[idx] = { ...watchesStore[idx], ...data };
                    return watchesStore[idx];
                }
                return null;
            },
            delete: async (id) => {
                watchesStore = watchesStore.filter(w => w.id != id);
                return { success: true };
            }
        },
        Brand: {
            list: async () => [...brandsStore],
            create: async (data) => {
                const newBrand = { id: Date.now(), ...data };
                brandsStore.push(newBrand);
                return newBrand;
            },
            delete: async (id) => {
                brandsStore = brandsStore.filter(b => b.id != id);
                return { success: true };
            }
        },
        Order: {
            list: async () => [...ordersStore],
            create: async (data) => {
                const newOrder = { id: Date.now(), ...data, created_date: new Date().toISOString(), status: "Pending" };
                ordersStore.push(newOrder);
                return newOrder;
            }
        }
    },
    auth: {
        isAuthenticated: async () => true, // Mocked as always authenticated for now
        me: async () => ({ id: 1, name: "Admin User", email: "admin@example.com", is_admin: true }),
        login: async () => { return { token: "fake-token" }; },
        logout: async () => { window.location.href = "/"; },
        redirectToLogin: () => { window.location.href = "/"; }
    },
    integrations: {
        Core: {
            UploadFile: async ({ file }) => {
                if (file) {
                    return { file_url: URL.createObjectURL(file) };
                }
                return { file_url: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&q=80&w=1000" };
            }
        }
    },
    appLogs: {
        logUserInApp: async () => { }
    }
};

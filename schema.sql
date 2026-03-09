-- schema.sql
-- Run: npx wrangler d1 execute watch-market-prod --remote --file=./schema.sql

-- Enable foreign keys support for SQLite (D1 uses SQLite)
PRAGMA foreign_keys = ON;

-- Clients Table
CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    phone TEXT,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
DROP TABLE IF EXISTS products;
CREATE TABLE products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    brand TEXT NOT NULL,
    price REAL NOT NULL,
    images TEXT DEFAULT '[]',
    videos TEXT DEFAULT '[]',
    description TEXT,
    specs TEXT DEFAULT '{}',
    tags TEXT DEFAULT '[]',
    material TEXT,
    category TEXT,
    currency TEXT DEFAULT 'USD',
    stock INTEGER DEFAULT 0,
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL,
    total REAL NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, paid, shipped, delivered, cancelled
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE RESTRICT
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    price REAL NOT NULL, -- Price at the time of purchase
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_orders_client_id ON orders(client_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- Seed Data for Products
INSERT INTO products (id, name, brand, price, images, description, specs, tags, material, category) VALUES
(
    '1', 
    'Submariner Date', 
    'Rolex', 
    14500, 
    '["/assets/watches/1-rolex-submariner.jpg"]', 
    'The Oyster Perpetual Submariner Date in Oystersteel with a Cerachrom bezel insert in black ceramic and a black dial with large luminescent hour markers.', 
    '{"case_size": "41mm", "water_resistance": "300m", "movement": "Automatic 3235"}', 
    '["bestseller", "diver"]', 
    'Stainless Steel', 
    'bestseller'
),
(
    '2', 
    'Royal Oak Selfwinding', 
    'Audemars Piguet', 
    45000, 
    '["/assets/watches/2-ap-royaloak.jpg"]', 
    'This 41 mm Royal Oak Selfwinding is crafted in stainless steel and features a silver-toned "Grande Tapisserie" dial.', 
    '{"case_size": "41mm", "water_resistance": "50m", "movement": "Automatic 4302"}', 
    '["classic", "iconic"]', 
    'Stainless Steel', 
    'all'
),
(
    '3', 
    'Nautilus', 
    'Patek Philippe', 
    85000, 
    '["/assets/watches/3-patek-nautilus.jpg"]', 
    'With the rounded octagonal shape of its bezel, the ingenious porthole construction of its case, and its horizontally embossed dial, the Nautilus has epitomized the elegant sports watch since 1976.', 
    '{"case_size": "40mm", "water_resistance": "120m", "movement": "Automatic 26-330 S C"}', 
    '["rare", "luxury"]', 
    'Stainless Steel', 
    'limited_edition'
),
(
    '4', 
    'Day-Date 40', 
    'Rolex', 
    41000, 
    '["/assets/watches/4-rolex-daydate.jpg"]', 
    'The Oyster Perpetual Day-Date 40 in 18 ct yellow gold with a champagne-colour dial, fluted bezel and a President bracelet.', 
    '{"case_size": "40mm", "water_resistance": "100m", "movement": "Automatic 3255"}', 
    '["elegant", "new_arrival"]', 
    'Gold', 
    'new_arrival'
);

-- User/Clients Table
CREATE TABLE IF NOT EXISTS clients (
    user_id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    google_auth_token TEXT,
    is_verified BOOLEAN DEFAULT 0,
    verification_token TEXT,
    browsing_analytics TEXT, -- JSON string (time_spent_per_watch)
    recommended_watches TEXT, -- JSON array
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    description TEXT,
    specs TEXT, -- JSON string
    images TEXT, -- JSON array of R2 URLs
    videos TEXT, -- JSON array of R2 URLs
    tags TEXT, -- JSON array (new, promo, etc)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

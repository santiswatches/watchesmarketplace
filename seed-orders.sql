-- seed-orders.sql
-- Test orders data for verifying the review system
-- Run: npx wrangler d1 execute watch-market-prod --remote --file=./seed-orders.sql

-- Test customers
INSERT OR IGNORE INTO clients (id, email, name, password_hash, phone, role) VALUES
('client-test-1', 'carlos.mendez@gmail.com', 'Carlos Mendez', '$2b$10$placeholder_hash_not_for_login_00000000000000000000000000', '+1 305 555 0101', 'user'),
('client-test-2', 'james.whitfield@outlook.com', 'James Whitfield', '$2b$10$placeholder_hash_not_for_login_00000000000000000000000000', '+1 212 555 0202', 'user'),
('client-test-3', 'sofia.chen@gmail.com', 'Sofia Chen', '$2b$10$placeholder_hash_not_for_login_00000000000000000000000000', '+44 20 7946 0303', 'user'),
('client-test-4', 'marco.rossi@yahoo.com', 'Marco Rossi', '$2b$10$placeholder_hash_not_for_login_00000000000000000000000000', '+39 06 555 0404', 'user'),
('client-test-5', 'elena.park@gmail.com', 'Elena Park', '$2b$10$placeholder_hash_not_for_login_00000000000000000000000000', '+82 2 555 0505', 'user'),
('client-test-6', 'david.thompson@icloud.com', 'David Thompson', '$2b$10$placeholder_hash_not_for_login_00000000000000000000000000', '+1 415 555 0606', 'user');

-- Orders with various statuses and dates
-- Order 1: Delivered Rolex Submariner — ready for review request
INSERT OR IGNORE INTO orders (id, client_id, total, status, review_sent, created_date) VALUES
('order-test-001', 'client-test-1', 14500, 'delivered', 0, '2026-02-15 10:30:00');
INSERT OR IGNORE INTO order_items (id, order_id, product_id, quantity, price) VALUES
('oi-test-001', 'order-test-001', '1', 1, 14500);

-- Order 2: Delivered AP Royal Oak — ready for review request
INSERT OR IGNORE INTO orders (id, client_id, total, status, review_sent, created_date) VALUES
('order-test-002', 'client-test-2', 45000, 'delivered', 0, '2026-02-20 14:15:00');
INSERT OR IGNORE INTO order_items (id, order_id, product_id, quantity, price) VALUES
('oi-test-002', 'order-test-002', '2', 1, 45000);

-- Order 3: Delivered Patek Nautilus — review already sent
INSERT OR IGNORE INTO orders (id, client_id, total, status, review_sent, created_date) VALUES
('order-test-003', 'client-test-3', 85000, 'delivered', 1, '2026-01-28 09:00:00');
INSERT OR IGNORE INTO order_items (id, order_id, product_id, quantity, price) VALUES
('oi-test-003', 'order-test-003', '3', 1, 85000);

-- Order 4: Shipped Rolex Day-Date — not delivered yet
INSERT OR IGNORE INTO orders (id, client_id, total, status, review_sent, created_date) VALUES
('order-test-004', 'client-test-4', 41000, 'shipped', 0, '2026-03-05 16:45:00');
INSERT OR IGNORE INTO order_items (id, order_id, product_id, quantity, price) VALUES
('oi-test-004', 'order-test-004', '4', 1, 41000);

-- Order 5: Paid — two watches in one order
INSERT OR IGNORE INTO orders (id, client_id, total, status, review_sent, created_date) VALUES
('order-test-005', 'client-test-5', 59500, 'paid', 0, '2026-03-08 11:20:00');
INSERT OR IGNORE INTO order_items (id, order_id, product_id, quantity, price) VALUES
('oi-test-005a', 'order-test-005', '1', 1, 14500),
('oi-test-005b', 'order-test-005', '2', 1, 45000);

-- Order 6: Pending payment
INSERT OR IGNORE INTO orders (id, client_id, total, status, review_sent, created_date) VALUES
('order-test-006', 'client-test-6', 14500, 'pending', 0, '2026-03-10 08:00:00');
INSERT OR IGNORE INTO order_items (id, order_id, product_id, quantity, price) VALUES
('oi-test-006', 'order-test-006', '1', 1, 14500);

-- Order 7: Delivered Rolex Day-Date + Submariner — ready for review
INSERT OR IGNORE INTO orders (id, client_id, total, status, review_sent, created_date) VALUES
('order-test-007', 'client-test-1', 55500, 'delivered', 0, '2026-01-10 13:30:00');
INSERT OR IGNORE INTO order_items (id, order_id, product_id, quantity, price) VALUES
('oi-test-007a', 'order-test-007', '4', 1, 41000),
('oi-test-007b', 'order-test-007', '1', 1, 14500);

-- Order 8: Cancelled order
INSERT OR IGNORE INTO orders (id, client_id, total, status, review_sent, created_date) VALUES
('order-test-008', 'client-test-4', 85000, 'cancelled', 0, '2026-02-25 17:00:00');
INSERT OR IGNORE INTO order_items (id, order_id, product_id, quantity, price) VALUES
('oi-test-008', 'order-test-008', '3', 1, 85000);

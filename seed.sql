-- seed.sql
-- Initial mock data migration for watches
-- Run: npx wrangler d1 execute watch-market-prod --local --file=./seed.sql

INSERT OR IGNORE INTO products (id, name, brand, price, category, image_url, description, currency, stock) VALUES
('1', 'Submariner', 'Rolex', 10500, 'bestseller', '/assets/watches/1-rolex-submariner.jpg', 'The reference among divers'' watches. The Oyster Perpetual Submariner is the quintessential divers'' watch, the benchmark in its genre.', 'USD', 5),
('2', 'Speedmaster Professional', 'Omega', 7000, 'new_arrival', '/assets/watches/2-omega-speedmaster.jpg', 'The OMEGA Speedmaster is one of OMEGA’s most iconic timepieces. Having been a part of all six lunar missions, the legendary Speedmaster is an impressive representation of the brand’s adventurous pioneering spirit.', 'USD', 10),
('3', 'Carrera', 'Tag Heuer', 3200, 'sale', '/assets/watches/3-tagheuer-carrera.jpg', 'An elegant profile, high-precision movement, and a design that is both modern and classic. The TAG Heuer Carrera is a true racing watch.', 'USD', 3),
('4', 'Santos de Cartier', 'Cartier', 7800, 'bestseller', '/assets/watches/4-cartier-santos.jpg', 'The Santos watch was conceived by Louis Cartier in 1904 to help aviators tell time mid-flight. Since then, this pioneering wristwatch has become an icon, defined by its geometric dial, harmoniously curved horns, and signature exposed screws.', 'USD', 2),
('5', 'Navitimer', 'Breitling', 9000, 'limited_edition', '/assets/watches/5-breitling-navitimer.jpg', 'The Navitimer is one of the most recognizable watches ever made. It’s on collectors’ lists of the greatest watches of all time. What began in 1952 as a tool for pilots has gone on to mean something profound to every single person who has had this timepiece along on their personal journey.', 'USD', 1),
('6', 'Nautilus', 'Patek Philippe', 35000, 'limited_edition', '/assets/watches/6-patek-nautilus.jpg', 'With the rounded octagonal shape of its bezel, the ingenious porthole construction of its case, and its horizontally embossed dial, the Nautilus has epitomized the elegant sports watch since 1976.', 'USD', 1);

-- Optionally add a mock admin client
-- Password hash for 'password123' using bcrypt (cost 10)
INSERT OR IGNORE INTO clients (id, email, name, password_hash, phone, role) VALUES 
('client-admin', 'admin@example.com', 'Admin User', '$2b$10$wTfUS9lOr1X4rT2mOh0Sbe.c/iUq6fN8B2yZ5cI/O5GzQeKpEaBx.', '1234567890', 'admin');

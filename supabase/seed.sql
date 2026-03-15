-- Seed categories for the collectibles marketplace
-- Top-level categories with subcategories

-- Clothing
INSERT INTO categories (id, name, slug, parent_id) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Clothing', 'clothing', NULL),
  ('a0000000-0000-0000-0000-000000000002', 'Vintage Clothing', 'vintage-clothing', 'a0000000-0000-0000-0000-000000000001'),
  ('a0000000-0000-0000-0000-000000000003', 'Concert Tees', 'concert-tees', 'a0000000-0000-0000-0000-000000000001'),
  ('a0000000-0000-0000-0000-000000000004', 'Sneakers', 'sneakers', 'a0000000-0000-0000-0000-000000000001');

-- Electronics
INSERT INTO categories (id, name, slug, parent_id) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'Electronics', 'electronics', NULL),
  ('b0000000-0000-0000-0000-000000000002', 'Vintage Audio', 'vintage-audio', 'b0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000003', 'Retro Gaming', 'retro-gaming', 'b0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000004', 'Cameras & Film', 'cameras-film', 'b0000000-0000-0000-0000-000000000001');

-- Music
INSERT INTO categories (id, name, slug, parent_id) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Music', 'music', NULL),
  ('c0000000-0000-0000-0000-000000000002', 'Vinyl Records', 'vinyl-records', 'c0000000-0000-0000-0000-000000000001'),
  ('c0000000-0000-0000-0000-000000000003', 'Instruments', 'instruments', 'c0000000-0000-0000-0000-000000000001'),
  ('c0000000-0000-0000-0000-000000000004', 'Music Memorabilia', 'music-memorabilia', 'c0000000-0000-0000-0000-000000000001');

-- Toys & Games
INSERT INTO categories (id, name, slug, parent_id) VALUES
  ('d0000000-0000-0000-0000-000000000001', 'Toys & Games', 'toys-games', NULL),
  ('d0000000-0000-0000-0000-000000000002', 'Action Figures', 'action-figures', 'd0000000-0000-0000-0000-000000000001'),
  ('d0000000-0000-0000-0000-000000000003', 'Board Games', 'board-games', 'd0000000-0000-0000-0000-000000000001');

-- Sports
INSERT INTO categories (id, name, slug, parent_id) VALUES
  ('e0000000-0000-0000-0000-000000000001', 'Sports', 'sports', NULL),
  ('e0000000-0000-0000-0000-000000000002', 'Trading Cards', 'trading-cards', 'e0000000-0000-0000-0000-000000000001'),
  ('e0000000-0000-0000-0000-000000000003', 'Memorabilia', 'sports-memorabilia', 'e0000000-0000-0000-0000-000000000001');

-- Art
INSERT INTO categories (id, name, slug, parent_id) VALUES
  ('f0000000-0000-0000-0000-000000000001', 'Art', 'art', NULL),
  ('f0000000-0000-0000-0000-000000000002', 'Prints & Posters', 'prints-posters', 'f0000000-0000-0000-0000-000000000001'),
  ('f0000000-0000-0000-0000-000000000003', 'Original Works', 'original-works', 'f0000000-0000-0000-0000-000000000001');

-- Books
INSERT INTO categories (id, name, slug, parent_id) VALUES
  ('10000000-0000-0000-0000-000000000001', 'Books', 'books', NULL),
  ('10000000-0000-0000-0000-000000000002', 'First Editions', 'first-editions', '10000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000003', 'Comics', 'comics', '10000000-0000-0000-0000-000000000001');

-- Automotive
INSERT INTO categories (id, name, slug, parent_id) VALUES
  ('20000000-0000-0000-0000-000000000001', 'Automotive', 'automotive', NULL),
  ('20000000-0000-0000-0000-000000000002', 'Parts', 'auto-parts', '20000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000003', 'Models & Diecast', 'models-diecast', '20000000-0000-0000-0000-000000000001');

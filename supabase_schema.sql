-- ==========================================
-- SCRIPT SQL RESMI: MIGRASI SUPABASE (POSTGRESQL)
-- APLIKASI POS & PENCATATAN KEUANGAN SELERASI
-- ==========================================
--
-- PETUNJUK PENGGUNAAN:
-- 1. Buka dashboard Supabase Anda.
-- 2. Pilih project Anda, lalu pergi ke menu "SQL Editor" di sidebar kiri.
-- 3. Klik "New query", paste seluruh kode SQL ini, lalu klik "Run".
-- 4. Pastikan RLS (Row Level Security) dinonaktifkan untuk tabel ini 
--    (atau buat policy yang sesuai) agar API dapat diakses dengan lancar.
-- ==========================================

-- Bersihkan tabel lama jika ada (opsional)
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;

-- 1. TABEL: categories
-- Catatan: Menggunakan double-quotes pada kolom camelCase ("bgClass", dll)
-- agar tipe data di PostgreSQL sama persis dengan properti JavaScript di frontend.
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL,
  "bgClass" TEXT,
  "textClass" TEXT,
  "borderClass" TEXT,
  hex TEXT,
  "colorName" TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABEL: products
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  price DOUBLE PRECISION NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'Tersedia',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABEL: transactions
CREATE TABLE transactions (
  id TEXT PRIMARY KEY,
  description TEXT NOT NULL,
  amount DOUBLE PRECISION NOT NULL,
  type TEXT NOT NULL,
  category TEXT, -- Menyimpan nama kategori untuk menyederhanakan data
  date TEXT NOT NULL, -- Format YYYY-MM-DD
  quantity INTEGER DEFAULT 1,
  payment_method TEXT DEFAULT 'Tunai',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- NONAKTIFKAN RLS (ROW LEVEL SECURITY)
-- Agar aplikasi dapat membaca & menulis data melalui API client (Anon Key)
-- ==========================================
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;

-- ==========================================
-- DATA AWAL (SEEDING DEFAULT DATA)
-- ==========================================

-- Seed default categories
INSERT INTO categories (id, name, type, "bgClass", "textClass", "borderClass", hex, "colorName") VALUES
('1', 'Penjualan Ricebowl (Offline)', 'income', 'bg-brand-50', 'text-brand-700', 'border-brand-200', '#f4e9bb', 'Emerald'),
('2', 'Pesanan Online (Go/Grab/Shopee)', 'income', 'bg-blue-50', 'text-blue-700', 'border-blue-200', '#3b82f6', 'Blue'),
('3', 'Katering & Event', 'income', 'bg-amber-50', 'text-amber-700', 'border-amber-200', '#f59e0b', 'Amber'),
('4', 'Kemitraan & Franchise', 'income', 'bg-violet-50', 'text-violet-700', 'border-violet-200', '#8b5cf6', 'Violet'),
('5', 'Bahan Baku', 'expense', 'bg-rose-50', 'text-rose-700', 'border-rose-200', '#f43f5e', 'Rose'),
('6', 'Packaging', 'expense', 'bg-pink-50', 'text-pink-700', 'border-pink-200', '#ec4899', 'Pink');

-- Seed default products
INSERT INTO products (id, name, price, description, status) VALUES
('p1', 'Ricebowl Ayam Sambal Matah', 25000, 'Ayam fillet krispi dipadu sambal matah khas Bali yang segar dan harum.', 'Tersedia'),
('p2', 'Ricebowl Beef Yakiniku', 32000, 'Irisan daging sapi tipis (shortplate beef) ditumis saus yakiniku gurih manis.', 'Tersedia'),
('p3', 'Ricebowl Chicken Teriyaki', 24000, 'Fillet paha ayam panggang empuk berlapis saus teriyaki otentik.', 'Tersedia'),
('p4', 'Ricebowl Kulit Crispy Sambal Bawang', 18000, 'Kulit ayam krispi super renyah disiram sambal bawang pedas gurih.', 'Tersedia');

-- Seed default transactions
INSERT INTO transactions (id, description, amount, type, category, date, quantity, payment_method) VALUES
('1', 'Ricebowl Ayam Sambal Matah', 3000000, 'income', 'Penjualan Ricebowl (Offline)', '2026-05-28', 120, 'QRIS'),
('2', 'Ricebowl Beef Yakiniku', 4500000, 'income', 'Pesanan Online (Go/Grab/Shopee)', '2026-05-27', 180, 'Aplikasi Online'),
('3', 'Belanja Beras, Ayam Fillet, & Sayuran di Pasar', 1500000, 'expense', 'Bahan Baku', '2026-05-26', 1, 'Tunai'),
('4', 'Beli Paper Bowl Sablon Logo Selerasi 1.000 Pcs', 1200000, 'expense', 'Packaging', '2026-05-25', 1000, 'Transfer Bank'),
('5', 'Ricebowl Chicken Teriyaki', 2000000, 'income', 'Katering & Event', '2026-05-24', 80, 'Transfer Bank');

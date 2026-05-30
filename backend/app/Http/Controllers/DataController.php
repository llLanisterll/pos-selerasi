<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\Product;

class DataController extends Controller
{
    public function resetDemo()
    {
        Transaction::query()->delete();
        Category::query()->delete();
        Product::query()->delete();

        $defaultCategories = [
            ['id' => '1', 'name' => 'Penjualan Ricebowl (Offline)', 'type' => 'income', 'bgClass' => 'bg-emerald-50', 'textClass' => 'text-emerald-700', 'borderClass' => 'border-emerald-200', 'hex' => '#f4e9bb', 'colorName' => 'Emerald'],
            ['id' => '2', 'name' => 'Pesanan Online (Go/Grab/Shopee)', 'type' => 'income', 'bgClass' => 'bg-blue-50', 'textClass' => 'text-blue-700', 'borderClass' => 'border-blue-200', 'hex' => '#3b82f6', 'colorName' => 'Blue'],
            ['id' => '3', 'name' => 'Katering & Event', 'type' => 'income', 'bgClass' => 'bg-amber-50', 'textClass' => 'text-amber-700', 'borderClass' => 'border-amber-200', 'hex' => '#f59e0b', 'colorName' => 'Amber'],
            ['id' => '4', 'name' => 'Kemitraan & Franchise', 'type' => 'income', 'bgClass' => 'bg-violet-50', 'textClass' => 'text-violet-700', 'borderClass' => 'border-violet-200', 'hex' => '#8b5cf6', 'colorName' => 'Violet'],
            ['id' => '5', 'name' => 'Bahan Baku & Dapur', 'type' => 'expense', 'bgClass' => 'bg-rose-50', 'textClass' => 'text-rose-700', 'borderClass' => 'border-rose-200', 'hex' => '#f43f5e', 'colorName' => 'Rose'],
            ['id' => '6', 'name' => 'Kemasan & Packaging', 'type' => 'expense', 'bgClass' => 'bg-pink-50', 'textClass' => 'text-pink-700', 'borderClass' => 'border-pink-200', 'hex' => '#ec4899', 'colorName' => 'Pink'],
            ['id' => '7', 'name' => 'Gaji Karyawan', 'type' => 'expense', 'bgClass' => 'bg-indigo-50', 'textClass' => 'text-indigo-700', 'borderClass' => 'border-indigo-200', 'hex' => '#6366f1', 'colorName' => 'Indigo'],
            ['id' => '8', 'name' => 'Operasional & Sewa', 'type' => 'expense', 'bgClass' => 'bg-slate-50', 'textClass' => 'text-slate-700', 'borderClass' => 'border-slate-200', 'hex' => '#64748b', 'colorName' => 'Slate'],
            ['id' => '9', 'name' => 'Pemasaran & Iklan', 'type' => 'expense', 'bgClass' => 'bg-amber-50', 'textClass' => 'text-amber-700', 'borderClass' => 'border-amber-200', 'hex' => '#f59e0b', 'colorName' => 'Amber'],
        ];

        foreach ($defaultCategories as $cat) {
            Category::create($cat);
        }

        $defaultProducts = [
            [
                'id' => 'p1',
                'name' => 'Ricebowl Ayam Sambal Matah',
                'price' => 25000,
                'description' => 'Ayam fillet krispi dipadu sambal matah khas Bali yang segar dan harum.',
                'status' => 'Tersedia'
            ],
            [
                'id' => 'p2',
                'name' => 'Ricebowl Beef Yakiniku',
                'price' => 32000,
                'description' => 'Irisan daging sapi tipis (shortplate beef) ditumis saus yakiniku gurih manis.',
                'status' => 'Tersedia'
            ],
            [
                'id' => 'p3',
                'name' => 'Ricebowl Chicken Teriyaki',
                'price' => 24000,
                'description' => 'Fillet paha ayam panggang empuk berlapis saus teriyaki otentik.',
                'status' => 'Tersedia'
            ],
            [
                'id' => 'p4',
                'name' => 'Ricebowl Kulit Crispy Sambal Bawang',
                'price' => 18000,
                'description' => 'Kulit ayam krispi super renyah disiram sambal bawang pedas gurih.',
                'status' => 'Tersedia'
            ],
        ];

        foreach ($defaultProducts as $product) {
            Product::create($product);
        }

        $mockTransactions = [
            ['id' => '1', 'description' => 'Ricebowl Ayam Sambal Matah', 'amount' => 3000000, 'type' => 'income', 'category' => 'Penjualan Ricebowl (Offline)', 'date' => '2026-05-28', 'quantity' => 120, 'payment_method' => 'QRIS'],
            ['id' => '2', 'description' => 'Ricebowl Beef Yakiniku', 'amount' => 4500000, 'type' => 'income', 'category' => 'Pesanan Online (Go/Grab/Shopee)', 'date' => '2026-05-27', 'quantity' => 180, 'payment_method' => 'Aplikasi Online'],
            ['id' => '3', 'description' => 'Belanja Beras, Ayam Fillet, & Sayuran di Pasar', 'amount' => 1500000, 'type' => 'expense', 'category' => 'Bahan Baku & Dapur', 'date' => '2026-05-26', 'quantity' => 1, 'payment_method' => 'Tunai'],
            ['id' => '4', 'description' => 'Beli Paper Bowl Sablon Logo Selerasi 1.000 Pcs', 'amount' => 1200000, 'type' => 'expense', 'category' => 'Kemasan & Packaging', 'date' => '2026-05-25', 'quantity' => 1000, 'payment_method' => 'Transfer Bank'],
            ['id' => '5', 'description' => 'Ricebowl Chicken Teriyaki', 'amount' => 2000000, 'type' => 'income', 'category' => 'Katering & Event', 'date' => '2026-05-24', 'quantity' => 80, 'payment_method' => 'Transfer Bank'],
            ['id' => '6', 'description' => 'Pembayaran Gaji Asisten Dapur & Kasir Outlet', 'amount' => 4000000, 'type' => 'expense', 'category' => 'Gaji Karyawan', 'date' => '2026-05-23', 'quantity' => 2, 'payment_method' => 'Transfer Bank'],
            ['id' => '7', 'description' => 'Iklan Instagram & TikTok Promo Menu Baru', 'amount' => 600000, 'type' => 'expense', 'category' => 'Pemasaran & Iklan', 'date' => '2026-05-22', 'quantity' => 1, 'payment_method' => 'Transfer Bank'],
            ['id' => '8', 'description' => 'Biaya Gas Elpiji, Air PDAM, & Listrik Bulanan', 'amount' => 850000, 'type' => 'expense', 'category' => 'Operasional & Sewa', 'date' => '2026-05-21', 'quantity' => 1, 'payment_method' => 'Tunai'],
        ];

        foreach ($mockTransactions as $tx) {
            Transaction::create($tx);
        }

        return response()->json([
            'message' => 'Demo data reset successfully',
            'categories' => Category::all(),
            'transactions' => Transaction::orderBy('date', 'desc')->get(),
            'products' => Product::all()
        ]);
    }

    public function clearAll()
    {
        Transaction::query()->delete();
        Category::query()->delete();
        Product::query()->delete();

        return response()->json([
            'message' => 'All data cleared successfully',
            'categories' => [],
            'transactions' => [],
            'products' => []
        ]);
    }

    public function import(Request $request)
    {
        $validated = $request->validate([
            'categories' => 'required|array',
            'categories.*.id' => 'required|string',
            'categories.*.name' => 'required|string',
            'categories.*.type' => 'required|string',
            'categories.*.bgClass' => 'required|string',
            'categories.*.textClass' => 'required|string',
            'categories.*.borderClass' => 'required|string',
            'categories.*.hex' => 'required|string',
            'categories.*.colorName' => 'required|string',
            'transactions' => 'required|array',
            'transactions.*.id' => 'required|string',
            'transactions.*.description' => 'required|string',
            'transactions.*.amount' => 'required|numeric',
            'transactions.*.type' => 'required|string',
            'transactions.*.category' => 'required|string',
            'transactions.*.date' => 'required|string',
            'transactions.*.quantity' => 'nullable|integer',
            'transactions.*.payment_method' => 'nullable|string',
            'products' => 'nullable|array',
            'products.*.id' => 'required|string',
            'products.*.name' => 'required|string',
            'products.*.price' => 'required|numeric',
            'products.*.description' => 'nullable|string',
            'products.*.status' => 'required|string',
        ]);

        Transaction::query()->delete();
        Category::query()->delete();
        Product::query()->delete();

        foreach ($validated['categories'] as $cat) {
            Category::create($cat);
        }

        foreach ($validated['transactions'] as $tx) {
            Transaction::create($tx);
        }

        if (isset($validated['products'])) {
            foreach ($validated['products'] as $prod) {
                Product::create($prod);
            }
        }

        return response()->json([
            'message' => 'Data imported successfully',
            'categories' => Category::all(),
            'transactions' => Transaction::orderBy('date', 'desc')->get(),
            'products' => Product::all()
        ]);
    }
}

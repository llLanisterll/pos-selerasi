<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Transaction;

class TransactionController extends Controller
{
    public function index()
    {
        if (Transaction::count() === 0) {
            $mockTransactions = [
                ['id' => '1', 'description' => 'Penjualan 120 Porsi Ricebowl (Dine-in & Takeaway)', 'amount' => 3000000, 'type' => 'income', 'category' => 'Penjualan Ricebowl (Offline)', 'date' => '2026-05-28', 'quantity' => 120, 'payment_method' => 'QRIS'],
                ['id' => '2', 'description' => 'Pencairan GoFood & GrabFood Mingguan', 'amount' => 4500000, 'type' => 'income', 'category' => 'Pesanan Online (Go/Grab/Shopee)', 'date' => '2026-05-27', 'quantity' => 180, 'payment_method' => 'Aplikasi Online'],
                ['id' => '3', 'description' => 'Belanja Beras, Ayam Fillet, & Sayuran di Pasar', 'amount' => 1500000, 'type' => 'expense', 'category' => 'Bahan Baku & Dapur', 'date' => '2026-05-26', 'quantity' => 1, 'payment_method' => 'Tunai'],
                ['id' => '4', 'description' => 'Beli Paper Bowl Sablon Logo Selerasi 1.000 Pcs', 'amount' => 1200000, 'type' => 'expense', 'category' => 'Kemasan & Packaging', 'date' => '2026-05-25', 'quantity' => 1000, 'payment_method' => 'Transfer Bank'],
                ['id' => '5', 'description' => 'DP Pesanan Katering Acara Kantor Bank Mandiri', 'amount' => 2000000, 'type' => 'income', 'category' => 'Katering & Event', 'date' => '2026-05-24', 'quantity' => 80, 'payment_method' => 'Transfer Bank'],
                ['id' => '6', 'description' => 'Pembayaran Gaji Asisten Dapur & Kasir Outlet', 'amount' => 4000000, 'type' => 'expense', 'category' => 'Gaji Karyawan', 'date' => '2026-05-23', 'quantity' => 2, 'payment_method' => 'Transfer Bank'],
                ['id' => '7', 'description' => 'Iklan Instagram & TikTok Promo Menu Baru', 'amount' => 600000, 'type' => 'expense', 'category' => 'Pemasaran & Iklan', 'date' => '2026-05-22', 'quantity' => 1, 'payment_method' => 'Transfer Bank'],
                ['id' => '8', 'description' => 'Biaya Gas Elpiji, Air PDAM, & Listrik Bulanan', 'amount' => 850000, 'type' => 'expense', 'category' => 'Operasional & Sewa', 'date' => '2026-05-21', 'quantity' => 1, 'payment_method' => 'Tunai'],
            ];

            foreach ($mockTransactions as $tx) {
                Transaction::create($tx);
            }
        }

        // Return latest transactions first
        return response()->json(Transaction::orderBy('date', 'desc')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|string',
            'description' => 'required|string',
            'amount' => 'required|numeric|min:0.01',
            'type' => 'required|string|in:income,expense',
            'category' => 'required|string',
            'date' => 'required|string',
            'quantity' => 'nullable|integer|min:1',
            'payment_method' => 'nullable|string'
        ]);

        $transaction = Transaction::create($validated);
        return response()->json($transaction, 201);
    }

    public function destroy($id)
    {
        $transaction = Transaction::findOrFail($id);
        $transaction->delete();
        return response()->json(['message' => 'Transaction deleted successfully']);
    }
}

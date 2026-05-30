<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Category;
use App\Models\Transaction;

class CategoryController extends Controller
{
    public function index()
    {
        if (Category::count() === 0) {
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
        }

        return response()->json(Category::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|string',
            'name' => 'required|string|unique:categories,name',
            'type' => 'required|string',
            'bgClass' => 'required|string',
            'textClass' => 'required|string',
            'borderClass' => 'required|string',
            'hex' => 'required|string',
            'colorName' => 'required|string'
        ]);

        $category = Category::create($validated);
        return response()->json($category, 201);
    }

    public function update(Request $request, $id)
    {
        $category = Category::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|unique:categories,name,' . $id . ',id',
            'type' => 'required|string',
            'bgClass' => 'required|string',
            'textClass' => 'required|string',
            'borderClass' => 'required|string',
            'hex' => 'required|string',
            'colorName' => 'required|string'
        ]);

        $oldName = $category->name;
        $category->update($validated);

        // If the category name changed, update all transactions referencing it
        if ($oldName !== $validated['name']) {
            Transaction::where('category', $oldName)->update([
                'category' => $validated['name']
            ]);
        }

        return response()->json($category);
    }

    public function destroy($id)
    {
        $category = Category::findOrFail($id);
        $category->delete();
        return response()->json(['message' => 'Category deleted successfully']);
    }
}

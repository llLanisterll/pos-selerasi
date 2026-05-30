<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;

class ProductController extends Controller
{
    public function index()
    {
        if (Product::count() === 0) {
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
        }

        return response()->json(Product::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|string',
            'name' => 'required|string|unique:products,name',
            'price' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'status' => 'required|string|in:Tersedia,Habis'
        ]);

        $product = Product::create($validated);
        return response()->json($product, 201);
    }

    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|unique:products,name,' . $id . ',id',
            'price' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'status' => 'required|string|in:Tersedia,Habis'
        ]);

        $product->update($validated);
        return response()->json($product);
    }

    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        $product->delete();
        return response()->json(['message' => 'Product deleted successfully']);
    }
}

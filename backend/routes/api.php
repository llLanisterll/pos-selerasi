<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\DataController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::apiResource('categories', CategoryController::class);
Route::apiResource('transactions', TransactionController::class)->except(['update']);
Route::apiResource('products', ProductController::class);

Route::post('reset-demo', [DataController::class, 'resetDemo']);
Route::post('clear-all', [DataController::class, 'clearAll']);
Route::post('import', [DataController::class, 'import']);



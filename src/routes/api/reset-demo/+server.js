import supabase, { logActivity } from '$lib/server/db';
import { authenticate } from '$lib/server/auth';
import { json } from '@sveltejs/kit';

export async function POST({ request, cookies }) {
  try {
    // Hanya superadmin yang dapat melakukan reset ke data demo
    const { user, error: authError } = await authenticate(request, cookies, 'superadmin');
    if (authError) {
      return json({ message: authError.message }, { status: 403 });
    }

    // Delete all records
    const { error: delTxErr } = await supabase.from('transactions').delete().neq('id', 'dummy');
    const { error: delCatErr } = await supabase.from('categories').delete().neq('id', 'dummy');
    const { error: delProdErr } = await supabase.from('products').delete().neq('id', 'dummy');
    
    if (delTxErr) throw delTxErr;
    if (delCatErr) throw delCatErr;
    if (delProdErr) throw delProdErr;
    
    // Seed default categories
    const defaultCategories = [
      { id: '1', name: 'Penjualan Ricebowl (Offline)', type: 'income', bgClass: 'bg-brand-50', textClass: 'text-brand-700', borderClass: 'border-brand-200', hex: '#f4e9bb', colorName: 'Emerald' },
      { id: '2', name: 'Pesanan Online (Go/Grab/Shopee)', type: 'income', bgClass: 'bg-blue-50', textClass: 'text-blue-700', borderClass: 'border-blue-200', hex: '#3b82f6', colorName: 'Blue' },
      { id: '3', name: 'Katering & Event', type: 'income', bgClass: 'bg-amber-50', textClass: 'text-amber-700', borderClass: 'border-amber-200', hex: '#f59e0b', colorName: 'Amber' },
      { id: '4', name: 'Kemitraan & Franchise', type: 'income', bgClass: 'bg-violet-50', textClass: 'text-violet-700', borderClass: 'border-violet-200', hex: '#8b5cf6', colorName: 'Violet' },
      { id: '5', name: 'Bahan Baku', type: 'expense', bgClass: 'bg-rose-50', textClass: 'text-rose-700', borderClass: 'border-rose-200', hex: '#f43f5e', colorName: 'Rose' },
      { id: '6', name: 'Packaging', type: 'expense', bgClass: 'bg-pink-50', textClass: 'text-pink-700', borderClass: 'border-pink-200', hex: '#ec4899', colorName: 'Pink' }
    ];
    
    const now = new Date().toISOString();
    const categoriesToInsert = defaultCategories.map(cat => ({
      ...cat,
      created_at: now,
      updated_at: now
    }));
    
    const { data: insertedCats, error: catErr } = await supabase
      .from('categories')
      .insert(categoriesToInsert)
      .select();
      
    if (catErr) throw catErr;
    
    // Seed default products
    const defaultProducts = [
      { id: 'p1', name: 'Ricebowl Ayam Sambal Matah', price: 25000, description: 'Ayam fillet krispi dipadu sambal matah khas Bali yang segar dan harum.', status: 'Tersedia' },
      { id: 'p2', name: 'Ricebowl Beef Yakiniku', price: 32000, description: 'Irisan daging sapi tipis (shortplate beef) ditumis saus yakiniku gurih manis.', status: 'Tersedia' },
      { id: 'p3', name: 'Ricebowl Chicken Teriyaki', price: 24000, description: 'Fillet paha ayam panggang empuk berlapis saus teriyaki otentik.', status: 'Tersedia' },
      { id: 'p4', name: 'Ricebowl Kulit Crispy Sambal Bawang', price: 18000, description: 'Kulit ayam krispi super renyah disiram sambal bawang pedas gurih.', status: 'Tersedia' }
    ];
    
    const productsToInsert = defaultProducts.map(prod => ({
      ...prod,
      created_at: now,
      updated_at: now
    }));
    
    const { data: insertedProds, error: prodErr } = await supabase
      .from('products')
      .insert(productsToInsert)
      .select();
      
    if (prodErr) throw prodErr;
    
    // Seed default transactions
    const mockTransactions = [
      { id: '1', description: 'Ricebowl Ayam Sambal Matah', amount: 3000000, type: 'income', category: 'Penjualan Ricebowl (Offline)', date: '2026-05-28', quantity: 120, payment_method: 'QRIS' },
      { id: '2', description: 'Ricebowl Beef Yakiniku', amount: 4500000, type: 'income', category: 'Pesanan Online (Go/Grab/Shopee)', date: '2026-05-27', quantity: 180, payment_method: 'Aplikasi Online' },
      { id: '3', description: 'Belanja Beras, Ayam Fillet, & Sayuran di Pasar', amount: 1500000, type: 'expense', category: 'Bahan Baku', date: '2026-05-26', quantity: 1, payment_method: 'Tunai' },
      { id: '4', description: 'Beli Paper Bowl Sablon Logo Selerasi 1.000 Pcs', amount: 1200000, type: 'expense', category: 'Packaging', date: '2026-05-25', quantity: 1000, payment_method: 'Transfer Bank' },
      { id: '5', description: 'Ricebowl Chicken Teriyaki', amount: 2000000, type: 'income', category: 'Katering & Event', date: '2026-05-24', quantity: 80, payment_method: 'Transfer Bank' }
    ];
    
    const txToInsert = mockTransactions.map(tx => ({
      ...tx,
      created_at: now,
      updated_at: now
    }));
    
    const { error: txErr } = await supabase
      .from('transactions')
      .insert(txToInsert);
      
    if (txErr) throw txErr;
    
    // Get sorted transactions
    const { data: finalTxs, error: getTxErr } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });
      
    if (getTxErr) throw getTxErr;

    // Catat log aktivitas
    await logActivity(user.email, 'Reset Data Demo', 'Mengatur ulang database POS ke kondisi data demo simulasi.');
    
    return json({
      message: 'Demo data reset successfully',
      categories: insertedCats,
      transactions: finalTxs,
      products: insertedProds
    });
  } catch (err) {
    return json({ message: err.message }, { status: 500 });
  }
}

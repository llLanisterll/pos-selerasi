import supabase, { logActivity } from '$lib/server/db';
import { authenticate } from '$lib/server/auth';
import { json } from '@sveltejs/kit';

export async function POST({ request, cookies }) {
  try {
    // Hanya superadmin yang dapat melakukan impor data cadangan
    const { user, error: authError } = await authenticate(request, cookies, 'superadmin');
    if (authError) {
      return json({ message: authError.message }, { status: 403 });
    }

    const body = await request.json();
    
    // In Supabase, delete all first
    const { error: delTxErr } = await supabase.from('transactions').delete().neq('id', 'dummy');
    const { error: delCatErr } = await supabase.from('categories').delete().neq('id', 'dummy');
    const { error: delProdErr } = await supabase.from('products').delete().neq('id', 'dummy');
    
    if (delTxErr) throw delTxErr;
    if (delCatErr) throw delCatErr;
    if (delProdErr) throw delProdErr;

    const now = new Date().toISOString();

    // Map and insert categories
    if (body.categories && Array.isArray(body.categories) && body.categories.length > 0) {
      const catsToInsert = body.categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        type: cat.type,
        bgClass: cat.bgClass,
        textClass: cat.textClass,
        borderClass: cat.borderClass,
        hex: cat.hex,
        colorName: cat.colorName,
        created_at: now,
        updated_at: now
      }));
      const { error: catInsertErr } = await supabase.from('categories').insert(catsToInsert);
      if (catInsertErr) throw catInsertErr;
    }

    // Map and insert transactions
    if (body.transactions && Array.isArray(body.transactions) && body.transactions.length > 0) {
      const txToInsert = body.transactions.map(tx => ({
        id: tx.id,
        description: tx.description,
        amount: tx.amount,
        type: tx.type,
        category: tx.category,
        date: tx.date,
        quantity: tx.quantity ?? 1,
        payment_method: tx.payment_method ?? 'Tunai',
        created_at: now,
        updated_at: now
      }));
      const { error: txInsertErr } = await supabase.from('transactions').insert(txToInsert);
      if (txInsertErr) throw txInsertErr;
    }

    // Map and insert products
    if (body.products && Array.isArray(body.products) && body.products.length > 0) {
      const prodToInsert = body.products.map(prod => ({
        id: prod.id,
        name: prod.name,
        price: prod.price,
        description: prod.description || '',
        status: prod.status || 'Tersedia',
        created_at: now,
        updated_at: now
      }));
      const { error: prodInsertErr } = await supabase.from('products').insert(prodToInsert);
      if (prodInsertErr) throw prodInsertErr;
    }

    // Retrieve and return final data
    const { data: finalCats, error: getCatsErr } = await supabase.from('categories').select('*');
    if (getCatsErr) throw getCatsErr;

    const { data: finalTxs, error: getTxsErr } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });
    if (getTxsErr) throw getTxsErr;

    const { data: finalProds, error: getProdsErr } = await supabase.from('products').select('*');
    if (getProdsErr) throw getProdsErr;

    // Catat log aktivitas
    await logActivity(
      user.email,
      'Memulihkan Cadangan Data',
      `Kategori: ${body.categories?.length || 0}, Transaksi: ${body.transactions?.length || 0}, Produk: ${body.products?.length || 0}`
    );

    return json({
      message: 'Data imported successfully',
      categories: finalCats,
      transactions: finalTxs,
      products: finalProds
    });
  } catch (err) {
    return json({ message: err.message }, { status: 500 });
  }
}

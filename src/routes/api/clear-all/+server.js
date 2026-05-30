import supabase from '$lib/server/db';
import { authenticate } from '$lib/server/auth';
import { json } from '@sveltejs/kit';

export async function POST({ request, cookies }) {
  try {
    const { error: authError } = await authenticate(request, cookies);
    if (authError) {
      return json({ message: authError.message }, { status: 401 });
    }

    // Delete all records in transactions, categories, products
    const { error: err1 } = await supabase.from('transactions').delete().neq('id', 'dummy');
    const { error: err2 } = await supabase.from('categories').delete().neq('id', 'dummy');
    const { error: err3 } = await supabase.from('products').delete().neq('id', 'dummy');
    
    if (err1) throw err1;
    if (err2) throw err2;
    if (err3) throw err3;
    
    return json({
      message: 'All data cleared successfully',
      categories: [],
      transactions: [],
      products: []
    });
  } catch (err) {
    return json({ message: err.message }, { status: 500 });
  }
}

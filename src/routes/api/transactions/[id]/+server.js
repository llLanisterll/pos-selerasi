import supabase from '$lib/server/db';
import { authenticate } from '$lib/server/auth';
import { json } from '@sveltejs/kit';

export async function DELETE({ params, request, cookies }) {
  const { id } = params;
  try {
    const { error: authError } = await authenticate(request, cookies);
    if (authError) {
      return json({ message: authError.message }, { status: 401 });
    }

    // Check if transaction exists
    const { data: transaction, error: getError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (getError) throw getError;
    if (!transaction) {
      return json({ message: 'Transaksi tidak ditemukan' }, { status: 404 });
    }
    
    const { error: deleteError } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;
    return json({ message: 'Transaction deleted successfully' });
  } catch (err) {
    return json({ message: err.message }, { status: 500 });
  }
}

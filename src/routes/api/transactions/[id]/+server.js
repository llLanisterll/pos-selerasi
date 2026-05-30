import supabase from '$lib/server/db';
import { json } from '@sveltejs/kit';

export async function DELETE({ params }) {
  const { id } = params;
  try {
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

import { supabase } from '$lib/server/db';
import { authenticate } from '$lib/server/auth';
import { json } from '@sveltejs/kit';

export async function GET({ request, cookies }) {
  try {
    // Hanya superadmin yang dapat melihat log sistem
    const { error: authError } = await authenticate(request, cookies, 'superadmin');
    if (authError) {
      return json({ message: authError.message }, { status: 403 });
    }

    const { data: logs, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100); // Batasi 100 log terakhir demi performa

    if (error) throw error;
    
    return json(logs);
  } catch (err) {
    return json({ message: err.message }, { status: 500 });
  }
}

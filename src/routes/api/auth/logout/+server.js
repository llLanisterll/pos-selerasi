import supabase from '$lib/server/db';
import { json } from '@sveltejs/kit';

export async function POST({ cookies }) {
  try {
    // Clear session token in Supabase (if possible, though token is stateless on server, signOut removes active session)
    await supabase.auth.signOut();
    
    // Clear the HTTP-Only cookie
    cookies.delete('session', { path: '/' });
    
    return json({ message: 'Logout berhasil.' });
  } catch (err) {
    return json({ message: err.message }, { status: 500 });
  }
}

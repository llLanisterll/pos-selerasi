import supabase from '$lib/server/db';
import { json } from '@sveltejs/kit';

export async function POST({ request, cookies }) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return json({ message: 'Email dan password wajib diisi.' }, { status: 400 });
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      return json({ message: error.message }, { status: 401 });
    }
    
    const session = data.session;
    
    // Set HTTP-Only Cookie untuk menyimpan session token secara aman
    cookies.set('session', session.access_token, {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: session.expires_in
    });
    
    return json({
      message: 'Login berhasil.',
      user: data.user,
      session: {
        expires_at: session.expires_at
      }
    });
  } catch (err) {
    return json({ message: err.message }, { status: 500 });
  }
}

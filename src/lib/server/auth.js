import supabase from '$lib/server/db';

/**
 * Memverifikasi token autentikasi dari cookies atau header Authorization.
 * @param {Request} request 
 * @param {import('@sveltejs/kit').Cookies} cookies
 * @returns {Promise<{ user: import('@supabase/supabase-js').User|null, error: Error|null }>}
 */
export async function authenticate(request, cookies) {
  let token = cookies.get('session');
  
  if (!token) {
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }
  
  if (!token) {
    return { user: null, error: new Error('Sesi tidak ditemukan. Silakan login kembali.') };
  }
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return { user: null, error: error || new Error('Sesi tidak valid atau telah kedaluwarsa.') };
    }
    return { user, error: null };
  } catch (err) {
    return { user: null, error: err };
  }
}

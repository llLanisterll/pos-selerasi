import supabase from '$lib/server/db';

/**
 * Memverifikasi token autentikasi dari cookies atau header Authorization, serta opsional mengecek role user.
 * @param {Request} request 
 * @param {import('@sveltejs/kit').Cookies} cookies
 * @param {string|null} requiredRole - Role yang diperlukan (misal: 'superadmin')
 * @returns {Promise<{ user: import('@supabase/supabase-js').User|null, error: Error|null }>}
 */
export async function authenticate(request, cookies, requiredRole = null) {
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
    
    // Verifikasi peran jika diperlukan
    if (requiredRole) {
      const userRole = user.user_metadata?.role || 'owner'; // Default ke 'owner' jika role kosong
      if (userRole !== requiredRole) {
        return { user, error: new Error('Anda tidak memiliki izin (hak akses) untuk melakukan operasi ini.') };
      }
    }
    
    return { user, error: null };
  } catch (err) {
    return { user: null, error: err };
  }
}

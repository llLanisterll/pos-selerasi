import supabase from '$lib/server/db';
import { isMaintenanceActive } from './maintenance.js';

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

    const userRole = user.user_metadata?.role || 'owner'; // Default ke 'owner' jika role kosong

    // Cek Mode Pemeliharaan (Maintenance Mode)
    // Hanya Superadmin yang diizinkan masuk/mengakses API selama pemeliharaan berjalan
    if (isMaintenanceActive() && userRole !== 'superadmin') {
      return { user: null, error: new Error('MAINTENANCE_MODE: Aplikasi sedang dalam pemeliharaan oleh Superadmin.') };
    }
    
    // Verifikasi peran jika diperlukan
    if (requiredRole) {
      if (requiredRole === 'superadmin') {
        // Owner dan superadmin sama-sama memiliki wewenang administratif penuh
        if (userRole !== 'superadmin' && userRole !== 'owner') {
          return { user, error: new Error('Anda tidak memiliki izin (hak akses) untuk melakukan operasi ini.') };
        }
      } else if (requiredRole === 'superadmin-strict') {
        // Hanya superadmin murni yang diperbolehkan untuk operasi database yang sangat merusak
        if (userRole !== 'superadmin') {
          return { user, error: new Error('Operasi ini sangat sensitif dan hanya dapat dilakukan oleh Superadmin.') };
        }
      } else if (userRole !== requiredRole) {
        return { user, error: new Error('Anda tidak memiliki izin (hak akses) untuk melakukan operasi ini.') };
      }
    }
    
    return { user, error: null };
  } catch (err) {
    return { user: null, error: err };
  }
}

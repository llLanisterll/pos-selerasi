import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '$env/static/private';
import { env } from '$env/dynamic/private';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Client dengan hak akses Admin (Service Role) untuk manajemen user
export const supabaseAdmin = env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

/**
 * Mencatat aktivitas pengguna ke database.
 * @param {string} userEmail 
 * @param {string} action 
 * @param {string} details 
 */
export async function logActivity(userEmail, action, details = '') {
  try {
    const { error } = await supabase.from('activity_logs').insert({
      user_email: userEmail,
      action,
      details
    });
    if (error) {
      console.error('Error writing activity log:', error.message);
    }
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
}

export default supabase;

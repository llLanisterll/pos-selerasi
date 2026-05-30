import { supabaseAdmin } from '$lib/server/db';
import { authenticate } from '$lib/server/auth';
import { json } from '@sveltejs/kit';

export async function GET({ request, cookies }) {
  try {
    // Pastikan user adalah superadmin
    const { error: authError } = await authenticate(request, cookies, 'superadmin');
    if (authError) {
      return json({ message: authError.message }, { status: 403 });
    }

    if (!supabaseAdmin) {
      return json({ message: 'Service Role Key belum diatur. Pengaturan user dinonaktifkan.' }, { status: 500 });
    }

    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
    
    if (error) throw error;
    
    // Kembalikan daftar user dengan data yang dibutuhkan saja demi privasi/keamanan
    const formattedUsers = users.map(u => ({
      id: u.id,
      email: u.email,
      role: u.user_metadata?.role || 'owner',
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at
    }));

    return json(formattedUsers);
  } catch (err) {
    return json({ message: err.message }, { status: 500 });
  }
}

export async function POST({ request, cookies }) {
  try {
    // Pastikan user adalah superadmin
    const { error: authError } = await authenticate(request, cookies, 'superadmin');
    if (authError) {
      return json({ message: authError.message }, { status: 403 });
    }

    if (!supabaseAdmin) {
      return json({ message: 'Service Role Key belum diatur. Pengaturan user dinonaktifkan.' }, { status: 500 });
    }

    const body = await request.json();
    const { email, password, role } = body;

    if (!email || !password || !role) {
      return json({ message: 'Email, password, dan role wajib diisi.' }, { status: 400 });
    }

    if (role !== 'owner' && role !== 'superadmin') {
      return json({ message: 'Role tidak valid.' }, { status: 400 });
    }

    const { data: { user }, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Langsung aktif tanpa perlu konfirmasi email
      user_metadata: { role }
    });

    if (error) {
      return json({ message: error.message }, { status: 422 });
    }

    return json({
      message: 'User baru berhasil dibuat.',
      user: {
        id: user.id,
        email: user.email,
        role: user.user_metadata?.role
      }
    }, { status: 201 });
  } catch (err) {
    return json({ message: err.message }, { status: 500 });
  }
}

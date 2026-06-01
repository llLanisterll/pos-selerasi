import { supabaseAdmin, logActivity } from '$lib/server/db';
import { authenticate } from '$lib/server/auth';
import { json } from '@sveltejs/kit';

export async function DELETE({ params, request, cookies }) {
  const { id } = params;
  try {
    // Pastikan user adalah superadmin
    const { user: currentAdmin, error: authError } = await authenticate(request, cookies, 'superadmin');
    if (authError) {
      return json({ message: authError.message }, { status: 403 });
    }

    if (!supabaseAdmin) {
      return json({ message: 'Service Role Key belum diatur. Pengaturan user dinonaktifkan.' }, { status: 500 });
    }

    // Cegah menghapus diri sendiri
    if (currentAdmin.id === id) {
      return json({ message: 'Anda tidak dapat menghapus akun Anda sendiri yang sedang digunakan.' }, { status: 400 });
    }

    // Ambil info user sebelum dihapus untuk kebutuhan logging
    const { data: { user: userToDelete } } = await supabaseAdmin.auth.admin.getUserById(id);
    const targetEmail = userToDelete?.email || id;

    const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
    
    if (error) {
      return json({ message: error.message }, { status: 422 });
    }

    // Catat log aktivitas
    await logActivity(currentAdmin.email, 'Menghapus Pengguna', `Email: ${targetEmail}`);

    return json({ message: 'User berhasil dihapus.' });
  } catch (err) {
    return json({ message: err.message }, { status: 500 });
  }
}

export async function PUT({ params, request, cookies }) {
  const { id } = params;
  try {
    // Pastikan user adalah superadmin
    const { user: currentAdmin, error: authError } = await authenticate(request, cookies, 'superadmin');
    if (authError) {
      return json({ message: authError.message }, { status: 403 });
    }

    if (!supabaseAdmin) {
      return json({ message: 'Service Role Key belum diatur. Pengaturan user dinonaktifkan.' }, { status: 500 });
    }

    const body = await request.json();
    const { role, password } = body;

    const updateData = {};
    if (role) {
      if (role !== 'owner' && role !== 'superadmin') {
        return json({ message: 'Role tidak valid.' }, { status: 400 });
      }
      updateData.user_metadata = { role };
    }

    if (password) {
      if (password.length < 6) {
        return json({ message: 'Password minimal 6 karakter.' }, { status: 400 });
      }
      updateData.password = password;
    }

    // Cegah mengunci/menurunkan peran diri sendiri
    const currentRole = currentAdmin.user_metadata?.role || 'owner';
    if (currentAdmin.id === id && role && role !== currentRole) {
      if (currentRole === 'superadmin' && role === 'owner') {
        return json({ message: 'Anda tidak dapat menurunkan peran (demote) akun Anda sendiri.' }, { status: 400 });
      }
    }

    // Ambil info user sebelum diperbarui untuk kebutuhan logging
    const { data: { user: userToUpdate } } = await supabaseAdmin.auth.admin.getUserById(id);
    const targetEmail = userToUpdate?.email || id;

    const { data: { user }, error } = await supabaseAdmin.auth.admin.updateUserById(id, updateData);

    if (error) {
      return json({ message: error.message }, { status: 422 });
    }

    // Catat log aktivitas
    let logDetail = `Email: ${targetEmail}`;
    if (role) logDetail += `, Peran: ${role}`;
    if (password) logDetail += `, Sandi diubah`;
    await logActivity(currentAdmin.email, 'Memperbarui Pengguna', logDetail);

    return json({
      message: 'User berhasil diperbarui.',
      user: {
        id: user.id,
        email: user.email,
        role: user.user_metadata?.role
      }
    });
  } catch (err) {
    return json({ message: err.message }, { status: 500 });
  }
}

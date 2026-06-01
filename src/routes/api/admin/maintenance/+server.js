import { isMaintenanceActive, setMaintenanceActive } from '$lib/server/maintenance';
import { authenticate } from '$lib/server/auth';
import { logActivity } from '$lib/server/db';
import { json } from '@sveltejs/kit';

export async function GET() {
  return json({ active: isMaintenanceActive() });
}

export async function POST({ request, cookies }) {
  try {
    // Hanya superadmin yang dapat mengubah status mode pemeliharaan
    const { user: currentAdmin, error: authError } = await authenticate(request, cookies, 'superadmin');
    if (authError) {
      return json({ message: authError.message }, { status: 403 });
    }

    // Perlu dicek secara manual karena authenticate melewatkan check jika userRole === 'superadmin'
    const userRole = currentAdmin.user_metadata?.role || 'owner';
    if (userRole !== 'superadmin') {
      return json({ message: 'Anda tidak memiliki hak akses Superadmin.' }, { status: 403 });
    }

    const body = await request.json();
    const { active } = body;

    if (typeof active !== 'boolean') {
      return json({ message: 'Parameter "active" harus berupa boolean.' }, { status: 400 });
    }

    setMaintenanceActive(active);

    // Catat log aktivitas
    await logActivity(
      currentAdmin.email,
      active ? 'Mengaktifkan Mode Pemeliharaan' : 'Menonaktifkan Mode Pemeliharaan',
      `Status Pemeliharaan: ${active ? 'AKTIF' : 'NONAKTIF'}`
    );

    return json({
      message: `Mode pemeliharaan berhasil ${active ? 'diaktifkan' : 'dinonaktifkan'}.`,
      active
    });
  } catch (err) {
    return json({ message: err.message }, { status: 500 });
  }
}

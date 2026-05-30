import { authenticate } from '$lib/server/auth';
import { json } from '@sveltejs/kit';

export async function GET({ request, cookies }) {
  const { user, error } = await authenticate(request, cookies);
  
  if (error || !user) {
    return json({ user: null, message: error?.message || 'Sesi tidak aktif.' }, { status: 401 });
  }
  
  return json({ user });
}

import supabase from '$lib/server/db';
import { json } from '@sveltejs/kit';

export async function GET() {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return json(products);
  } catch (err) {
    return json({ message: err.message }, { status: 500 });
  }
}

export async function POST({ request }) {
  try {
    const body = await request.json();
    const name = body.name.trim();
    
    // Check if name is taken (case-insensitive)
    const { data: existing, error: getError } = await supabase
      .from('products')
      .select('*')
      .ilike('name', name)
      .maybeSingle();

    if (getError) throw getError;
    if (existing) {
      return json({ message: 'Nama menu sudah terdaftar.' }, { status: 422 });
    }
    
    const now = new Date().toISOString();
    const { data: added, error: insertError } = await supabase
      .from('products')
      .insert({
        id: body.id,
        name: name,
        price: body.price,
        description: body.description || '',
        status: body.status || 'Tersedia',
        created_at: now,
        updated_at: now
      })
      .select()
      .single();

    if (insertError) throw insertError;
    return json(added, { status: 201 });
  } catch (err) {
    return json({ message: err.message }, { status: 500 });
  }
}

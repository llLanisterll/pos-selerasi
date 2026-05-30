import supabase from '$lib/server/db';
import { json } from '@sveltejs/kit';

export async function PUT({ params, request }) {
  const { id } = params;
  try {
    const body = await request.json();
    
    // Check if category exists
    const { data: category, error: getError } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (getError) throw getError;
    if (!category) {
      return json({ message: 'Kategori tidak ditemukan' }, { status: 404 });
    }
    
    const newName = body.name.trim();
    
    // Check if name is taken by another category (case-insensitive)
    const { data: duplicate, error: dupError } = await supabase
      .from('categories')
      .select('*')
      .ilike('name', newName)
      .neq('id', id)
      .maybeSingle();

    if (dupError) throw dupError;
    if (duplicate) {
      return json({ message: 'Nama kategori sudah terdaftar' }, { status: 422 });
    }
    
    const oldName = category.name;
    const now = new Date().toISOString();
    
    // Update category
    const { data: updated, error: updateError } = await supabase
      .from('categories')
      .update({
        name: newName,
        type: body.type,
        bgClass: body.bgClass,
        textClass: body.textClass,
        borderClass: body.borderClass,
        hex: body.hex,
        colorName: body.colorName,
        updated_at: now
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;
    
    // If the category name changed, update all transactions referencing it
    if (oldName !== newName) {
      const { error: txUpdateError } = await supabase
        .from('transactions')
        .update({
          category: newName,
          updated_at: now
        })
        .eq('category', oldName);
      
      if (txUpdateError) throw txUpdateError;
    }
    
    return json(updated);
  } catch (err) {
    return json({ message: err.message }, { status: 500 });
  }
}

export async function DELETE({ params }) {
  const { id } = params;
  try {
    const { data: category, error: getError } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (getError) throw getError;
    if (!category) {
      return json({ message: 'Kategori tidak ditemukan' }, { status: 404 });
    }
    
    const { error: deleteError } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;
    
    return json({ message: 'Category deleted successfully' });
  } catch (err) {
    return json({ message: err.message }, { status: 500 });
  }
}

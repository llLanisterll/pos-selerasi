import { writable } from 'svelte/store';

const API_URL = '/api';

export const products = writable([]);

export async function fetchProducts() {
  try {
    const res = await fetch(`${API_URL}/products`);
    if (res.ok) {
      const data = await res.json();
      products.set(data);
    } else {
      console.error('Failed to fetch products:', res.statusText);
    }
  } catch (err) {
    console.error('Error fetching products:', err);
  }
}

export async function addProductApi(newProd) {
  try {
    const res = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProd)
    });
    if (res.ok) {
      const added = await res.json();
      products.update(existing => [...existing, added]);
      return added;
    } else {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Gagal menambahkan produk');
    }
  } catch (err) {
    console.error('Error in addProductApi:', err);
    throw err;
  }
}

export async function updateProductApi(id, updatedFields) {
  try {
    const res = await fetch(`${API_URL}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedFields)
    });
    if (res.ok) {
      const updated = await res.json();
      products.update(existing => existing.map(p => p.id === id ? updated : p));
      return updated;
    } else {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Gagal memperbarui produk');
    }
  } catch (err) {
    console.error('Error in updateProductApi:', err);
    throw err;
  }
}

export async function deleteProductApi(id) {
  try {
    const res = await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE'
    });
    if (res.ok) {
      products.update(existing => existing.filter(p => p.id !== id));
      return true;
    } else {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Gagal menghapus produk');
    }
  } catch (err) {
    console.error('Error in deleteProductApi:', err);
    throw err;
  }
}

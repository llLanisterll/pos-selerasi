import { writable, derived } from 'svelte/store';

const API_URL = '/api';

export const mockTransactions = [
  { id: '1', description: 'Penjualan 120 Porsi Ricebowl (Dine-in & Takeaway)', amount: 3000000, type: 'income', date: '2026-05-28', quantity: 120, payment_method: 'QRIS' },
  { id: '2', description: 'Pencairan GoFood & GrabFood Mingguan', amount: 4500000, type: 'income', date: '2026-05-27', quantity: 180, payment_method: 'Aplikasi Online' },
  { id: '3', description: 'Belanja Beras, Ayam Fillet, & Sayuran di Pasar', amount: 150000, type: 'expense', category: 'Bahan Baku', date: '2026-05-26', quantity: 1, payment_method: 'Tunai' },
  { id: '4', description: 'Beli Paper Bowl Sablon Logo Selerasi 1.000 Pcs', amount: 1200000, type: 'expense', category: 'Packaging', date: '2026-05-25', quantity: 1000, payment_method: 'Transfer Bank' },
  { id: '5', description: 'DP Pesanan Katering Acara Kantor Bank Mandiri', amount: 2000000, type: 'income', date: '2026-05-24', quantity: 80, payment_method: 'Transfer Bank' }
];

export const categories = writable([]);
export const transactions = writable([]);

export async function fetchCategories() {
  try {
    const res = await fetch(`${API_URL}/categories`);
    if (res.ok) {
      const data = await res.json();
      categories.set(data);
    }
  } catch (err) {
    console.error('Error fetching categories:', err);
  }
}

export async function fetchTransactions() {
  try {
    const res = await fetch(`${API_URL}/transactions`);
    if (res.ok) {
      const data = await res.json();
      transactions.set(data);
    }
  } catch (err) {
    console.error('Error fetching transactions:', err);
  }
}

export async function addCategoryApi(newCat) {
  try {
    const res = await fetch(`${API_URL}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCat)
    });
    if (res.ok) {
      const added = await res.json();
      categories.update(existing => [...existing, added]);
      return added;
    }
  } catch (err) {
    console.error('Error adding category:', err);
    throw err;
  }
}

export async function updateCategoryApi(id, updatedFields) {
  try {
    const res = await fetch(`${API_URL}/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedFields)
    });
    if (res.ok) {
      const updated = await res.json();
      categories.update(existing => existing.map(c => c.id === id ? updated : c));
      await fetchTransactions();
      return updated;
    }
  } catch (err) {
    console.error('Error updating category:', err);
    throw err;
  }
}

export async function deleteCategoryApi(id) {
  try {
    const res = await fetch(`${API_URL}/categories/${id}`, { method: 'DELETE' });
    if (res.ok) {
      categories.update(existing => existing.filter(c => c.id !== id));
      return true;
    }
  } catch (err) {
    console.error('Error deleting category:', err);
    throw err;
  }
}

export async function addTransactionApi(newTx) {
  try {
    const res = await fetch(`${API_URL}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTx)
    });
    if (res.ok) {
      const added = await res.json();
      transactions.update(existing => [added, ...existing]);
      return added;
    }
  } catch (err) {
    console.error('Error in addTransactionApi:', err);
    throw err;
  }
}

export async function deleteTransactionApi(id) {
  try {
    const res = await fetch(`${API_URL}/transactions/${id}`, {
      method: 'DELETE'
    });
    if (res.ok) {
      transactions.update(existing => existing.filter(t => t.id !== id));
      return true;
    }
  } catch (err) {
    console.error('Error in deleteTransactionApi:', err);
    throw err;
  }
}

export async function resetDemoApi() {
  try {
    const res = await fetch(`${API_URL}/reset-demo`, { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      categories.set(data.categories);
      transactions.set(data.transactions);
      return true;
    }
  } catch (err) {
    return false;
  }
}

export async function clearAllApi() {
  try {
    const res = await fetch(`${API_URL}/clear-all`, { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      categories.set(data.categories);
      transactions.set(data.transactions);
      return true;
    }
  } catch (err) {
    return false;
  }
}

export async function importDataApi(importedPayload) {
  try {
    const res = await fetch(`${API_URL}/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(importedPayload)
    });
    if (res.ok) {
      const data = await res.json();
      categories.set(data.categories);
      transactions.set(data.transactions);
      return true;
    }
    return false;
  } catch (err) {
    console.error('Error importing data:', err);
    return false;
  }
}

export const totalIncome = derived(transactions, ($transactions) => {
  return $transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);
});

export const totalExpense = derived(transactions, ($transactions) => {
  return $transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);
});

export const totalBalance = derived([totalIncome, totalExpense], ([$totalIncome, $totalExpense]) => {
  return $totalIncome - $totalExpense;
});

export const totalPortionsSold = derived(transactions, ($transactions) => {
  return $transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + (Number(t.quantity) || 0), 0);
});

export function getCategoryStyle(categoryName, categoriesList) {
  const cat = categoriesList.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
  if (cat) {
    return `${cat.bgClass} ${cat.textClass} ${cat.borderClass}`;
  }
  return 'bg-brand-100 text-warm-700 border-brand-200';
}

export function getCategoryHex(categoryName, categoriesList) {
  const cat = categoriesList.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
  return cat ? cat.hex : '#71717a';
}

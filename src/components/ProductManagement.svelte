<script>
  import { onMount } from 'svelte';
  import { 
    products, 
    fetchProducts, 
    addProductApi, 
    updateProductApi, 
    deleteProductApi 
  } from '../stores/productStore';
  import { addNotification } from '../stores/notificationStore';
  import { askConfirmation } from '../stores/confirmationStore';

  // Form states
  let name = '';
  let price = '';
  let description = '';
  let status = 'Tersedia';
  let editingProductId = null; // null for create mode, ID for edit mode
  
  onMount(() => {
    fetchProducts();
  });

  // Helper to format Rupiah
  function formatRupiah(value) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  async function handleSave(e) {
    e.preventDefault();

    if (!name.trim()) {
      alert('Nama menu tidak boleh kosong.');
      return;
    }
    if (!price || Number(price) < 0) {
      alert('Harga produk harus berupa angka positif.');
      return;
    }

    // Check duplicate names (excluding currently edited item)
    const duplicate = $products.find(p => 
      p.name.toLowerCase() === name.trim().toLowerCase() && 
      p.id !== editingProductId
    );
    if (duplicate) {
      alert('Nama menu sudah terdaftar.');
      return;
    }

    const payload = {
      name: name.trim(),
      price: Number(price),
      description: description.trim(),
      status
    };

    try {
      if (editingProductId) {
        // Edit Mode
        await updateProductApi(editingProductId, payload);
        addNotification('Menu berhasil diperbarui!', 'success');
      } else {
        // Create Mode
        const newProduct = {
          id: 'p_' + Date.now().toString(),
          ...payload
        };
        await addProductApi(newProduct);
        addNotification('Menu baru berhasil ditambahkan!', 'success');
      }

      resetForm();
    } catch (err) {
      addNotification('Gagal menyimpan menu: ' + err.message, 'error');
    }
  }

  function startEdit(product) {
    editingProductId = product.id;
    name = product.name;
    price = product.price;
    description = product.description || '';
    status = product.status || 'Tersedia';
  }

  async function handleDelete(product) {
    askConfirmation({
      title: 'Hapus Menu',
      message: `Apakah Anda yakin ingin menghapus menu "${product.name}"?`,
      confirmText: 'Hapus',
      type: 'danger',
      onConfirm: async () => {
        try {
          await deleteProductApi(product.id);
          addNotification(`Menu "${product.name}" berhasil dihapus.`, 'success');
          
          if (editingProductId === product.id) {
            resetForm();
          }
        } catch (err) {
          addNotification('Gagal menghapus menu: ' + err.message, 'error');
        }
      }
    });
  }

  function resetForm() {
    name = '';
    price = '';
    description = '';
    status = 'Tersedia';
    editingProductId = null;
  }
</script>

<div class="space-y-8 animate-fade-in">
  <!-- View Header -->
  <div class="pb-6 border-b border-brand-300/60">
    <h1 class="text-2xl font-bold tracking-tight text-warm-900">Daftar Menu Ricebowl</h1>
    <p class="text-sm text-warm-500 mt-1">Kelola menu makanan Selerasi, harga jual, deskripsi resep, dan ketersediaan stok.</p>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
    
    <!-- Left Column: Form -->
    <div class="bg-white/70 backdrop-blur-sm border border-brand-300/60 rounded-2xl p-6 md:col-span-1 shadow-sm">
      <h3 class="text-sm font-semibold text-warm-900 pb-3 border-b border-brand-200/60 mb-5">
        {editingProductId ? 'Edit Menu Selerasi' : 'Tambah Menu Baru'}
      </h3>

      <form on:submit={handleSave} class="space-y-4">
        <!-- Product Name Input -->
        <div class="space-y-1.5">
          <label for="prod-name" class="text-xs font-medium text-warm-600">Nama Menu Ricebowl</label>
          <input
            id="prod-name"
            type="text"
            placeholder="Contoh: Ricebowl Sambal Matah"
            bind:value={name}
            required
            class="w-full px-3 py-2 bg-brand-50 border border-brand-300/60 text-warm-900 placeholder-warm-300 focus:border-brand-700 focus:ring-1 focus:ring-brand-600/30 focus:outline-none transition-colors rounded-xl text-sm"
          />
        </div>

        <!-- Price Input -->
        <div class="space-y-1.5">
          <label for="prod-price" class="text-xs font-medium text-warm-600">Harga Jual (Rupiah)</label>
          <div class="relative">
            <span class="absolute left-3 top-2.5 text-xs text-warm-400 font-semibold select-none">Rp</span>
            <input
              id="prod-price"
              type="number"
              min="0"
              placeholder="0"
              bind:value={price}
              required
              class="w-full pl-9 pr-3 py-2 bg-brand-50 border border-brand-300/60 text-warm-900 placeholder-warm-300 focus:border-brand-700 focus:ring-1 focus:ring-brand-600/30 focus:outline-none transition-colors rounded-xl text-sm"
            />
          </div>
        </div>

        <!-- Availability Status -->
        <div class="space-y-1.5">
          <label for="prod-status" class="text-xs font-medium text-warm-600">Status Menu</label>
          <select
            id="prod-status"
            bind:value={status}
            required
            class="w-full px-3 py-2 bg-brand-50 border border-brand-300/60 text-warm-900 focus:border-brand-700 focus:ring-1 focus:ring-brand-600/30 focus:outline-none transition-colors rounded-xl text-sm"
          >
            <option value="Tersedia">Tersedia</option>
            <option value="Habis">Habis (Stok Kosong)</option>
          </select>
        </div>

        <!-- Description Input -->
        <div class="space-y-1.5">
          <label for="prod-desc" class="text-xs font-medium text-warm-600">Deskripsi / Detail Bahan (Opsional)</label>
          <textarea
            id="prod-desc"
            placeholder="Contoh: Ayam fillet crispy siram sambal bawang dengan irisan timun."
            bind:value={description}
            rows="3"
            class="w-full px-3 py-2 bg-brand-50 border border-brand-300/60 text-warm-900 placeholder-warm-300 focus:border-brand-700 focus:ring-1 focus:ring-brand-600/30 focus:outline-none transition-colors rounded-xl text-sm resize-none"
          ></textarea>
        </div>

        <!-- Action Buttons -->
        <div class="space-y-2 pt-2">
          <button
            type="submit"
            class="w-full py-2.5 bg-brand-700 hover:bg-brand-800 active:scale-[0.99] text-brand-50 text-xs font-bold rounded-xl transition-all duration-150 cursor-pointer shadow-md"
          >
            {editingProductId ? 'Simpan Perubahan' : 'Buat Menu'}
          </button>
          
          {#if editingProductId}
            <button
              type="button"
              on:click={resetForm}
              class="w-full py-2 bg-warm-100 hover:bg-warm-200 border border-warm-300 text-warm-700 text-xs font-semibold rounded-xl transition-all duration-150 cursor-pointer"
            >
              Batal
            </button>
          {/if}
        </div>
      </form>
    </div>

    <!-- Right Column: Products List Table -->
    <div class="bg-white/70 backdrop-blur-sm border border-brand-300/60 rounded-2xl p-6 md:col-span-2 shadow-sm">
      <h3 class="text-sm font-semibold text-warm-900 pb-3 border-b border-brand-200/60 mb-5">
        Daftar Menu Terdaftar ({$products.length} Menu)
      </h3>

      {#if $products.length === 0}
        <div class="flex flex-col items-center justify-center py-20 text-center">
          <div class="w-12 h-12 border-2 border-dashed border-brand-300 rounded-xl flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-warm-400">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0H2.36" />
            </svg>
          </div>
          <h3 class="text-sm font-medium text-warm-700">Belum ada menu terdaftar</h3>
          <p class="text-xs text-warm-400 mt-1">Gunakan form di samping kiri untuk menambahkan menu ricebowl pertama Selerasi.</p>
        </div>
      {:else}
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm text-warm-700">
            <thead>
              <tr class="border-b border-brand-200/60 text-[10px] font-bold tracking-wider text-warm-400 uppercase">
                <th class="py-2.5">Menu</th>
                <th class="py-2.5">Harga</th>
                <th class="py-2.5">Status</th>
                <th class="py-2.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-brand-200/60">
              {#each $products as product (product.id)}
                <tr class="group hover:bg-brand-100/50 transition-colors {editingProductId === product.id ? 'bg-brand-100/80' : ''}">
                  <td class="py-3.5 pr-4">
                    <div class="flex flex-col">
                      <span class="text-sm font-bold text-warm-800">{product.name}</span>
                      {#if product.description}
                        <span class="text-xs text-warm-400 mt-1 max-w-sm leading-relaxed">{product.description}</span>
                      {/if}
                    </div>
                  </td>
                  <td class="py-3.5 font-semibold text-warm-700">
                    {formatRupiah(product.price)}
                  </td>
                  <td class="py-3.5">
                    <span class="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border 
                      {product.status === 'Tersedia' 
                        ? 'bg-brand-100 text-brand-800 border-brand-300' 
                        : 'bg-rose-50 text-rose-600 border-rose-200'}">
                      {product.status}
                    </span>
                  </td>
                  <td class="py-3.5 text-right">
                    <div class="flex items-center justify-end space-x-2.5">
                      <button
                        on:click={() => startEdit(product)}
                        title="Edit Menu"
                        class="text-warm-500 hover:text-warm-900 text-xs font-semibold py-1 px-2.5 border border-brand-300 rounded-lg hover:bg-brand-100 transition-all cursor-pointer active:scale-95"
                      >
                        Edit
                      </button>
                      <button
                        on:click={() => handleDelete(product)}
                        title="Hapus Menu"
                        class="text-warm-400 hover:text-rose-500 text-xs font-semibold py-1 px-2.5 border border-brand-300 rounded-lg hover:bg-rose-50 transition-all cursor-pointer active:scale-95"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    </div>

  </div>
</div>

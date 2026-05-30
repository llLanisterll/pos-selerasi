<script>
  import {
    categories,
    addCategoryApi,
    updateCategoryApi,
    deleteCategoryApi,
    getCategoryStyle
  } from '../stores/expenseStore';
  import { addNotification } from '../stores/notificationStore';
  import { askConfirmation } from '../stores/confirmationStore';

  // State fields
  let name = '';
  const type = 'expense'; // Forced to expense
  let selectedSwatchName = 'Rose'; // default to Rose
  let editingCategoryId = null; // null if creating, ID string if editing

  // Color Swatches Configuration
  const colorSwatches = [
    { name: 'Emerald', hex: '#f4e9bb', bgClass: 'bg-brand-50', textClass: 'text-brand-700', borderClass: 'border-brand-200' },
    { name: 'Rose', hex: '#f43f5e', bgClass: 'bg-rose-50', textClass: 'text-rose-700', borderClass: 'border-rose-200' },
    { name: 'Amber', hex: '#f59e0b', bgClass: 'bg-amber-50', textClass: 'text-amber-700', borderClass: 'border-amber-200' },
    { name: 'Blue', hex: '#3b82f6', bgClass: 'bg-blue-50', textClass: 'text-blue-700', borderClass: 'border-blue-200' },
    { name: 'Violet', hex: '#8b5cf6', bgClass: 'bg-violet-50', textClass: 'text-violet-700', borderClass: 'border-violet-200' },
    { name: 'Indigo', hex: '#6366f1', bgClass: 'bg-indigo-50', textClass: 'text-indigo-700', borderClass: 'border-indigo-200' },
    { name: 'Pink', hex: '#ec4899', bgClass: 'bg-pink-50', textClass: 'text-pink-700', borderClass: 'border-pink-200' },
    { name: 'Slate', hex: '#64748b', bgClass: 'bg-slate-50', textClass: 'text-slate-700', borderClass: 'border-slate-200' },
  ];

  // Success message state
  let successMsg = '';

  async function handleSave(e) {
    e.preventDefault();

    if (!name.trim()) {
      alert('Nama kategori tidak boleh kosong.');
      return;
    }

    const swatch = colorSwatches.find(s => s.name === selectedSwatchName);

    // Check for duplicate names (excluding currently edited item)
    const duplicate = $categories.find(c => 
      c.type === 'expense' &&
      c.name.toLowerCase() === name.trim().toLowerCase() && 
      c.id !== editingCategoryId
    );
    if (duplicate) {
      alert('Nama kategori pengeluaran sudah ada.');
      return;
    }

    try {
      if (editingCategoryId) {
        // UPDATE MODE
        await updateCategoryApi(editingCategoryId, {
          name: name.trim(),
          type,
          bgClass: swatch.bgClass,
          textClass: swatch.textClass,
          borderClass: swatch.borderClass,
          hex: swatch.hex,
          colorName: swatch.name
        });
        addNotification('Kategori pengeluaran berhasil diperbarui!', 'success');
      } else {
        // CREATE MODE
        const newCat = {
          id: Date.now().toString(),
          name: name.trim(),
          type,
          bgClass: swatch.bgClass,
          textClass: swatch.textClass,
          borderClass: swatch.borderClass,
          hex: swatch.hex,
          colorName: swatch.name
        };
        await addCategoryApi(newCat);
        addNotification('Kategori pengeluaran baru berhasil ditambahkan!', 'success');
      }

      resetForm();
    } catch (err) {
      addNotification('Gagal menyimpan kategori: ' + err.message, 'error');
    }
  }

  function startEdit(cat) {
    editingCategoryId = cat.id;
    name = cat.name;
    selectedSwatchName = cat.colorName || 'Rose';
  }

  async function handleDelete(cat) {
    askConfirmation({
      title: 'Hapus Kategori',
      message: `Apakah Anda yakin ingin menghapus kategori "${cat.name}"?`,
      confirmText: 'Hapus',
      type: 'danger',
      onConfirm: async () => {
        try {
          await deleteCategoryApi(cat.id);
          addNotification(`Kategori "${cat.name}" berhasil dihapus.`, 'success');
          
          if (editingCategoryId === cat.id) {
            resetForm();
          }
        } catch (err) {
          addNotification('Gagal menghapus kategori: ' + err.message, 'error');
        }
      }
    });
  }

  function resetForm() {
    name = '';
    selectedSwatchName = 'Rose';
    editingCategoryId = null;
  }

  // Reactive derived list for the table
  $: expenseCategories = $categories.filter(c => c.type === 'expense');
</script>

<div class="space-y-8 animate-fade-in">
  <!-- View Header -->
  <div class="pb-6 border-b border-brand-300/60">
    <h1 class="text-2xl font-bold tracking-tight text-warm-900">Pengaturan Kategori Pengeluaran</h1>
    <p class="text-sm text-warm-500 mt-1">Kelola daftar kategori untuk merincikan setiap pengeluaran operasional Selerasi.</p>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
    
    <!-- Left Column: CRUD Form -->
    <div class="bg-white/70 backdrop-blur-sm border border-brand-300/60 rounded-2xl p-6 md:col-span-1 shadow-sm">
      <h3 class="text-sm font-semibold text-warm-900 pb-3 border-b border-brand-200/60 mb-5">
        {editingCategoryId ? 'Edit Kategori Pengeluaran' : 'Buat Kategori Baru'}
      </h3>

      <form on:submit={handleSave} class="space-y-4">
        <!-- Forced Type Info -->
        <div class="p-2 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-2">
          <div class="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
          <span class="text-[10px] font-bold text-rose-700 uppercase tracking-wider text-center">Tipe: Pengeluaran</span>
        </div>

        <!-- Name Input -->
        <div class="space-y-1.5">
          <label for="cat-name" class="text-xs font-medium text-warm-600">Nama Kategori</label>
          <input
            id="cat-name"
            type="text"
            placeholder="Contoh: Bahan Baku, Listrik, Gaji..."
            bind:value={name}
            required
            class="w-full px-3 py-2 bg-brand-50 border border-brand-300/60 text-warm-900 placeholder-warm-300 focus:border-brand-700 focus:ring-1 focus:ring-brand-600/30 focus:outline-none transition-colors rounded-xl text-sm"
          />
        </div>

        <!-- Color Swatch Picker -->
        <div class="space-y-1.5">
          <span class="text-xs font-medium text-zinc-400">Warna Aksen</span>
          <div class="grid grid-cols-4 gap-3 pt-1.5">
            {#each colorSwatches as swatch}
              <button
                type="button"
                on:click={() => selectedSwatchName = swatch.name}
                title={swatch.name}
                class="w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-150 active:scale-90 relative cursor-pointer"
                style="background-color: {swatch.hex}; border-color: {selectedSwatchName === swatch.name ? '#ffffff' : 'transparent'}"
              >
                {#if selectedSwatchName === swatch.name}
                  <span class="absolute inset-0.5 border border-zinc-950 rounded-full flex items-center justify-center text-zinc-950 text-[10px] font-bold bg-white/80">✓</span>
                {/if}
              </button>
            {/each}
          </div>
        </div>

        <!-- Submit & Actions Buttons -->
        <div class="space-y-2 pt-2">
          <button
            type="submit"
            class="w-full py-2.5 bg-brand-700 hover:bg-brand-800 active:scale-[0.99] text-brand-50 text-xs font-bold rounded-xl transition-all duration-150 cursor-pointer shadow-md"
          >
            {editingCategoryId ? 'Simpan Perubahan' : 'Buat Kategori'}
          </button>
          
          {#if editingCategoryId}
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

    <!-- Right Column: Categories List -->
    <div class="bg-white/70 backdrop-blur-sm border border-brand-300/60 rounded-2xl p-6 md:col-span-2 shadow-sm">
      <h3 class="text-sm font-semibold text-warm-900 pb-3 border-b border-brand-200/60 mb-5">
        Daftar Kategori Terdaftar ({expenseCategories.length})
      </h3>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-warm-700">
          <thead>
            <tr class="border-b border-brand-200/60 text-[10px] font-bold tracking-wider text-warm-400 uppercase">
              <th class="py-2.5">Nama Kategori</th>
              <th class="py-2.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-brand-200/60">
            {#each expenseCategories as cat (cat.id)}
              <tr class="group hover:bg-brand-100/50 transition-colors {editingCategoryId === cat.id ? 'bg-brand-100/80' : ''}">
                <td class="py-3">
                  <span class="inline-block px-2.5 py-0.5 rounded text-xs font-semibold border {getCategoryStyle(cat.name, $categories)}">
                    {cat.name}
                  </span>
                </td>
                <td class="py-3 text-right">
                  <div class="flex items-center justify-end space-x-2.5">
                    <button
                      on:click={() => startEdit(cat)}
                      title="Edit Kategori"
                      class="text-warm-500 hover:text-warm-900 text-xs font-semibold py-1 px-2.5 border border-brand-300 rounded-lg hover:bg-brand-100 transition-all cursor-pointer active:scale-95"
                    >
                      Edit
                    </button>
                    <button
                      on:click={() => handleDelete(cat)}
                      title="Hapus Kategori"
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
        {#if expenseCategories.length === 0}
          <div class="py-10 text-center text-warm-400 text-xs">Belum ada kategori pengeluaran.</div>
        {/if}
      </div>
    </div>

  </div>

</div>

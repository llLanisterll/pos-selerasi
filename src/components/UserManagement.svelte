<script>
  import { onMount } from 'svelte';
  import {
    categories,
    transactions,
    resetDemoApi,
    clearAllApi,
    importDataApi
  } from '../stores/expenseStore';
  import { addNotification } from '../stores/notificationStore';
  import { askConfirmation } from '../stores/confirmationStore';

  // State untuk User Management & Peran Aktif
  export let userRole = 'owner';
  let users = [];
  let email = '';
  let password = '';
  let role = 'owner'; // Default role
  let loadingUsers = true;
  let submittingUser = false;
  let userError = '';

  // State untuk Statistik
  let stats = { usersCount: 0, productsCount: 0, categoriesCount: 0, transactionsCount: 0 };
  let loadingStats = true;

  // State untuk Edit User Modal
  let editingUser = null;
  let editRole = 'owner';
  let editPassword = '';
  let submittingEdit = false;
  let showEditModal = false;

  // Backup & Reset file input
  let fileInput;

  onMount(async () => {
    await Promise.all([
      fetchUsers(),
      fetchStats()
    ]);
  });

  async function fetchUsers() {
    loadingUsers = true;
    userError = '';
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        users = await res.json();
      } else {
        const errData = await res.json();
        userError = errData.message || 'Gagal memuat daftar user.';
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      userError = 'Koneksi gagal saat memuat user.';
    } finally {
      loadingUsers = false;
    }
  }

  async function fetchStats() {
    loadingStats = true;
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        stats = await res.json();
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      loadingStats = false;
    }
  }

  async function handleCreateUser(e) {
    e.preventDefault();
    if (submittingUser) return;

    if (!email.trim() || !password.trim()) {
      addNotification('Email dan password wajib diisi.', 'warning');
      return;
    }

    submittingUser = true;
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password, role })
      });
      const data = await res.json();

      if (res.ok) {
        addNotification(`User baru (${email}) berhasil ditambahkan sebagai ${role === 'superadmin' ? 'Superadmin' : 'Owner'}!`, 'success');
        email = '';
        password = '';
        role = 'owner';
        await Promise.all([fetchUsers(), fetchStats()]); // Refresh list & stats
      } else {
        addNotification(data.message || 'Gagal membuat user baru.', 'error');
      }
    } catch (err) {
      console.error('Error creating user:', err);
      addNotification('Gagal terhubung ke server.', 'error');
    } finally {
      submittingUser = false;
    }
  }

  function openEditModal(user) {
    editingUser = user;
    editRole = user.role || 'owner';
    editPassword = '';
    showEditModal = true;
  }

  async function handleEditUser(e) {
    e.preventDefault();
    if (submittingEdit) return;

    submittingEdit = true;
    try {
      const res = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: editRole,
          password: editPassword.trim() ? editPassword : undefined
        })
      });
      const data = await res.json();

      if (res.ok) {
        addNotification(`User ${editingUser.email} berhasil diperbarui!`, 'success');
        showEditModal = false;
        editingUser = null;
        await Promise.all([fetchUsers(), fetchStats()]);
      } else {
        addNotification(data.message || 'Gagal memperbarui user.', 'error');
      }
    } catch (err) {
      console.error('Error editing user:', err);
      addNotification('Gagal terhubung ke server.', 'error');
    } finally {
      submittingEdit = false;
    }
  }

  async function handleDeleteUser(userToDelete) {
    askConfirmation({
      title: 'Hapus User',
      message: `Apakah Anda yakin ingin menghapus akun "${userToDelete.email}" secara permanen? Akun tersebut tidak akan bisa masuk lagi ke sistem.`,
      confirmText: 'Hapus Akun',
      type: 'danger',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/users/${userToDelete.id}`, {
            method: 'DELETE'
          });
          const data = await res.json();

          if (res.ok) {
            addNotification(`Akun "${userToDelete.email}" berhasil dihapus.`, 'success');
            await Promise.all([fetchUsers(), fetchStats()]);
          } else {
            addNotification(data.message || 'Gagal menghapus user.', 'error');
          }
        } catch (err) {
          console.error('Error deleting user:', err);
          addNotification('Gagal terhubung ke server.', 'error');
        }
      }
    });
  }

  // ==========================================
  // LOGIKA BACKUP & UTILITIES (Dipindahkan dari SettingsView)
  // ==========================================
  
  function handleExport() {
    const data = {
      categories: $categories,
      transactions: $transactions,
      exportedAt: new Date().toISOString()
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `selerasi_cadangan_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    addNotification('Cadangan data berhasil diekspor!', 'success');
  }

  function handleExportCSV() {
    if (!$transactions || $transactions.length === 0) {
      addNotification('Tidak ada data transaksi untuk diekspor.', 'warning');
      return;
    }

    // Header CSV
    const headers = ['ID', 'Tanggal', 'Keterangan', 'Tipe', 'Kategori', 'Jumlah (Rp)', 'Jumlah Satuan', 'Metode Pembayaran'];
    
    // Baris CSV
    const rows = $transactions.map(tx => [
      tx.id,
      tx.date,
      `"${tx.description.replace(/"/g, '""')}"`, // Escape double-quotes
      tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      `"${(tx.category || '').replace(/"/g, '""')}"`,
      tx.amount,
      tx.quantity || 1,
      tx.payment_method || 'Tunai'
    ]);

    // Gabungkan
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    // Download trigger
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", url);
    downloadAnchor.setAttribute("download", `selerasi_laporan_transaksi_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    URL.revokeObjectURL(url);

    addNotification('Laporan transaksi CSV berhasil diekspor!', 'success');
  }

  function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function(evt) {
      try {
        const data = JSON.parse(evt.target.result);
        if (data && Array.isArray(data.categories) && Array.isArray(data.transactions)) {
          const ok = await importDataApi(data);
          if (ok) {
            addNotification('Cadangan data berhasil dipulihkan!', 'success');
            await fetchStats();
          } else {
            addNotification('Gagal memulihkan cadangan data ke server.', 'error');
          }
        } else {
          addNotification('Format file cadangan tidak valid.', 'error');
        }
      } catch (err) {
        addNotification('Gagal membaca file cadangan.', 'error');
      }
      if (fileInput) fileInput.value = '';
    };
    reader.readAsText(file);
  }

  async function handleResetDemo() {
    askConfirmation({
      title: 'Reset ke Data Demo',
      message: 'Apakah Anda yakin ingin mengatur ulang ke Data Simulasi Demo? Semua transaksi dan kategori Anda saat ini akan ditimpa.',
      confirmText: 'Ya, Reset',
      type: 'warning',
      onConfirm: async () => {
        const ok = await resetDemoApi();
        if (ok) {
          addNotification('Berhasil mengatur ulang aplikasi ke data demo!', 'success');
          await fetchStats();
        } else {
          addNotification('Gagal mengatur ulang data demo.', 'error');
        }
      }
    });
  }

  async function handleClearAll() {
    askConfirmation({
      title: 'Hapus Semua Data',
      message: 'PERINGATAN: Apakah Anda yakin ingin menghapus SELURUH data keuangan? Tindakan ini akan mengosongkan seluruh kategori dan transaksi Anda secara permanen.',
      confirmText: 'Hapus Permanen',
      type: 'danger',
      onConfirm: async () => {
        const ok = await clearAllApi();
        if (ok) {
          addNotification('Semua data berhasil dibersihkan!', 'success');
          await fetchStats();
        } else {
          addNotification('Gagal membersihkan data keuangan.', 'error');
        }
      }
    });
  }
</script>

<div class="space-y-6 animate-fade-in">
  <!-- Section: Statistik Sistem -->
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
    <!-- Card 1: Users -->
    <div class="bg-white/70 backdrop-blur-sm border border-brand-300/60 rounded-2xl p-5 shadow-sm flex items-center gap-4">
      <div class="p-3 bg-purple-50 border border-purple-200 text-purple-700 rounded-xl">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      </div>
      <div>
        <p class="text-[10px] font-bold text-warm-400 uppercase tracking-wider">Total Pengguna</p>
        <h4 class="text-xl font-extrabold text-warm-900 mt-0.5">{loadingStats ? '...' : stats.usersCount}</h4>
        <p class="text-[10px] text-warm-500">Superadmin & Owner</p>
      </div>
    </div>

    <!-- Card 2: Transactions -->
    <div class="bg-white/70 backdrop-blur-sm border border-brand-300/60 rounded-2xl p-5 shadow-sm flex items-center gap-4">
      <div class="p-3 bg-brand-50 border border-brand-200 text-brand-700 rounded-xl">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      </div>
      <div>
        <p class="text-[10px] font-bold text-warm-400 uppercase tracking-wider">Total Transaksi</p>
        <h4 class="text-xl font-extrabold text-warm-900 mt-0.5">{loadingStats ? '...' : stats.transactionsCount}</h4>
        <p class="text-[10px] text-warm-500">Catatan Keuangan</p>
      </div>
    </div>

    <!-- Card 3: Products -->
    <div class="bg-white/70 backdrop-blur-sm border border-brand-300/60 rounded-2xl p-5 shadow-sm flex items-center gap-4">
      <div class="p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.5 8.25l-7.5 7.5-7.5-7.5m15 5.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </div>
      <div>
        <p class="text-[10px] font-bold text-warm-400 uppercase tracking-wider">Total Menu Produk</p>
        <h4 class="text-xl font-extrabold text-warm-900 mt-0.5">{loadingStats ? '...' : stats.productsCount}</h4>
        <p class="text-[10px] text-warm-500">Varian Menu POS</p>
      </div>
    </div>

    <!-- Card 4: Categories -->
    <div class="bg-white/70 backdrop-blur-sm border border-brand-300/60 rounded-2xl p-5 shadow-sm flex items-center gap-4">
      <div class="p-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <div>
        <p class="text-[10px] font-bold text-warm-400 uppercase tracking-wider">Total Kategori</p>
        <h4 class="text-xl font-extrabold text-warm-900 mt-0.5">{loadingStats ? '...' : stats.categoriesCount}</h4>
        <p class="text-[10px] text-warm-500">Kategori Keuangan</p>
      </div>
    </div>
  </div>

  <!-- Section 1: User Management -->
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
    
    <!-- Left Column: Add User Form -->
    <div class="bg-white/70 backdrop-blur-sm border border-brand-300/60 rounded-2xl p-6 shadow-sm lg:col-span-1">
      <h3 class="text-sm font-semibold text-warm-900 pb-3 border-b border-brand-200/60 mb-5">
        Tambah Pengguna Baru
      </h3>
      
      <form on:submit={handleCreateUser} class="space-y-4">
        <!-- Email Input -->
        <div class="space-y-1.5">
          <label for="new-email" class="text-xs font-medium text-warm-600">Email Pengguna</label>
          <input
            id="new-email"
            type="email"
            placeholder="nama@selerasi.com"
            bind:value={email}
            required
            class="w-full px-3 py-2 bg-brand-50 border border-brand-300/60 text-warm-900 placeholder-warm-300 focus:border-brand-700 focus:ring-1 focus:ring-brand-600/30 focus:outline-none transition-colors rounded-xl text-sm"
          />
        </div>

        <!-- Password Input -->
        <div class="space-y-1.5">
          <label for="new-password" class="text-xs font-medium text-warm-600">Password</label>
          <input
            id="new-password"
            type="password"
            placeholder="Minimal 6 karakter"
            bind:value={password}
            required
            minlength="6"
            class="w-full px-3 py-2 bg-brand-50 border border-brand-300/60 text-warm-900 placeholder-warm-300 focus:border-brand-700 focus:ring-1 focus:ring-brand-600/30 focus:outline-none transition-colors rounded-xl text-sm"
          />
        </div>

        <!-- Role Select -->
        <div class="space-y-1.5">
          <label for="new-role" class="text-xs font-medium text-warm-600">Peran Akses (Role)</label>
          <select
            id="new-role"
            bind:value={role}
            class="w-full px-3 py-2 bg-brand-50 border border-brand-300/60 text-warm-900 focus:border-brand-700 focus:outline-none transition-colors rounded-xl text-sm"
          >
            <option value="owner">Owner (Akses POS & Laporan)</option>
            <option value="superadmin">Superadmin (Akses Penuh & Manajemen Data)</option>
          </select>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          disabled={submittingUser}
          class="w-full mt-2 py-2.5 bg-brand-700 hover:bg-brand-800 disabled:bg-brand-400 active:scale-[0.99] text-brand-50 text-xs font-bold rounded-xl transition-all duration-150 cursor-pointer shadow-md flex items-center justify-center gap-2"
        >
          {#if submittingUser}
            <svg class="animate-spin h-4 w-4 text-brand-50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Membuat Akun...
          {:else}
            Buat Akun
          {/if}
        </button>
      </form>
    </div>

    <!-- Right Column: Users List -->
    <div class="bg-white/70 backdrop-blur-sm border border-brand-300/60 rounded-2xl p-6 shadow-sm lg:col-span-2">
      <h3 class="text-sm font-semibold text-warm-900 pb-3 border-b border-brand-200/60 mb-5">
        Daftar Pengguna Terdaftar ({users.length})
      </h3>

      {#if loadingUsers}
        <div class="py-10 flex flex-col items-center justify-center text-warm-400 gap-2">
          <svg class="animate-spin h-6 w-6 text-brand-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="text-xs">Memuat data user...</span>
        </div>
      {:else if userError}
        <div class="py-10 text-center text-rose-500 text-xs">
          <p>{userError}</p>
          <p class="text-[10px] text-warm-400 mt-2">Pastikan SUPABASE_SERVICE_ROLE_KEY Anda sudah terkonfigurasi dengan benar di file .env</p>
        </div>
      {:else}
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm text-warm-700">
            <thead>
              <tr class="border-b border-brand-200/60 text-[10px] font-bold tracking-wider text-warm-400 uppercase">
                <th class="py-2.5">Email</th>
                <th class="py-2.5">Peran</th>
                <th class="py-2.5">Dibuat Pada</th>
                <th class="py-2.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-brand-200/60">
              {#each users as user (user.id)}
                <tr class="group hover:bg-brand-100/50 transition-colors">
                  <td class="py-3 font-medium text-warm-900">{user.email}</td>
                  <td class="py-3">
                    <span class="inline-block px-2 py-0.5 rounded text-[10px] font-bold border 
                      {user.role === 'superadmin' 
                        ? 'bg-purple-50 text-purple-700 border-purple-200' 
                        : 'bg-brand-50 text-brand-700 border-brand-200'}"
                    >
                      {user.role === 'superadmin' ? 'SUPERADMIN' : 'OWNER'}
                    </span>
                  </td>
                  <td class="py-3 text-xs text-warm-400">{new Date(user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td class="py-3 text-right">
                    <div class="flex items-center justify-end space-x-2">
                      <button
                        on:click={() => openEditModal(user)}
                        title="Edit Pengguna"
                        class="text-warm-500 hover:text-brand-900 text-xs font-semibold py-1 px-2.5 border border-brand-300 rounded-lg hover:bg-brand-100 transition-all cursor-pointer active:scale-95"
                      >
                        Edit
                      </button>
                      <button
                        on:click={() => handleDeleteUser(user)}
                        title="Hapus Pengguna"
                        class="text-warm-400 hover:text-rose-500 text-xs font-semibold py-1 px-2.5 border border-brand-300 rounded-lg hover:bg-rose-50 transition-all cursor-pointer active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
          {#if users.length === 0}
            <div class="py-10 text-center text-warm-400 text-xs">Belum ada user terdaftar.</div>
          {/if}
        </div>
      {/if}
    </div>
  </div>

  <!-- Section 2: Utilities & Backup (Dipindahkan dari SettingsView) -->
  <div class="bg-white/70 backdrop-blur-sm border border-brand-300/60 rounded-2xl p-6 shadow-sm">
    <h3 class="text-sm font-semibold text-warm-900 pb-3 border-b border-brand-200/60 mb-5 flex items-center justify-between">
      <span>Utilitas &amp; Cadangan Data</span>
      <span class="text-[10px] bg-brand-200/70 text-warm-700 border border-brand-300 font-bold px-2 py-0.5 rounded tracking-wide uppercase">Cadangan &amp; Pemulihan</span>
    </h3>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      <!-- Export Card -->
      <div class="border border-brand-300/60 rounded-xl p-4 flex flex-col justify-between hover:border-brand-500 hover:shadow-sm transition-colors bg-brand-50/60">
        <div>
          <h4 class="text-xs font-bold text-warm-800 uppercase tracking-wide">Ekspor Data</h4>
          <p class="text-[11px] text-warm-500 mt-1">Unduh seluruh catatan transaksi dan kategori Anda sebagai file JSON cadangan.</p>
        </div>
        <button
          type="button"
          on:click={handleExport}
          class="w-full mt-4 py-2 bg-brand-200 hover:bg-brand-300 border border-brand-400/50 text-warm-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer active:scale-95 text-center"
        >
          Ekspor Cadangan
        </button>
      </div>

      <!-- Export CSV Card -->
      <div class="border border-brand-300/60 rounded-xl p-4 flex flex-col justify-between hover:border-brand-500 hover:shadow-sm transition-colors bg-brand-50/60">
        <div>
          <h4 class="text-xs font-bold text-warm-800 uppercase tracking-wide">Laporan CSV (Excel)</h4>
          <p class="text-[11px] text-warm-500 mt-1">Ekspor riwayat transaksi Anda ke format CSV agar mudah dianalisis di Excel atau Google Sheets.</p>
        </div>
        <button
          type="button"
          on:click={handleExportCSV}
          class="w-full mt-4 py-2 bg-brand-200 hover:bg-brand-300 border border-brand-400/50 text-warm-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer active:scale-95 text-center"
        >
          Ekspor ke CSV
        </button>
      </div>

      <!-- Import Card -->
      {#if userRole === 'superadmin'}
        <div class="border border-brand-300/60 rounded-xl p-4 flex flex-col justify-between hover:border-brand-500 hover:shadow-sm transition-colors bg-brand-50/60">
          <div>
            <h4 class="text-xs font-bold text-warm-800 uppercase tracking-wide">Impor Data</h4>
            <p class="text-[11px] text-warm-500 mt-1">Unggah file JSON cadangan Selerasi untuk memulihkan seluruh riwayat keuangan Anda.</p>
          </div>
          <div class="mt-4">
            <input
              type="file"
              accept=".json"
              on:change={handleImport}
              bind:this={fileInput}
              class="hidden"
              id="file-import-input"
            />
            <label
              for="file-import-input"
              class="block w-full py-2 bg-brand-200 hover:bg-brand-300 border border-brand-400/50 text-warm-800 text-xs font-semibold rounded-lg text-center cursor-pointer active:scale-95 transition-all"
            >
              Pilih &amp; Impor File
            </label>
          </div>
        </div>
      {:else}
        <div class="border border-warm-200 rounded-xl p-4 flex flex-col justify-between bg-warm-50/40 opacity-70">
          <div>
            <div class="flex items-center justify-between">
              <h4 class="text-xs font-bold text-warm-400 uppercase tracking-wide">Impor Data</h4>
              <span class="text-[9px] bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.5 rounded font-bold">IT</span>
            </div>
            <p class="text-[11px] text-warm-400 mt-1">Unggah file JSON cadangan Selerasi untuk memulihkan seluruh riwayat keuangan Anda.</p>
          </div>
          <button
            disabled
            class="w-full mt-4 py-2 bg-warm-100 border border-warm-200 text-warm-400 text-xs font-semibold rounded-lg cursor-not-allowed text-center flex items-center justify-center gap-1.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0V10.5m-2.25 0h13.5m-13.5 0a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25h13.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25M6.75 22.5h10.5" /></svg>
            Butuh Superadmin
          </button>
        </div>
      {/if}

      <!-- Reset Demo Card -->
      {#if userRole === 'superadmin'}
        <div class="border border-brand-300/60 rounded-xl p-4 flex flex-col justify-between hover:border-brand-500 hover:shadow-sm transition-colors bg-brand-50/60">
          <div>
            <h4 class="text-xs font-bold text-warm-800 uppercase tracking-wide">Data Demo</h4>
            <p class="text-[11px] text-warm-500 mt-1">Kembalikan aplikasi ke konfigurasi simulasi awal dengan data contoh transaksi bawaan.</p>
          </div>
          <button
            type="button"
            on:click={handleResetDemo}
            class="w-full mt-4 py-2 bg-brand-200 hover:bg-brand-300 border border-brand-400/50 text-warm-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer active:scale-95 text-center"
          >
            Reset Data Demo
          </button>
        </div>
      {:else}
        <div class="border border-warm-200 rounded-xl p-4 flex flex-col justify-between bg-warm-50/40 opacity-70">
          <div>
            <div class="flex items-center justify-between">
              <h4 class="text-xs font-bold text-warm-400 uppercase tracking-wide">Data Demo</h4>
              <span class="text-[9px] bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.5 rounded font-bold">IT</span>
            </div>
            <p class="text-[11px] text-warm-400 mt-1">Kembalikan aplikasi ke konfigurasi simulasi awal dengan data contoh transaksi bawaan.</p>
          </div>
          <button
            disabled
            class="w-full mt-4 py-2 bg-warm-100 border border-warm-200 text-warm-400 text-xs font-semibold rounded-lg cursor-not-allowed text-center flex items-center justify-center gap-1.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0V10.5m-2.25 0h13.5m-13.5 0a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25h13.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25M6.75 22.5h10.5" /></svg>
            Butuh Superadmin
          </button>
        </div>
      {/if}

      <!-- Clear Data Card -->
      {#if userRole === 'superadmin'}
        <div class="border border-rose-200 rounded-xl p-4 flex flex-col justify-between hover:border-rose-300 hover:bg-rose-50/50 transition-colors bg-rose-50/30">
          <div>
            <h4 class="text-xs font-bold text-rose-600 uppercase tracking-wide">Hapus Semua Data</h4>
            <p class="text-[11px] text-warm-500 mt-1">Kosongkan seluruh data transaksi dan kategori agar Anda bisa mulai mencatat dari awal.</p>
          </div>
          <button
            type="button"
            on:click={handleClearAll}
            class="w-full mt-4 py-2 bg-rose-100 hover:bg-rose-200 border border-rose-300 text-rose-600 text-xs font-bold rounded-lg transition-colors cursor-pointer active:scale-95 text-center"
          >
            Hapus Permanen
          </button>
        </div>
      {:else}
        <div class="border border-warm-200 rounded-xl p-4 flex flex-col justify-between bg-warm-50/40 opacity-70">
          <div>
            <div class="flex items-center justify-between">
              <h4 class="text-xs font-bold text-warm-400 uppercase tracking-wide">Hapus Semua Data</h4>
              <span class="text-[9px] bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.5 rounded font-bold">IT</span>
            </div>
            <p class="text-[11px] text-warm-400 mt-1">Kosongkan seluruh data transaksi dan kategori agar Anda bisa mulai mencatat dari awal.</p>
          </div>
          <button
            disabled
            class="w-full mt-4 py-2 bg-warm-100 border border-warm-200 text-warm-400 text-xs font-semibold rounded-lg cursor-not-allowed text-center flex items-center justify-center gap-1.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0V10.5m-2.25 0h13.5m-13.5 0a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25h13.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25M6.75 22.5h10.5" /></svg>
            Butuh Superadmin
          </button>
        </div>
      {/if}
    </div>
  </div>
</div>

<!-- Edit User Modal Dialog -->
{#if showEditModal}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
    <div class="bg-white rounded-2xl border border-brand-300/60 p-6 max-w-md w-full shadow-xl animate-fade-in space-y-4">
      <div class="flex items-center justify-between border-b border-brand-200/60 pb-3">
        <h3 class="text-sm font-bold text-warm-900">Edit Pengguna</h3>
        <button 
          on:click={() => showEditModal = false} 
          class="text-warm-400 hover:text-warm-700 cursor-pointer"
          title="Tutup"
          aria-label="Tutup"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form on:submit={handleEditUser} class="space-y-4">
        <div>
          <label for="edit-email" class="text-xs font-medium text-warm-500">Email</label>
          <input 
            id="edit-email"
            type="email" 
            value={editingUser.email} 
            disabled 
            class="w-full px-3 py-2 bg-brand-50 border border-brand-200 text-warm-500 rounded-xl text-sm cursor-not-allowed mt-1"
          />
        </div>

        <div>
          <label for="edit-role" class="text-xs font-medium text-warm-600">Peran Akses (Role)</label>
          <select
            id="edit-role"
            bind:value={editRole}
            class="w-full px-3 py-2 bg-brand-50 border border-brand-300/60 text-warm-900 focus:border-brand-700 focus:outline-none transition-colors rounded-xl text-sm mt-1"
          >
            <option value="owner">Owner (Akses POS & Laporan)</option>
            <option value="superadmin">Superadmin (Akses Penuh & Manajemen Data)</option>
          </select>
        </div>

        <div>
          <label for="edit-password" class="text-xs font-medium text-warm-600">Password Baru (Opsional)</label>
          <input
            id="edit-password"
            type="password"
            placeholder="Kosongkan jika tidak ingin diubah"
            bind:value={editPassword}
            minlength="6"
            class="w-full px-3 py-2 bg-brand-50 border border-brand-300/60 text-warm-900 placeholder-warm-300 focus:border-brand-700 focus:ring-1 focus:ring-brand-600/30 focus:outline-none transition-colors rounded-xl text-sm mt-1"
          />
        </div>

        <div class="flex gap-3 pt-2">
          <button
            type="button"
            on:click={() => showEditModal = false}
            class="flex-1 py-2 bg-warm-100 hover:bg-warm-200 border border-warm-300 text-warm-700 text-xs font-semibold rounded-xl cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={submittingEdit}
            class="flex-1 py-2 bg-brand-700 hover:bg-brand-800 disabled:bg-brand-400 text-brand-50 text-xs font-bold rounded-xl cursor-pointer shadow-md"
          >
            {#if submittingEdit}
              Menyimpan...
            {:else}
              Simpan Perubahan
            {/if}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

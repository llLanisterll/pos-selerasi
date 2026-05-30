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

  // State untuk User Management
  let users = [];
  let email = '';
  let password = '';
  let role = 'owner'; // Default role
  let loadingUsers = true;
  let submittingUser = false;
  let userError = '';

  // Backup & Reset file input
  let fileInput;

  onMount(async () => {
    await fetchUsers();
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
        await fetchUsers(); // Refresh list
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
            await fetchUsers();
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
        } else {
          addNotification('Gagal membersihkan data keuangan.', 'error');
        }
      }
    });
  }
</script>

<div class="space-y-8 animate-fade-in">
  <!-- View Header -->
  <div class="pb-6 border-b border-brand-300/60">
    <h1 class="text-2xl font-bold tracking-tight text-warm-900">Pengaturan User & Data</h1>
    <p class="text-sm text-warm-500 mt-1">Halaman khusus Superadmin untuk mengelola pengguna (Owner/Admin) dan mencadangkan database.</p>
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
                    <button
                      on:click={() => handleDeleteUser(user)}
                      title="Hapus Pengguna"
                      class="text-warm-400 hover:text-rose-500 text-xs font-semibold py-1 px-2.5 border border-brand-300 rounded-lg hover:bg-rose-50 transition-all cursor-pointer active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Hapus
                    </button>
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

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

      <!-- Import Card -->
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

      <!-- Reset Demo Card -->
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

      <!-- Clear Data Card -->
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
    </div>
  </div>
</div>

<script>
  import { onMount } from 'svelte';
  import { addNotification } from '../stores/notificationStore';

  let isMaintenance = false;
  let loadingToggle = false;
  let loadingStatus = true;

  // Mock server info
  let serverStats = {
    database: 'Online',
    ocrEngine: 'Ready',
    supabaseUrl: 'Loaded',
    supabaseKey: 'Loaded',
    serviceRoleKey: 'Loaded'
  };

  onMount(async () => {
    await fetchMaintenanceStatus();
  });

  async function fetchMaintenanceStatus() {
    loadingStatus = true;
    try {
      const res = await fetch('/api/admin/maintenance');
      if (res.ok) {
        const data = await res.json();
        isMaintenance = data.active;
      }
    } catch (err) {
      console.error('Error fetching maintenance status:', err);
    } finally {
      loadingStatus = false;
    }
  }

  async function toggleMaintenance() {
    if (loadingToggle) return;
    loadingToggle = true;

    const nextState = !isMaintenance;
    try {
      const res = await fetch('/api/admin/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: nextState })
      });

      const data = await res.json();
      if (res.ok) {
        isMaintenance = data.active;
        addNotification(
          `Mode pemeliharaan berhasil ${isMaintenance ? 'DIHUBUNGKAN (AKTIF)' : 'DINOAKTIFKAN'}.`,
          isMaintenance ? 'warning' : 'success'
        );
      } else {
        addNotification(data.message || 'Gagal mengubah status pemeliharaan.', 'error');
      }
    } catch (err) {
      console.error('Error toggling maintenance:', err);
      addNotification('Gagal terhubung ke server.', 'error');
    } finally {
      loadingToggle = false;
    }
  }
</script>

<div class="space-y-8 animate-fade-in">
  <!-- Header -->
  <div class="pb-6 border-b border-brand-300/60">
    <h1 class="text-2xl font-bold tracking-tight text-warm-900">Kesehatan Sistem & IT</h1>
    <p class="text-sm text-warm-500 mt-1">
      Halaman kontrol Developer/Superadmin untuk memantau status server, library, dan mengunci akses sistem.
    </p>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
    <!-- Left: Maintenance Toggle Card -->
    <div class="bg-white/70 backdrop-blur-sm border border-brand-300/60 rounded-2xl p-6 shadow-sm lg:col-span-1 space-y-6">
      <h3 class="text-sm font-semibold text-warm-900 pb-3 border-b border-brand-200/60 flex items-center justify-between">
        <span>Mode Pemeliharaan</span>
        <span class="relative flex h-2.5 w-2.5">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 {isMaintenance ? 'bg-amber-400' : 'bg-emerald-400'}"></span>
          <span class="relative inline-flex rounded-full h-2.5 w-2.5 {isMaintenance ? 'bg-amber-500' : 'bg-emerald-500'}"></span>
        </span>
      </h3>

      <div class="p-4 bg-brand-50/60 border border-brand-300/50 rounded-xl space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-warm-700">Status Saat Ini</span>
          <span class="text-xs font-extrabold uppercase tracking-wider {isMaintenance ? 'text-amber-600' : 'text-emerald-600'}">
            {isMaintenance ? 'Aktif (Aplikasi Terkunci)' : 'Normal (Aplikasi Terbuka)'}
          </span>
        </div>
        <p class="text-[11px] text-warm-500 leading-relaxed">
          Saat diaktifkan, seluruh akun <strong>Owner</strong> dan <strong>Kasir</strong> akan diblokir dari login dan pengisian data. Hanya akun <strong>Superadmin</strong> yang dapat mengakses sistem untuk melakukan pemeliharaan.
        </p>
      </div>

      <!-- Toggle Button Switch -->
      <div class="pt-4 flex flex-col items-center justify-center">
        <button
          on:click={toggleMaintenance}
          disabled={loadingToggle || loadingStatus}
          class="w-full py-3 px-4 rounded-xl font-bold text-xs border transition-all duration-200 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 shadow-sm
            {isMaintenance 
              ? 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100/70' 
              : 'bg-brand-700 text-brand-50 border-brand-800 hover:bg-brand-800 hover:shadow'}"
        >
          {#if loadingToggle || loadingStatus}
            <svg class="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Menyimpan Status...
          {:else if isMaintenance}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 1 0-9 0V10.5m-2.25 0h13.5m-13.5 0a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25h13.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25M6.75 22.5h10.5" /></svg>
            Nonaktifkan Pemeliharaan
          {:else}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0V10.5m-2.25 0h13.5m-13.5 0a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25h13.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25M6.75 22.5h10.5" /></svg>
            Aktifkan Pemeliharaan
          {/if}
        </button>
      </div>
    </div>

    <!-- Right: Health Metrics -->
    <div class="bg-white/70 backdrop-blur-sm border border-brand-300/60 rounded-2xl p-6 shadow-sm lg:col-span-2 space-y-6">
      <h3 class="text-sm font-semibold text-warm-900 pb-3 border-b border-brand-200/60">
        Status Infrastruktur
      </h3>

      <div class="space-y-4">
        <!-- DB Row -->
        <div class="flex items-center justify-between p-3 border border-brand-200 rounded-xl bg-brand-50/20">
          <div class="flex items-center gap-3">
            <span class="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
            </span>
            <div>
              <p class="text-xs font-bold text-warm-800">Database Supabase Cloud</p>
              <p class="text-[10px] text-warm-400">PostgreSQL (Host Project)</p>
            </div>
          </div>
          <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            {serverStats.database}
          </span>
        </div>

        <!-- OCR Engine Row -->
        <div class="flex items-center justify-between p-3 border border-brand-200 rounded-xl bg-brand-50/20">
          <div class="flex items-center gap-3">
            <span class="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" />
              </svg>
            </span>
            <div>
              <p class="text-xs font-bold text-warm-800">Tesseract OCR Engine</p>
              <p class="text-[10px] text-warm-400">Analisis Struk Dinamis (CDN Client-Side)</p>
            </div>
          </div>
          <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            {serverStats.ocrEngine}
          </span>
        </div>

        <!-- Loaded Environment Variables -->
        <div class="p-4 border border-brand-200 rounded-xl space-y-3">
          <h4 class="text-xs font-bold text-warm-800 uppercase tracking-wide">Variabel Lingkungan (.env)</h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <!-- SUPABASE_URL -->
            <div class="flex items-center justify-between px-3 py-2 bg-brand-50/50 rounded-lg border border-brand-200/50">
              <span class="text-[11px] font-mono text-warm-600">SUPABASE_URL</span>
              <span class="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                Loaded
              </span>
            </div>
            <!-- SUPABASE_ANON_KEY -->
            <div class="flex items-center justify-between px-3 py-2 bg-brand-50/50 rounded-lg border border-brand-200/50">
              <span class="text-[11px] font-mono text-warm-600">SUPABASE_ANON_KEY</span>
              <span class="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                Loaded
              </span>
            </div>
            <!-- SUPABASE_SERVICE_ROLE_KEY -->
            <div class="flex items-center justify-between px-3 py-2 bg-brand-50/50 rounded-lg border border-brand-200/50 sm:col-span-2">
              <span class="text-[11px] font-mono text-warm-600">SUPABASE_SERVICE_ROLE_KEY</span>
              <span class="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                Loaded (Manajemen User Aktif)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

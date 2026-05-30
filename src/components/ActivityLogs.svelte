<script>
  import { onMount } from 'svelte';
  import { addNotification } from '../stores/notificationStore';

  let logs = [];
  let loading = true;

  onMount(async () => {
    await fetchLogs();
  });

  async function fetchLogs() {
    loading = true;
    try {
      const res = await fetch('/api/admin/logs');
      if (res.ok) {
        logs = await res.json();
      } else {
        addNotification('Gagal memuat log aktivitas.', 'error');
      }
    } catch (err) {
      console.error('Error fetching logs:', err);
      addNotification('Gagal terhubung ke server.', 'error');
    } finally {
      loading = false;
    }
  }

  function getActionBadgeStyle(action) {
    if (action.includes('Hapus') || action.includes('Clear')) {
      return 'bg-rose-50 text-rose-700 border-rose-200';
    }
    if (action.includes('Membuat') || action.includes('Tambah')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (action.includes('Reset') || action.includes('Pulihkan') || action.includes('Impor')) {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }
    return 'bg-brand-50 text-brand-700 border-brand-200';
  }
</script>

<div class="space-y-8 animate-fade-in">
  <!-- View Header -->
  <div class="pb-6 border-b border-brand-300/60 flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold tracking-tight text-warm-900">Log Aktivitas Sistem</h1>
      <p class="text-sm text-warm-500 mt-1">Audit trail lengkap tindakan administratif dan operasional krusial yang dilakukan oleh pengguna.</p>
    </div>
    
    <button
      on:click={fetchLogs}
      disabled={loading}
      class="px-4 py-2 bg-brand-100 hover:bg-brand-200 border border-brand-300/60 text-warm-850 hover:text-warm-950 text-xs font-bold rounded-xl transition duration-150 cursor-pointer active:scale-95 flex items-center gap-1.5 shadow-2xs"
    >
      <svg class="w-3.5 h-3.5 {loading ? 'animate-spin' : ''}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.27 15" />
      </svg>
      Refresh Log
    </button>
  </div>

  <div class="bg-white/70 backdrop-blur-sm border border-brand-300/60 rounded-2xl p-6 shadow-sm">
    {#if loading}
      <div class="py-20 flex flex-col items-center justify-center text-warm-400 gap-2">
        <svg class="animate-spin h-6 w-6 text-brand-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span class="text-xs">Memuat riwayat log...</span>
      </div>
    {:else}
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-warm-700">
          <thead>
            <tr class="border-b border-brand-200/60 text-[10px] font-bold tracking-wider text-warm-400 uppercase">
              <th class="py-2.5">Waktu</th>
              <th class="py-2.5">Pengguna</th>
              <th class="py-2.5">Tindakan</th>
              <th class="py-2.5">Detail Catatan</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-brand-200/60">
            {#each logs as log (log.id)}
              <tr class="hover:bg-brand-100/40 transition-colors">
                <td class="py-3.5 text-xs text-warm-500 whitespace-nowrap">
                  {new Date(log.created_at).toLocaleString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </td>
                <td class="py-3.5 font-semibold text-warm-850 whitespace-nowrap">
                  {log.user_email}
                </td>
                <td class="py-3.5 whitespace-nowrap">
                  <span class="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold border {getActionBadgeStyle(log.action)}">
                    {log.action}
                  </span>
                </td>
                <td class="py-3.5 text-xs text-warm-600 max-w-xs md:max-w-md truncate" title={log.details}>
                  {log.details || '-'}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
        
        {#if logs.length === 0}
          <div class="py-20 text-center text-warm-400 text-xs flex flex-col items-center gap-2">
            <svg class="w-8 h-8 text-warm-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Belum ada riwayat aktivitas sistem tercatat.</span>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>

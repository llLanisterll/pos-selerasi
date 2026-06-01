<script>
  import { onMount } from 'svelte';
  import { fetchCategories, fetchTransactions } from '../stores/expenseStore.js';
  import { fetchProducts } from '../stores/productStore.js';
  
  import Sidebar from '../components/Sidebar.svelte';
  import Login from '../components/Login.svelte';
  import Dashboard from '../components/Dashboard.svelte';
  import FinancialReport from '../components/FinancialReport.svelte';
  import ExpenseEntry from '../components/ExpenseEntry.svelte';
  import ProductManagement from '../components/ProductManagement.svelte';
  import HistoryView from '../components/HistoryView.svelte';
  import SettingsView from '../components/SettingsView.svelte';
  import POSView from '../components/POSView.svelte';
  import ActivityLogs from '../components/ActivityLogs.svelte';
  import SystemHealth from '../components/SystemHealth.svelte';

  let activeTab = 'Dashboard';
  let isAuthenticated = false;
  let checkingSession = true;
  let userRole = 'owner';
  let userEmail = '';
  let isSystemMaintenance = false;

  onMount(async () => {
    // Intercept global fetch to detect maintenance mode errors
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      if (!response.ok) {
        try {
          const clone = response.clone();
          const data = await clone.json();
          if (data.message && data.message.includes('MAINTENANCE_MODE')) {
            isSystemMaintenance = true;
          }
        } catch (e) {
          // Ignore non-json responses
        }
      }
      return response;
    };

    await checkSession();
  });

  async function checkSession() {
    try {
      const res = await fetch('/api/auth/session');
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          isAuthenticated = true;
          userRole = data.user.user_metadata?.role || 'owner';
          userEmail = data.user.email || '';

          // Fetch data setelah berhasil autentikasi
          await Promise.all([
            fetchCategories(),
            fetchTransactions(),
            fetchProducts()
          ]);
        } else {
          isAuthenticated = false;
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        if (errData.message && errData.message.includes('MAINTENANCE_MODE')) {
          isSystemMaintenance = true;
        } else {
          isAuthenticated = false;
        }
      }
    } catch (err) {
      console.error('Error checking session:', err);
      isAuthenticated = false;
    } finally {
      checkingSession = false;
    }
  }

  function handleLoginSuccess() {
    isAuthenticated = true;
    checkingSession = true;
    checkSession();
  }

  function handleLogout() {
    isAuthenticated = false;
    userRole = 'owner';
    userEmail = '';
  }
</script>

{#if isSystemMaintenance}
  <!-- Render Maintenance Screen -->
  <div class="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-tr from-amber-50 via-warm-50 to-orange-50/50 font-sans p-6 text-center">
    <div class="max-w-md w-full bg-white/80 backdrop-blur-md border border-amber-200 p-8 rounded-3xl shadow-xl space-y-6">
      <div class="relative flex items-center justify-center">
        <!-- Pulsing Orange Glow Ring -->
        <div class="absolute w-20 h-20 rounded-full bg-amber-500/10 animate-ping"></div>
        <div class="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8"><path stroke-linecap="round" stroke-linejoin="round" d="M11.42 15.17 17.25 21A2.67 2.67 0 1 1 13.5 22.5l-5.83-5.83M11.42 15.17 6.25 10A2.67 2.67 0 1 1 10 6.25l5.17 5.17m-3.75 3.75 3.75-3.75M21 21a2.67 2.67 0 0 0-3.75-3.75M3 3a2.67 2.67 0 0 0 3.75 3.75" /></svg>
        </div>
      </div>
      <div class="space-y-2">
        <h2 class="text-xl font-bold text-warm-900">Sistem Dalam Pemeliharaan</h2>
        <p class="text-xs text-warm-500 leading-relaxed font-medium">
          Aplikasi Selerasi sedang dinonaktifkan sementara oleh Superadmin untuk pemeliharaan rutin database dan optimalisasi sistem.
        </p>
      </div>
      <div class="p-3 bg-amber-50/50 border border-amber-200/50 rounded-xl">
        <p class="text-[10px] font-bold text-amber-800 uppercase tracking-wide">Estimasi Selesai</p>
        <p class="text-xs text-amber-700 font-semibold mt-0.5">Segera Kembali (Kurang dari 30 menit)</p>
      </div>
      <div class="pt-4 border-t border-brand-200/60">
        <button
          on:click={() => { isSystemMaintenance = false; checkSession(); }}
          class="w-full py-2.5 bg-warm-900 hover:bg-black text-brand-50 text-xs font-bold rounded-xl transition duration-150 shadow cursor-pointer"
        >
          Muat Ulang Aplikasi
        </button>
      </div>
    </div>
  </div>

{:else if checkingSession}
  <!-- Loading Session Screen -->
  <div class="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-tr from-brand-100 via-warm-50 to-brand-50/50 font-sans">
    <div class="relative flex items-center justify-center">
      <!-- Pulsing Glow Ring -->
      <div class="absolute w-24 h-24 rounded-full bg-brand-700/10 animate-ping"></div>
      
      <!-- Inner Spin Ring -->
      <div class="w-16 h-16 rounded-full border-4 border-brand-200 border-t-brand-700 animate-spin"></div>
      
      <!-- Logo inside Spinner -->
      <div class="absolute w-8 h-8 text-brand-700 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full">
          <path d="M 85,25 C 75,18 55,18 42,24 C 26,30 22,48 29,62 C 34,71 44,79 47,82 C 51,86 33,88 32,82 C 31,76 43,76 49,83" />
        </svg>
      </div>
    </div>
    <p class="text-sm font-bold text-warm-700 mt-6 tracking-wide animate-pulse">Menghubungkan ke Selerasi Cloud...</p>
  </div>

{:else if !isAuthenticated}
  <!-- Render Login Form -->
  <Login on:loginSuccess={handleLoginSuccess} />

{:else}
  <!-- Render POS & Finance App (Authenticated) -->
  <div class="min-h-screen flex flex-col md:flex-row font-sans">
    <!-- Responsive Sidebar Nav -->
    <Sidebar bind:activeTab {userRole} {userEmail} on:logout={handleLogout} />

    <!-- Main Content View Pane -->
    <main class="flex-grow max-w-6xl w-full mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-10">
      {#if activeTab === 'Dashboard'}
        <Dashboard bind:activeTab />

      {:else if activeTab === 'POS'}
        <section class="animate-fade-in">
          <POSView />
        </section>

      {:else if activeTab === 'ExpenseEntry'}
        <section class="animate-fade-in">
          <ExpenseEntry />
        </section>

      {:else if activeTab === 'FinancialReport'}
        <section class="animate-fade-in">
          <FinancialReport />
        </section>

      {:else if activeTab === 'Products'}
        <section class="animate-fade-in">
          <ProductManagement />
        </section>

      {:else if activeTab === 'History'}
        <section class="animate-fade-in">
          <HistoryView />
        </section>

      {:else if activeTab === 'ActivityLogs'}
        <section class="animate-fade-in">
          {#if userRole === 'superadmin'}
            <ActivityLogs />
          {:else}
            <div class="bg-white/70 backdrop-blur-sm border border-brand-300/60 rounded-2xl p-8 text-center max-w-md mx-auto my-12 shadow-sm space-y-4">
              <div class="text-rose-500 font-bold text-lg">Akses Ditolak</div>
              <p class="text-xs text-warm-500 font-medium">Halaman Log Aktivitas Sistem hanya dapat diakses oleh peran Superadmin.</p>
            </div>
          {/if}
        </section>

      {:else if activeTab === 'SystemHealth'}
        <section class="animate-fade-in">
          <SystemHealth />
        </section>

      {:else if activeTab === 'Settings'}
        <section class="animate-fade-in">
          <SettingsView {userRole} />
        </section>
      {/if}
    </main>
  </div>
{/if}

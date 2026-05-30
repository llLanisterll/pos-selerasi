<script>
  import { onMount } from 'svelte';
  import { fetchCategories, fetchTransactions } from '../stores/expenseStore.js';
  import { fetchProducts } from '../stores/productStore.js';
  
  import Sidebar from '../components/Sidebar.svelte';
  import Login from '../components/Login.svelte';
  import Dashboard from '../components/Dashboard.svelte';
  import FinancialReport from '../components/FinancialReport.svelte';
  import ProductManagement from '../components/ProductManagement.svelte';
  import HistoryView from '../components/HistoryView.svelte';
  import SettingsView from '../components/SettingsView.svelte';
  import POSView from '../components/POSView.svelte';

  let activeTab = 'Dashboard';
  let isAuthenticated = false;
  let checkingSession = true;

  onMount(async () => {
    await checkSession();
  });

  async function checkSession() {
    try {
      const res = await fetch('/api/auth/session');
      if (res.ok) {
        isAuthenticated = true;
        
        // Fetch data setelah berhasil autentikasi
        await Promise.all([
          fetchCategories(),
          fetchTransactions(),
          fetchProducts()
        ]);
      } else {
        isAuthenticated = false;
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
  }
</script>

{#if checkingSession}
  <!-- Loading Session Screen -->
  <div class="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-tr from-brand-100 via-warm-50 to-brand-50/50 font-sans">
    <div class="relative flex items-center justify-center">
      <!-- Pulsing Glow Ring -->
      <div class="absolute w-24 h-24 rounded-full bg-brand-700/10 animate-ping"></div>
      
      <!-- Inner Spin Ring -->
      <div class="w-16 h-16 rounded-full border-4 border-brand-200 border-t-brand-700 animate-spin"></div>
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
    <Sidebar bind:activeTab on:logout={handleLogout} />

    <!-- Main Content View Pane -->
    <main class="flex-grow max-w-6xl w-full mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-10">
      {#if activeTab === 'Dashboard'}
        <Dashboard bind:activeTab />

      {:else if activeTab === 'POS'}
        <section class="animate-fade-in">
          <POSView />
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

      {:else if activeTab === 'Settings'}
        <section class="animate-fade-in">
          <SettingsView />
        </section>
      {/if}
    </main>
  </div>
{/if}

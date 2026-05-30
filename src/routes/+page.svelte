<script>
  import { onMount } from 'svelte';
  import { fetchCategories, fetchTransactions } from '../stores/expenseStore.js';
  import { fetchProducts } from '../stores/productStore.js';
  
  import Sidebar from '../components/Sidebar.svelte';
  import Dashboard from '../components/Dashboard.svelte';
  import FinancialReport from '../components/FinancialReport.svelte';
  import ProductManagement from '../components/ProductManagement.svelte';
  import HistoryView from '../components/HistoryView.svelte';
  import SettingsView from '../components/SettingsView.svelte';
  import POSView from '../components/POSView.svelte';

  let activeTab = 'Dashboard';

  onMount(() => {
    fetchCategories();
    fetchTransactions();
    fetchProducts();
  });
</script>

<div class="min-h-screen flex flex-col md:flex-row font-sans">
  <!-- Responsive Sidebar Nav -->
  <Sidebar bind:activeTab />

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

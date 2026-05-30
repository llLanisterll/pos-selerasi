<script>
  import SalesReport from './SalesReport.svelte';
  import ExpenseReport from './ExpenseReport.svelte';
  import { transactions } from '../stores/expenseStore';
  import { addNotification } from '../stores/notificationStore';

  let activeReport = 'sales'; // 'sales' | 'expense'

  function exportToCSV() {
    // Sort transactions chronologically (oldest first for running balance)
    const sortedData = [...$transactions].sort((a, b) => {
      const dateA = a.date || '';
      const dateB = b.date || '';
      if (dateA !== dateB) return dateA.localeCompare(dateB);
      // If dates same, use created_at or ID as secondary sort
      const timeA = a.created_at || '';
      const timeB = b.created_at || '';
      return timeA.localeCompare(timeB);
    });

    if (sortedData.length === 0) {
      addNotification('Tidak ada data untuk diexport', 'warning');
      return;
    }

    // Creating CSV content
    const headers = ['Tanggal', 'Deskripsi', 'Kategori', 'Metode', 'Pemasukan', 'Pengeluaran', 'Kas Terakhir'];
    
    let runningBalance = 0;
    let totalIncome = 0;
    let totalExpense = 0;

    const rows = sortedData.map(t => {
      const isIncome = t.type === 'income';
      const amount = Number(t.amount);
      
      if (isIncome) {
        runningBalance += amount;
        totalIncome += amount;
      } else {
        runningBalance -= amount;
        totalExpense += amount;
      }

      return [
        t.date,
        t.description.replace(/,/g, ' '), 
        isIncome ? 'Penjualan' : (t.category || 'Lainnya'),
        t.payment_method || '-',
        isIncome ? amount : 0,
        !isIncome ? amount : 0,
        runningBalance
      ];
    });

    // Add Total Row
    const totalRow = [
      'TOTAL',
      '-',
      '-',
      '-',
      totalIncome,
      totalExpense,
      runningBalance
    ];

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
      totalRow.map(cell => `"${cell}"`).join(',')
    ].join('\n');

    // Trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Laporan_Keuangan_Selerasi_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addNotification('Laporan Keuangan berhasil diekspor!', 'success');
  }

  function printReport() {
    window.print();
  }
</script>

<div class="space-y-6">
  <!-- View Header -->
  <div class="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-brand-300/60 gap-4 no-print">
    <div>
      <h1 class="text-2xl font-bold tracking-tight text-warm-900">Laporan Keuangan</h1>
      <p class="text-sm text-warm-500 mt-1">Kelola dan tinjau performa bisnis Selerasi dalam satu tempat.</p>
    </div>

    <div class="flex items-center space-x-3 self-end md:self-auto">
      <button
        on:click={exportToCSV}
        class="px-4 py-2 bg-white border border-brand-300 text-warm-700 text-xs font-bold rounded-xl hover:bg-brand-50 transition flex items-center gap-2 shadow-sm cursor-pointer active:scale-95"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
        Export CSV
      </button>
      <button
        on:click={printReport}
        class="px-4 py-2 bg-brand-700 text-brand-50 text-xs font-bold rounded-xl hover:bg-brand-800 transition flex items-center gap-2 shadow-sm cursor-pointer active:scale-95"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM9 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M18 12v5.25A2.25 2.25 0 0 1 15.75 19.5H8.25A2.25 2.25 0 0 1 6 17.25V12M16.5 9V5.25A2.25 2.25 0 0 0 14.25 3h-4.5A2.25 2.25 0 0 0 7.5 5.25V9m9 0H7.5m9 0v3.375c0 .621-.504 1.125-1.125 1.125h-6.75A1.125 1.125 0 0 1 7.5 12.375V9" />
        </svg>
        Cetak Laporan
      </button>
    </div>
  </div>

  <!-- Report Switcher Tabs -->
  <div class="flex border-b border-brand-200 gap-8 no-print">
    <button
      on:click={() => activeReport = 'sales'}
      class="pb-4 text-sm font-bold transition-all relative
        {activeReport === 'sales' ? 'text-brand-800' : 'text-warm-400 hover:text-warm-600 cursor-pointer'}"
    >
      Analisis Penjualan
      {#if activeReport === 'sales'}
        <div class="absolute bottom-0 left-0 right-0 h-1 bg-brand-700 rounded-t-full"></div>
      {/if}
    </button>
    <button
      on:click={() => activeReport = 'expense'}
      class="pb-4 text-sm font-bold transition-all relative
        {activeReport === 'expense' ? 'text-rose-600' : 'text-warm-400 hover:text-warm-600 cursor-pointer'}"
    >
      Analisis Pengeluaran
      {#if activeReport === 'expense'}
        <div class="absolute bottom-0 left-0 right-0 h-1 bg-rose-500 rounded-t-full"></div>
      {/if}
    </button>
  </div>

  <div class="pt-4">
    {#if activeReport === 'sales'}
      <SalesReport />
    {:else}
      <ExpenseReport />
    {/if}
  </div>
</div>

<style>
  @media print {
    :global(body) {
      background-color: white !important;
    }
    :global(main) {
      padding: 0 !important;
      max-width: none !important;
    }
    .no-print {
      display: none !important;
    }
  }
</style>

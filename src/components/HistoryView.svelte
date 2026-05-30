<script>
  import { transactions, categories, getCategoryStyle, deleteTransactionApi } from '../stores/expenseStore';
  import { addNotification } from '../stores/notificationStore';
  import { askConfirmation } from '../stores/confirmationStore';

  let filterMode = 'daily'; // 'daily' | 'weekly' | 'monthly' | 'yearly'
  let typeFilter = 'all'; // 'all' | 'income' | 'expense'

  // Formatting helpers
  function formatRupiah(value) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  }

  // Get ISO week number
  function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  }

  // Generate date labels based on filter mode
  function formatGroupLabel(dateStr, mode) {
    const date = new Date(dateStr);
    if (mode === 'daily') {
      return new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(date);
    } else if (mode === 'weekly') {
      const week = getWeekNumber(date);
      const year = date.getFullYear();
      return `Minggu ke-${week}, ${year}`;
    } else if (mode === 'monthly') {
      return new Intl.DateTimeFormat('id-ID', {
        month: 'long',
        year: 'numeric'
      }).format(date);
    } else if (mode === 'yearly') {
      return `Tahun ${date.getFullYear()}`;
    }
    return dateStr;
  }

  // Reactive grouping logic
  $: groupedTransactions = (() => {
    const groups = {};
    const filtered = typeFilter === 'all' 
      ? [...$transactions] 
      : $transactions.filter(t => t.type === typeFilter);

    const sorted = filtered.sort((a, b) => {
      const dateA = a.date || '';
      const dateB = b.date || '';
      if (dateA !== dateB) return dateB.localeCompare(dateA);
      const timeA = a.created_at || '';
      const timeB = b.created_at || '';
      if (timeA !== timeB) return timeB.localeCompare(timeA);
      return String(b.id).localeCompare(String(a.id));
    });

    sorted.forEach(tx => {
      const label = formatGroupLabel(tx.date, filterMode);
      if (!groups[label]) {
        groups[label] = {
          label,
          income: 0,
          expense: 0,
          transactions: []
        };
      }
      groups[label].transactions.push(tx);
      if (tx.type === 'income') {
        groups[label].income += tx.amount;
      } else {
        groups[label].expense += tx.amount;
      }
    });

    return Object.values(groups);
  })();

  // Filter totals
  $: totalFilteredIncome = groupedTransactions.reduce((sum, g) => sum + g.income, 0);
  $: totalFilteredExpense = groupedTransactions.reduce((sum, g) => sum + g.expense, 0);
  $: totalFilteredBalance = totalFilteredIncome - totalFilteredExpense;

  // Compute category breakdown specifically for expenses
  $: categoryBreakdown = (() => {
    const expenses = $transactions.filter(t => t.type === 'expense');
    const totalSum = expenses.reduce((sum, t) => sum + t.amount, 0);
    if (totalSum === 0) return [];
    const map = {};
    expenses.forEach(t => {
      const name = t.category || 'Lainnya';
      if (!map[name]) map[name] = { name, amount: 0, percentage: 0 };
      map[name].amount += t.amount;
    });
    return Object.values(map)
      .map(item => ({ ...item, percentage: (item.amount / totalSum) * 100 }))
      .sort((a, b) => b.amount - a.amount);
  })();

  // Delete transaction handler
  async function deleteTransaction(id) {
    askConfirmation({
      title: 'Hapus Transaksi',
      message: 'Apakah Anda yakin ingin menghapus transaksi ini?',
      confirmText: 'Hapus',
      type: 'danger',
      onConfirm: async () => {
        try {
          await deleteTransactionApi(id);
          addNotification('Transaksi berhasil dihapus!', 'success');
        } catch (err) {
          addNotification('Gagal menghapus transaksi: ' + err.message, 'error');
        }
      }
    });
  }
</script>

<div class="space-y-8 animate-fade-in">
  <!-- View Header -->
  <div class="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 pb-6 border-b border-brand-300/60">
    <div>
      <h1 class="text-2xl font-bold tracking-tight text-warm-900">Riwayat &amp; Laporan</h1>
      <p class="text-sm text-warm-500 mt-1">Kelompokkan dan tinjau performa kas Anda berdasarkan jangka waktu.</p>
    </div>

    <div class="flex flex-wrap gap-2">
      <div class="flex bg-brand-100 p-0.5 border border-brand-300/60 rounded-xl shadow-sm">
        <button on:click={() => typeFilter = 'all'} class="px-4 py-1.5 text-xs font-semibold rounded-lg transition-all {typeFilter === 'all' ? 'bg-white text-warm-900 shadow-sm border border-brand-300/60' : 'text-warm-500 hover:text-warm-900'}">Semua</button>
        <button on:click={() => typeFilter = 'income'} class="px-4 py-1.5 text-xs font-semibold rounded-lg transition-all {typeFilter === 'income' ? 'bg-brand-500 text-warm-900 shadow-sm border border-brand-600/30' : 'text-warm-500 hover:text-warm-900'}">Pemasukan</button>
        <button on:click={() => typeFilter = 'expense'} class="px-4 py-1.5 text-xs font-semibold rounded-lg transition-all {typeFilter === 'expense' ? 'bg-rose-500 text-white shadow-sm border border-rose-600/30' : 'text-warm-500 hover:text-warm-900'}">Pengeluaran</button>
      </div>

      <div class="flex bg-brand-100 p-0.5 border border-brand-300/60 rounded-xl shadow-sm">
        <button on:click={() => filterMode = 'daily'} class="px-4 py-1.5 text-xs font-semibold rounded-lg transition-all {filterMode === 'daily' ? 'bg-brand-500 text-warm-900 shadow-sm' : 'text-warm-500'}">Harian</button>
        <button on:click={() => filterMode = 'weekly'} class="px-4 py-1.5 text-xs font-semibold rounded-lg transition-all {filterMode === 'weekly' ? 'bg-brand-500 text-warm-900 shadow-sm' : 'text-warm-500'}">Mingguan</button>
        <button on:click={() => filterMode = 'monthly'} class="px-4 py-1.5 text-xs font-semibold rounded-lg transition-all {filterMode === 'monthly' ? 'bg-brand-500 text-warm-900 shadow-sm' : 'text-warm-500'}">Bulanan</button>
        <button on:click={() => filterMode = 'yearly'} class="px-4 py-1.5 text-xs font-semibold rounded-lg transition-all {filterMode === 'yearly' ? 'bg-brand-500 text-warm-900 shadow-sm' : 'text-warm-500'}">Tahunan</button>
      </div>
    </div>
  </div>

  <!-- Summary Stats -->
  <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-5 grid grid-cols-1 md:grid-cols-3 gap-4 border border-brand-300/60 shadow-sm">
    <div>
      <span class="text-[10px] uppercase font-bold tracking-wider text-warm-500">Arus Bersih</span>
      <h4 class="text-xl font-bold mt-1 text-warm-900">{formatRupiah(totalFilteredBalance)}</h4>
    </div>
    <div>
      <span class="text-[10px] uppercase font-bold tracking-wider text-brand-800">Total Pemasukan</span>
      <h4 class="text-xl font-bold mt-1 text-brand-800">{formatRupiah(totalFilteredIncome)}</h4>
    </div>
    <div>
      <span class="text-[10px] uppercase font-bold tracking-wider text-rose-500">Total Pengeluaran</span>
      <h4 class="text-xl font-bold mt-1 text-rose-500">{formatRupiah(totalFilteredExpense)}</h4>
    </div>
  </div>

  <!-- Category Breakdown (Expense only) -->
  {#if typeFilter !== 'income' && categoryBreakdown.length > 0}
    <div class="bg-white/70 backdrop-blur-sm border border-brand-300/60 rounded-2xl p-6 shadow-sm">
      <h3 class="text-sm font-semibold text-warm-900 pb-3 border-b border-brand-200/60 mb-5">Analisis Pengeluaran per Kategori</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
        {#each categoryBreakdown as cat}
          <div class="space-y-2">
            <div class="flex items-center justify-between text-xs font-semibold">
              <span class="px-2 py-0.5 border rounded text-[10px] tracking-wide uppercase {getCategoryStyle(cat.name, $categories)}">{cat.name}</span>
              <span class="text-warm-700">{formatRupiah(cat.amount)} ({cat.percentage.toFixed(1)}%)</span>
            </div>
            <div class="w-full h-1.5 bg-brand-100 rounded-full overflow-hidden border border-brand-200/50">
              <div class="h-full rounded-full bg-rose-500" style="width: {cat.percentage}%"></div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  {#if groupedTransactions.length === 0}
    <div class="bg-white/70 backdrop-blur-sm border border-brand-300/60 rounded-2xl py-20 text-center shadow-sm text-warm-400 text-sm">
      Tidak ada riwayat transaksi.
    </div>
  {:else}
    <div class="space-y-6">
      {#each groupedTransactions as group}
        <div class="bg-white/70 backdrop-blur-sm border border-brand-300/60 rounded-2xl overflow-hidden shadow-sm">
          <div class="bg-brand-100/80 border-b border-brand-200/60 px-6 py-4 flex justify-between items-center">
            <h3 class="text-sm font-bold text-warm-800">{group.label}</h3>
            <div class="flex items-center space-x-3 text-xs">
              {#if group.income > 0}<span class="font-medium text-brand-800">+{formatRupiah(group.income)}</span>{/if}
              {#if group.expense > 0}<span class="font-medium text-rose-500">-{formatRupiah(group.expense)}</span>{/if}
            </div>
          </div>

          <div class="divide-y divide-brand-200/60 px-6">
            {#each group.transactions as tx (tx.id)}
              <div class="py-3.5 flex items-center justify-between group">
                <div class="flex flex-col min-w-0 pr-4">
                  <span class="text-sm font-semibold text-warm-900 truncate">{tx.description}</span>
                  <div class="flex items-center gap-2.5 mt-1">
                    <span class="text-xs text-warm-400">{formatDate(tx.date)}</span>
                    {#if tx.type === 'expense'}
                      <span class="text-[9px] px-2 py-0.2 border rounded font-bold uppercase select-none {getCategoryStyle(tx.category, $categories)}">{tx.category || 'Lainnya'}</span>
                    {/if}
                    {#if tx.payment_method}
                      <span class="text-[9px] px-2 py-0.2 border border-brand-300/60 bg-brand-100/60 rounded font-bold uppercase text-warm-500">{tx.payment_method}</span>
                    {/if}
                  </div>
                </div>
                <div class="flex items-center space-x-3 text-right">
                  <span class="text-sm font-bold {tx.type === 'income' ? 'text-brand-800' : 'text-rose-500'}">
                    {tx.type === 'income' ? '+' : '-'} {formatRupiah(tx.amount)}
                  </span>
                  <button on:click={() => deleteTransaction(tx.id)} class="text-warm-400 hover:text-rose-500 p-1 rounded-md transition duration-150 cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.34 12.142m-10.11-12.14 1.1 11.24a2.25 2.25 0 0 0 2.23 2.19h8.56a2.25 2.25 0 0 0 2.23-2.19l1.1-11.24m-12 0h12m-9-3h9m-7.3-3.6H17c.445 0 .833.207 1.085.53l.9 1.25M6.285 5.25c.252-.323.64-.53 1.085-.53h8.56c.445 0 .833.207 1.085.53" /></svg>
                  </button>
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

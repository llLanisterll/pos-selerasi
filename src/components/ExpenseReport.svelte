<script>
  import { onMount } from 'svelte';
  import { transactions, categories, getCategoryStyle, getCategoryHex } from '../stores/expenseStore';

  // State fields for filtering
  let filterType = 'monthly'; // 'daily' | 'monthly'
  let selectedDate = '';
  let selectedMonth = '';

  // Initialize dates on mount
  onMount(() => {
    const today = new Date();
    selectedDate = today.toISOString().split('T')[0];
    selectedMonth = today.toISOString().slice(0, 7); // "YYYY-MM"
  });

  // Helper to format Rupiah
  function formatRupiah(value) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  // Short currency formatter for chart labels
  function formatRupiahShort(value) {
    if (value >= 1_000_000) {
      return `Rp ${(value / 1_000_000).toFixed(1).replace('.0', '')} Jt`;
    } else if (value >= 1_000) {
      return `Rp ${(value / 1_000).toFixed(0)} K`;
    }
    return `Rp ${value}`;
  }

  // Format date display
  function formatDate(dateStr) {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(date);
    } catch (e) {
      return dateStr;
    }
  }

  // Format month display
  function formatMonth(monthStr) {
    if (!monthStr) return '';
    try {
      const [year, month] = monthStr.split('-');
      const date = new Date(year, month - 1, 1);
      return new Intl.DateTimeFormat('id-ID', {
        month: 'long',
        year: 'numeric'
      }).format(date);
    } catch (e) {
      return monthStr;
    }
  }

  // Navigate date or month
  function navigateDate(days) {
    if (!selectedDate) return;
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    selectedDate = current.toISOString().split('T')[0];
  }

  function navigateMonth(months) {
    if (!selectedMonth) return;
    const [year, month] = selectedMonth.split('-').map(Number);
    const current = new Date(year, month - 1 + months, 1);
    selectedMonth = current.toISOString().slice(0, 7);
  }

  function setToday() {
    selectedDate = new Date().toISOString().split('T')[0];
  }

  function setThisMonth() {
    selectedMonth = new Date().toISOString().slice(0, 7);
  }

  // Filter expense transactions
  $: expenseTransactions = $transactions.filter(t => t.type === 'expense');

  // Filter transactions based on selected period
  $: filteredExpenseTransactions = expenseTransactions.filter(t => {
    if (filterType === 'daily') {
      return t.date === selectedDate;
    } else {
      return t.date && t.date.startsWith(selectedMonth);
    }
  });

  // 1. Total Expense
  $: totalExpenseValue = filteredExpenseTransactions.reduce((sum, t) => sum + Number(t.amount), 0);

  // 2. Count transactions
  $: transactionCount = filteredExpenseTransactions.length;

  // 3. Average per expense
  $: avgExpensePerTx = transactionCount > 0 ? (totalExpenseValue / transactionCount) : 0;

  // 4. Category Breakdown
  $: categoryBreakdown = (() => {
    const map = {};
    filteredExpenseTransactions.forEach(t => {
      const name = t.category || 'Lainnya';
      const rev = Number(t.amount);

      if (!map[name]) {
        map[name] = { name, amount: 0, count: 0 };
      }
      map[name].amount += rev;
      map[name].count += 1;
    });

    const list = Object.values(map);
    list.sort((a, b) => b.amount - a.amount);
    return list;
  })();

  // 5. Biggest Expenses
  $: topExpenses = [...filteredExpenseTransactions]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10);

  // Maximum amount in category breakdown for progress bar
  $: maxCategoryAmount = categoryBreakdown.length > 0 ? categoryBreakdown[0].amount : 1;

  // ─── Trend Chart Calculations ──────────────────────────────────────────
  
  // Operating hours slots for daily trend
  const operatingHours = [10, 12, 14, 16, 18, 20, 22];

  // Daily trend data (hourly)
  $: dailyTrendData = (() => {
    if (filterType !== 'daily' || !selectedDate) return [];
    
    const getTxHour = (tx) => {
      if (tx.created_at) {
        try {
          const dateObj = new Date(tx.created_at);
          if (!isNaN(dateObj.getTime())) {
            return dateObj.getHours();
          }
        } catch (e) {}
      }
      return 12; // fallback
    };

    const hourlyMap = {};
    operatingHours.forEach(h => {
      hourlyMap[h] = { amount: 0 };
    });

    filteredExpenseTransactions.forEach(tx => {
      const txHour = getTxHour(tx);
      let closestSlot = 10;
      let minDiff = Infinity;
      operatingHours.forEach(h => {
        const diff = Math.abs(txHour - h);
        if (diff < minDiff) {
          minDiff = diff;
          closestSlot = h;
        }
      });
      hourlyMap[closestSlot].amount += Number(tx.amount);
    });

    return operatingHours.map(h => ({
      label: `${String(h).padStart(2, '0')}:00`,
      amount: hourlyMap[h].amount
    }));
  })();

  // Monthly trend data (day-by-day)
  $: monthlyTrendData = (() => {
    if (filterType !== 'monthly' || !selectedMonth) return [];
    const [year, month] = selectedMonth.split('-').map(Number);
    const numDays = new Date(year, month, 0).getDate();
    
    const daysData = [];
    for (let d = 1; d <= numDays; d++) {
      const dayStr = `${year}-${String(month).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const dayTxs = expenseTransactions.filter(t => t.date === dayStr);
      daysData.push({
        label: `${d}`,
        amount: dayTxs.reduce((sum, t) => sum + Number(t.amount), 0)
      });
    }
    return daysData;
  })();

  // Common chart parameters
  $: activeTrendData = filterType === 'daily' ? dailyTrendData : monthlyTrendData;
  $: chartMax = Math.max(...activeTrendData.map(d => d.amount), 10000);

  // SVG Chart points
  $: chartPoints = activeTrendData.map((d, i) => {
    const x = 50 + i * (430 / (activeTrendData.length - 1 || 1));
    const y = 170 - (d.amount / chartMax) * 140;
    return { x, y, ...d };
  });

  $: pathData = chartPoints.map(p => `${p.x},${p.y}`).join(' ');
  $: areaPathData = chartPoints.length > 0
    ? `50,170 ${pathData} ${chartPoints[chartPoints.length - 1].x},170`
    : '';
</script>

<div class="space-y-6 animate-fade-in">
  <!-- View Header & Type Filter Selector -->
  <div class="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-brand-300/60 gap-4">
    <div>
      <h1 class="text-2xl font-bold tracking-tight text-warm-900">Laporan Analisis Pengeluaran</h1>
      <p class="text-sm text-warm-500 mt-1">Pantau biaya operasional, belanja bahan baku, dan pengeluaran lainnya.</p>
    </div>
    
    <!-- Filter Type Buttons -->
    <div class="flex border border-brand-300/60 rounded-xl overflow-hidden p-0.5 bg-brand-50 self-start md:self-auto">
      <button
        type="button"
        on:click={() => filterType = 'daily'}
        class="px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 cursor-pointer
          {filterType === 'daily' 
            ? 'bg-rose-500 text-white shadow-sm border border-rose-600/30' 
            : 'text-warm-500 hover:text-warm-900 bg-transparent border-0'}"
      >
        Laporan Harian
      </button>
      <button
        type="button"
        on:click={() => filterType = 'monthly'}
        class="px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 cursor-pointer
          {filterType === 'monthly' 
            ? 'bg-rose-500 text-white shadow-sm border border-rose-600/30' 
            : 'text-warm-500 hover:text-warm-900 bg-transparent border-0'}"
      >
        Laporan Bulanan
      </button>
    </div>
  </div>

  <!-- Filter Navigation Bar -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white/70 backdrop-blur-sm border border-brand-300/60 rounded-2xl p-4 gap-4 shadow-sm">
    <div class="flex items-center space-x-3">
      <div class="p-2 bg-rose-100/70 border border-rose-200/50 rounded-xl text-rose-800">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
        </svg>
      </div>
      <div>
        <h2 class="text-sm font-bold text-warm-900">
          {filterType === 'daily' ? 'Filter Pengeluaran Harian' : 'Filter Pengeluaran Bulanan'}
        </h2>
        <p class="text-xs text-warm-500 mt-0.5">
          {filterType === 'daily' ? formatDate(selectedDate) : formatMonth(selectedMonth)}
        </p>
      </div>
    </div>

    <!-- Calendar & Navigation Controls -->
    <div class="flex items-center space-x-2 self-end sm:self-center">
      {#if filterType === 'daily'}
        <button 
          on:click={() => navigateDate(-1)}
          title="Hari Sebelumnya"
          class="p-2 bg-brand-100 border border-brand-300/60 hover:border-brand-500 hover:bg-brand-200 rounded-xl text-warm-600 hover:text-warm-900 transition duration-150 cursor-pointer active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>

        <input 
          type="date" 
          bind:value={selectedDate} 
          class="bg-brand-100 border border-brand-300/60 focus:border-brand-600 rounded-xl px-3 py-1.5 text-xs text-warm-900 focus:outline-none"
        />

        <button 
          on:click={() => navigateDate(1)}
          title="Hari Berikutnya"
          class="p-2 bg-brand-100 border border-brand-300/60 hover:border-brand-500 hover:bg-brand-200 rounded-xl text-warm-600 hover:text-warm-900 transition duration-150 cursor-pointer active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
        </button>

        <button 
          on:click={setToday}
          class="px-3 py-1.5 bg-brand-500 border border-brand-600/40 hover:bg-brand-600 rounded-xl text-xs font-semibold text-warm-900 transition duration-150 cursor-pointer active:scale-95"
        >
          Hari Ini
        </button>
      {:else}
        <button 
          on:click={() => navigateMonth(-1)}
          title="Bulan Sebelumnya"
          class="p-2 bg-brand-100 border border-brand-300/60 hover:border-brand-500 hover:bg-brand-200 rounded-xl text-warm-600 hover:text-warm-900 transition duration-150 cursor-pointer active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>

        <input 
          type="month" 
          bind:value={selectedMonth} 
          class="bg-brand-100 border border-brand-300/60 focus:border-brand-600 rounded-xl px-3 py-1.5 text-xs text-warm-900 focus:outline-none"
        />

        <button 
          on:click={() => navigateMonth(1)}
          title="Bulan Berikutnya"
          class="p-2 bg-brand-100 border border-brand-300/60 hover:border-brand-500 hover:bg-brand-200 rounded-xl text-warm-600 hover:text-warm-900 transition duration-150 cursor-pointer active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
        </button>

        <button 
          on:click={setThisMonth}
          class="px-3 py-1.5 bg-brand-500 border border-brand-600/40 hover:bg-brand-600 rounded-xl text-xs font-semibold text-warm-900 transition duration-150 cursor-pointer active:scale-95"
        >
          Bulan Ini
        </button>
      {/if}
    </div>
  </div>

  <!-- Metric Overview Cards -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
    <div class="bg-white/70 backdrop-blur-sm border border-brand-300/60 p-5 rounded-2xl flex flex-col justify-between transition-all duration-200 hover:border-rose-500 hover:shadow-md">
      <div>
        <span class="text-xs font-semibold uppercase tracking-wider text-rose-600">Total Pengeluaran</span>
        <h3 class="text-2xl font-bold tracking-tight text-rose-600 mt-2">
          {formatRupiah(totalExpenseValue)}
        </h3>
      </div>
      <div class="mt-4 flex items-center space-x-2">
        <div class="w-2 h-2 rounded-full bg-rose-500"></div>
        <span class="text-xs text-warm-500">Jumlah total biaya operasional</span>
      </div>
    </div>

    <div class="bg-white/70 backdrop-blur-sm border border-brand-300/60 p-5 rounded-2xl flex flex-col justify-between transition-all duration-200 hover:border-amber-400 hover:shadow-md">
      <div>
        <span class="text-xs font-semibold uppercase tracking-wider text-amber-600">Jumlah Transaksi</span>
        <h3 class="text-2xl font-bold tracking-tight text-amber-600 mt-2">
          {transactionCount} <span class="text-xs font-bold text-warm-400 lowercase tracking-wide ml-1">transaksi</span>
        </h3>
      </div>
      <div class="mt-4 flex items-center space-x-2">
        <div class="w-2 h-2 rounded-full bg-amber-500"></div>
        <span class="text-xs text-warm-500">Banyaknya item pengeluaran</span>
      </div>
    </div>

    <div class="bg-white/70 backdrop-blur-sm border border-brand-300/60 p-5 rounded-2xl flex flex-col justify-between transition-all duration-200 hover:border-blue-300 hover:shadow-md">
      <div>
        <span class="text-xs font-semibold uppercase tracking-wider text-blue-600">Rata-Rata per Transaksi</span>
        <h3 class="text-2xl font-bold tracking-tight text-blue-600 mt-2">
          {formatRupiah(avgExpensePerTx)}
        </h3>
      </div>
      <div class="mt-4 flex items-center space-x-2">
        <div class="w-2 h-2 rounded-full bg-blue-500"></div>
        <span class="text-xs text-warm-500">Nilai rata-rata tiap pengeluaran</span>
      </div>
    </div>
  </div>

  <!-- Trend Chart -->
  <div class="bg-white/70 backdrop-blur-sm border border-brand-300/60 rounded-2xl p-5 shadow-sm w-full">
    <div class="pb-4 border-b border-brand-200/60 mb-6 flex items-center justify-between">
      <div>
        <h3 class="text-sm font-semibold tracking-tight text-warm-900">
          {filterType === 'daily' ? 'Grafik Jam Pengeluaran Harian' : 'Grafik Tren Pengeluaran Bulanan'}
        </h3>
        <p class="text-[10px] text-warm-500 mt-0.5">
          {filterType === 'daily' 
            ? `Statistik pengeluaran per jam pada ${formatDate(selectedDate)}` 
            : `Statistik pengeluaran harian sepanjang bulan ${formatMonth(selectedMonth)}`}
        </p>
      </div>
    </div>

    <div class="w-full relative min-h-[200px] flex items-center justify-center">
      {#if activeTrendData.length === 0 || chartMax <= 10000}
        <div class="text-center py-12">
          <p class="text-xs text-warm-400">Tidak ada data transaksi pengeluaran pada periode ini.</p>
        </div>
      {:else}
        <div class="w-full">
          <svg viewBox="0 0 500 200" class="w-full h-auto select-none" preserveAspectRatio="none">
            <defs>
              <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#f43f5e" stop-opacity="0.20"/>
                <stop offset="100%" stop-color="#f43f5e" stop-opacity="0.00"/>
              </linearGradient>
            </defs>

            {#each [0, 0.25, 0.5, 0.75, 1] as ratio}
              {@const y = 170 - ratio * 140}
              <line x1="50" y1={y} x2="480" y2={y} stroke="#d5d1c8" stroke-dasharray="3" stroke-width="1" />
              <text x="42" y={y + 3} text-anchor="end" class="fill-warm-400 text-[8px] font-semibold">{formatRupiahShort(ratio * chartMax)}</text>
            {/each}

            {#if areaPathData}
              <polygon points={areaPathData} fill="url(#expenseGrad)" />
            {/if}

            {#if pathData}
              <polyline points={pathData} fill="none" stroke="#e11d48" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
            {/if}

            {#each chartPoints as pt, index}
              <circle cx={pt.x} cy={pt.y} r="4" fill="#e11d48" stroke="#fffef9" stroke-width="1.5">
                <title>{pt.label}: {formatRupiah(pt.amount)}</title>
              </circle>
              {#if filterType === 'daily' || index === 0 || index === chartPoints.length - 1 || (index + 1) % 5 === 0}
                <text x={pt.x} y="188" text-anchor="middle" class="fill-warm-500 text-[8.5px] font-bold">{pt.label}</text>
              {/if}
            {/each}

            <line x1="50" y1="30" x2="50" y2="170" stroke="#d5d1c8" stroke-width="1" />
            <line x1="50" y1="170" x2="480" y2="170" stroke="#d5d1c8" stroke-width="1" />
          </svg>
        </div>
      {/if}
    </div>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
    <!-- Expense by Category -->
    <div class="bg-white/70 backdrop-blur-sm border border-brand-300/60 rounded-2xl p-6 shadow-sm">
      <h3 class="text-sm font-semibold text-warm-900 pb-3 border-b border-brand-200/60 mb-5">
        Pengeluaran per Kategori
      </h3>

      {#if categoryBreakdown.length === 0}
        <div class="py-16 text-center text-warm-400">
          <p class="text-xs">Tidak ada rincian kategori.</p>
        </div>
      {:else}
        <div class="space-y-5">
          {#each categoryBreakdown as item}
            <div class="space-y-2">
              <div class="flex items-center justify-between text-xs">
                <span class="px-2.5 py-0.5 border rounded text-[10px] tracking-wide uppercase font-bold {getCategoryStyle(item.name, $categories)}">
                  {item.name}
                </span>
                <span class="font-semibold text-warm-700">{formatRupiah(item.amount)}</span>
              </div>
              <div class="w-full h-2 bg-brand-100 border border-brand-200 rounded-full overflow-hidden">
                <div 
                  class="h-full rounded-full transition-all duration-300"
                  style="width: {(item.amount / maxCategoryAmount) * 100}%; background-color: {getCategoryHex(item.name, $categories)}"
                ></div>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>

    <!-- Top Expense Items -->
    <div class="bg-white/70 backdrop-blur-sm border border-brand-300/60 rounded-2xl p-6 shadow-sm">
      <h3 class="text-sm font-semibold text-warm-900 pb-3 border-b border-brand-200/60 mb-5">
        Daftar Pengeluaran Terbesar
      </h3>

      {#if topExpenses.length === 0}
        <div class="py-16 text-center text-warm-400">
          <p class="text-xs">Belum ada data pengeluaran.</p>
        </div>
      {:else}
        <div class="divide-y divide-brand-200/60">
          {#each topExpenses as tx}
            <div class="py-3 flex items-center justify-between">
              <div class="flex flex-col">
                <span class="text-xs font-bold text-warm-900">{tx.description}</span>
                <span class="text-[10px] text-warm-400 mt-0.5">{formatDate(tx.date)} • {tx.category || 'Lainnya'}</span>
              </div>
              <span class="text-xs font-bold text-rose-600">{formatRupiah(tx.amount)}</span>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>

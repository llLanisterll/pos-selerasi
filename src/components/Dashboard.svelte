<script>
  import { onMount, onDestroy } from 'svelte';
  import {
    transactions, categories,
    totalIncome, totalExpense, totalBalance, totalPortionsSold,
    addTransactionApi, deleteTransactionApi,
    getCategoryStyle, getCategoryHex
  } from '../stores/expenseStore.js';
  import { fetchProducts } from '../stores/productStore.js';
  import { addNotification } from '../stores/notificationStore';
  import { askConfirmation } from '../stores/confirmationStore';

  export let activeTab = 'Dashboard';

  // ─── Clock ───────────────────────────────────────────────────────────────
  let now = new Date();
  let clockInterval;
  onMount(() => {
    fetchProducts();
    clockInterval = setInterval(() => { now = new Date(); }, 1000);
  });
  onDestroy(() => clearInterval(clockInterval));

  $: greeting = (() => {
    const h = now.getHours();
    if (h < 5)  return 'Selamat Malam';
    if (h < 11) return 'Selamat Pagi';
    if (h < 15) return 'Selamat Siang';
    if (h < 19) return 'Selamat Sore';
    return 'Selamat Malam';
  })();

  $: greetingEmoji = (() => {
    const h = now.getHours();
    if (h < 5)  return '🌙';
    if (h < 11) return '☀️';
    if (h < 15) return '🌤️';
    if (h < 19) return '🌇';
    return '🌙';
  })();

  $: timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  $: dateStr = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  // ─── Formatters ──────────────────────────────────────────────────────────
  function formatRupiah(v) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v);
  }
  function formatRupiahShort(v) {
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}jt`;
    if (v >= 1_000)     return `${(v / 1_000).toFixed(0)}rb`;
    return String(Math.round(v));
  }
  function formatDate(d) {
    if (!d) return '';
    return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(d));
  }
  function todayStr() { return new Date().toISOString().split('T')[0]; }

  // ─── Today KPIs ──────────────────────────────────────────────────────────
  $: todayTxs = $transactions.filter(t => t.date === todayStr());
  $: todayIncome   = todayTxs.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
  $: todayExpense  = todayTxs.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
  $: todayPortions = todayTxs.filter(t => t.type === 'income').reduce((s, t) => s + (Number(t.quantity) || 0), 0);

  // ─── 7-day Trend Chart ───────────────────────────────────────────────────
  $: trendDays = (() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      const dayTxs = $transactions.filter(t => t.date === ds);
      days.push({
        label: d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' }),
        date: ds,
        income:  dayTxs.filter(t => t.type === 'income').reduce((s,t) => s + Number(t.amount), 0),
        expense: dayTxs.filter(t => t.type === 'expense').reduce((s,t) => s + Number(t.amount), 0),
      });
    }
    return days;
  })();

  $: chartMax = Math.max(...trendDays.map(d => Math.max(d.income, d.expense)), 100_000);

  const CHART_W = 480, CHART_H = 140, PAD_L = 48, PAD_B = 28, PAD_R = 12, PAD_T = 10;
  const innerW = CHART_W - PAD_L - PAD_R;
  const innerH = CHART_H - PAD_B - PAD_T;

  function chartX(i) { return PAD_L + (i / 6) * innerW; }
  function chartY(v) { return PAD_T + innerH - (v / chartMax) * innerH; }

  $: incomePoints  = trendDays.map((d, i) => `${chartX(i)},${chartY(d.income)}`).join(' ');
  $: expensePoints = trendDays.map((d, i) => `${chartX(i)},${chartY(d.expense)}`).join(' ');

  $: incomeArea  = `M${chartX(0)},${chartY(trendDays[0]?.income??0)} ` +
    trendDays.map((d,i) => `L${chartX(i)},${chartY(d.income)}`).join(' ') +
    ` L${chartX(6)},${PAD_T+innerH} L${chartX(0)},${PAD_T+innerH} Z`;

  $: expenseArea = `M${chartX(0)},${chartY(trendDays[0]?.expense??0)} ` +
    trendDays.map((d,i) => `L${chartX(i)},${chartY(d.expense)}`).join(' ') +
    ` L${chartX(6)},${PAD_T+innerH} L${chartX(0)},${PAD_T+innerH} Z`;

  // ─── Category Breakdown (this month expenses) ────────────────────────────
  $: thisMonth = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
  $: monthExpenses = $transactions.filter(t => t.type === 'expense' && t.date?.startsWith(thisMonth));
  $: catBreakdown = (() => {
    const map = {};
    monthExpenses.forEach(t => {
      const catName = t.category || 'Lainnya';
      map[catName] = (map[catName] || 0) + Number(t.amount);
    });
    const total = Object.values(map).reduce((s, v) => s + v, 0) || 1;
    return Object.entries(map)
      .sort((a,b) => b[1]-a[1])
      .slice(0, 5)
      .map(([name, amount]) => ({ name, amount, pct: (amount/total)*100 }));
  })();

  // ─── Recent Transactions ─────────────────────────────────────────────────
  $: recentTxs = [...$transactions].sort((a, b) => {
    const dateA = a.date || '';
    const dateB = b.date || '';
    if (dateA !== dateB) return dateB.localeCompare(dateA);
    const timeA = a.created_at || '';
    const timeB = b.created_at || '';
    if (timeA !== timeB) return timeB.localeCompare(timeA);
    return String(b.id).localeCompare(String(a.id));
  }).slice(0, 10);

  async function deleteTx(id) {
    askConfirmation({
      title: 'Hapus Transaksi',
      message: 'Apakah Anda yakin ingin menghapus catatan transaksi ini?',
      confirmText: 'Hapus',
      type: 'danger',
      onConfirm: async () => {
        try { 
          await deleteTransactionApi(id); 
          addNotification('Transaksi dihapus!', 'success');
        } catch(e) { 
          addNotification('Gagal: ' + e.message, 'error'); 
        }
      }
    });
  }

  // ─── Quick Add Form ───────────────────────────────────────────────────────
  let showForm = false;
  let formDesc = '';
  let formAmount = '';
  let formCategory = '';
  let formDate = todayStr();
  let formPayment = 'Tunai';
  let formQty = 1;
  let formLoading = false;
  let formSuccess = false;

  $: expenseCats = $categories.filter(c => c.type === 'expense');
  $: {
    if (expenseCats.length > 0 && !formCategory) {
      formCategory = expenseCats[0].name;
    }
  }

  async function submitForm(e) {
    e.preventDefault();
    if (!formAmount || Number(formAmount) <= 0) return alert('Nominal tidak valid.');
    if (!formDesc.trim()) return alert('Isi deskripsi.');
    formLoading = true;
    try {
      await addTransactionApi({
        id: Date.now().toString(),
        description: formDesc.trim(),
        amount: Number(formAmount),
        type: 'expense',
        category: formCategory || 'Operasional',
        date: formDate,
        quantity: Number(formQty) || 1,
        payment_method: formPayment,
      });
      formDesc = ''; formAmount = ''; formQty = 1; formDate = todayStr();
      addNotification('Pengeluaran berhasil disimpan!', 'success');
    } catch(e) {
      addNotification('Gagal: ' + e.message, 'error');
    }
    formLoading = false;
  }
</script>

<div class="space-y-6 animate-fade-in">

  <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
    <div>
      <div class="flex items-center gap-2 mb-1">
        <span class="text-2xl">{greetingEmoji}</span>
        <h1 class="text-2xl font-bold tracking-tight text-warm-900">{greeting}, Selerasi!</h1>
      </div>
      <p class="text-sm text-warm-500 flex items-center gap-1.5">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3.5 h-3.5 flex-shrink-0">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
        </svg>
        {dateStr}
        <span class="text-warm-300 mx-1">·</span>
        <span class="font-mono font-semibold text-warm-700">{timeStr}</span>
      </p>
    </div>

    <button
      on:click={() => showForm = !showForm}
      class="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-700 hover:bg-brand-800 active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-md transition-all duration-150 cursor-pointer self-start sm:self-auto"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
      {showForm ? 'Tutup Form' : 'Catat Pengeluaran'}
    </button>
  </div>

  {#if showForm}
    <div class="bg-white/80 backdrop-blur-sm border border-brand-300/60 rounded-2xl p-5 shadow-md animate-fade-in">
      <h2 class="text-sm font-bold text-warm-900 mb-4 flex items-center gap-2">
        <span class="w-5 h-5 bg-rose-500/20 border border-rose-400/50 rounded-md flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-3.5 h-3.5 text-rose-800">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 12h-15" />
          </svg>
        </span>
        Catat Pengeluaran Baru
      </h2>

      <form on:submit={submitForm} class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div class="sm:col-span-2 lg:col-span-1 space-y-1">
          <label for="dash-desc" class="text-xs font-medium text-warm-600">Deskripsi</label>
          <input id="dash-desc" type="text" bind:value={formDesc} placeholder="Contoh: Belanja bahan baku..." required
            class="w-full px-3 py-2 bg-brand-50 border border-brand-300/60 text-warm-900 placeholder-warm-300 focus:border-brand-700 focus:outline-none rounded-xl text-xs" />
        </div>

        <div class="space-y-1">
          <label for="dash-amount" class="text-xs font-medium text-warm-600">Nominal (Rp)</label>
          <div class="relative">
            <span class="absolute left-3 top-2.5 text-xs text-warm-400 font-semibold">Rp</span>
            <input id="dash-amount" type="number" bind:value={formAmount} min="1" placeholder="0" required
              class="w-full pl-9 pr-3 py-2 bg-brand-50 border border-brand-300/60 text-warm-900 placeholder-warm-300 focus:border-brand-700 focus:outline-none rounded-xl text-xs" />
          </div>
        </div>

        <div class="space-y-1">
          <label for="dash-category" class="text-xs font-medium text-warm-600">Kategori</label>
          <select id="dash-category" bind:value={formCategory} required
            class="w-full px-3 py-2 bg-brand-50 border border-brand-300/60 text-warm-900 focus:border-brand-700 focus:outline-none rounded-xl text-xs">
            {#each expenseCats as cat}
              <option value={cat.name}>{cat.name}</option>
            {/each}
            {#if expenseCats.length === 0}
              <option value="Operasional">Operasional</option>
            {/if}
          </select>
        </div>

        <div class="space-y-1">
          <label for="dash-payment" class="text-xs font-medium text-warm-600">Pembayaran</label>
          <select id="dash-payment" bind:value={formPayment} required
            class="w-full px-3 py-2 bg-brand-50 border border-brand-300/60 text-warm-900 focus:border-brand-700 focus:outline-none rounded-xl text-xs">
            <option value="Tunai">Tunai</option>
            <option value="Transfer Bank">Transfer Bank</option>
          </select>
        </div>

        <div class="space-y-1">
          <label for="dash-date" class="text-xs font-medium text-warm-600">Tanggal</label>
          <input id="dash-date" type="date" bind:value={formDate} required
            class="w-full px-3 py-2 bg-brand-50 border border-brand-300/60 text-warm-900 focus:border-brand-700 focus:outline-none rounded-xl text-xs" />
        </div>

        <div class="space-y-1">
          <label for="dash-qty" class="text-xs font-medium text-warm-600">Jumlah Unit</label>
          <input id="dash-qty" type="number" bind:value={formQty} min="1" placeholder="1" required
            class="w-full px-3 py-2 bg-brand-50 border border-brand-300/60 text-warm-900 placeholder-warm-300 focus:border-brand-700 focus:outline-none rounded-xl text-xs" />
        </div>

        <div class="flex items-end sm:col-span-2 lg:col-span-3">
          <button type="submit" disabled={formLoading}
            class="w-full py-2.5 bg-brand-700 hover:bg-brand-800 disabled:opacity-60 active:scale-[0.99] text-white text-xs font-bold rounded-xl transition-all duration-150 cursor-pointer shadow-md">
            {formLoading ? 'Menyimpan...' : 'Simpan Pengeluaran'}
          </button>
        </div>
      </form>
    </div>
  {/if}

  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
    <div class="col-span-2 md:col-span-1 bg-white/80 backdrop-blur-sm border {$totalBalance < 0 ? 'border-rose-200 bg-rose-50/60' : 'border-brand-300/60'} rounded-2xl p-5 shadow-sm">
      <div class="flex items-start justify-between mb-3">
        <span class="text-xs font-bold uppercase tracking-wider {$totalBalance < 0 ? 'text-rose-500' : 'text-warm-500'}">Saldo Bersih</span>
      </div>
      <div class="text-2xl font-extrabold {$totalBalance < 0 ? 'text-rose-600' : 'text-warm-900'} tracking-tight leading-none mb-2">
        {formatRupiah($totalBalance)}
      </div>
      <p class="text-xs text-warm-400">Akumulasi saldo keseluruhan</p>
    </div>

    <div class="bg-white/80 backdrop-blur-sm border border-brand-300/60 rounded-2xl p-5 shadow-sm">
      <div class="flex items-start justify-between mb-3">
        <span class="text-xs font-bold uppercase tracking-wider text-warm-500">Masuk Hari Ini</span>
      </div>
      <div class="text-xl font-extrabold text-warm-900 tracking-tight leading-none mb-2">
        {formatRupiah(todayIncome)}
      </div>
      <p class="text-xs text-warm-400">{todayTxs.filter(t => t.type === 'income').length} transaksi</p>
    </div>

    <div class="bg-white/80 backdrop-blur-sm border border-brand-300/60 rounded-2xl p-5 shadow-sm">
      <div class="flex items-start justify-between mb-3">
        <span class="text-xs font-bold uppercase tracking-wider text-warm-500">Keluar Hari Ini</span>
      </div>
      <div class="text-xl font-extrabold text-warm-900 tracking-tight leading-none mb-2">
        {formatRupiah(todayExpense)}
      </div>
      <p class="text-xs text-warm-400">{todayTxs.filter(t => t.type === 'expense').length} transaksi</p>
    </div>

    <div class="bg-white/80 backdrop-blur-sm border border-brand-300/60 rounded-2xl p-5 shadow-sm">
      <div class="flex items-start justify-between mb-3">
        <span class="text-xs font-bold uppercase tracking-wider text-warm-500">Porsi Hari Ini</span>
      </div>
      <div class="text-xl font-extrabold text-warm-900 tracking-tight leading-none mb-2">
        {todayPortions} <span class="text-sm font-medium text-warm-400">porsi</span>
      </div>
      <p class="text-xs text-warm-400">Total {$totalPortionsSold} porsi</p>
    </div>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div class="md:col-span-2 bg-white/80 backdrop-blur-sm border border-brand-300/60 rounded-2xl p-5 shadow-sm">
      <div class="flex items-center justify-between mb-5">
        <h2 class="text-sm font-bold text-warm-900">Tren Arus Kas 7 Hari</h2>
      </div>

      <div class="w-full overflow-hidden">
        <svg viewBox="0 0 {CHART_W} {CHART_H}" class="w-full h-auto select-none" preserveAspectRatio="none">
          <defs>
            <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#c4994f" stop-opacity="0.18"/>
              <stop offset="100%" stop-color="#c4994f" stop-opacity="0"/>
            </linearGradient>
            <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#f43f5e" stop-opacity="0.12"/>
              <stop offset="100%" stop-color="#f43f5e" stop-opacity="0"/>
            </linearGradient>
          </defs>
          {#each [0, 0.25, 0.5, 0.75, 1] as ratio}
            {@const y = PAD_T + innerH - ratio * innerH}
            <line x1={PAD_L} y1={y} x2={CHART_W - PAD_R} y2={y} stroke="#e8e3da" stroke-dasharray="3" stroke-width="1"/>
            <text x={PAD_L - 4} y={y + 3} text-anchor="end" font-size="7" fill="#b0aa9e">{formatRupiahShort(ratio * chartMax)}</text>
          {/each}
          <path d={incomeArea} fill="url(#incomeGrad)"/>
          <path d={expenseArea} fill="url(#expenseGrad)"/>
          <polyline points={incomePoints} fill="none" stroke="#c4994f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <polyline points={expensePoints} fill="none" stroke="#f43f5e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          {#each trendDays as d, i}
            <circle cx={chartX(i)} cy={chartY(d.income)} r="3" fill="#c4994f" stroke="#fffef9" stroke-width="1"/>
            <circle cx={chartX(i)} cy={chartY(d.expense)} r="3" fill="#f43f5e" stroke="#fffef9" stroke-width="1"/>
            <text x={chartX(i)} y={CHART_H - 4} text-anchor="middle" font-size="7.5" fill="#8a8276">{d.label}</text>
          {/each}
        </svg>
      </div>
    </div>

    <!-- Category Breakdown for expenses -->
    <div class="bg-white/80 backdrop-blur-sm border border-brand-300/60 rounded-2xl p-5 shadow-sm">
      <div class="mb-5">
        <h2 class="text-sm font-bold text-warm-900">Kategori Pengeluaran</h2>
        <p class="text-xs text-warm-400 mt-0.5">Rincian pengeluaran bulan ini</p>
      </div>

      {#if catBreakdown.length === 0}
        <div class="flex flex-col items-center justify-center py-12 text-center text-warm-400">
           <p class="text-xs">Tidak ada pengeluaran bulan ini.</p>
        </div>
      {:else}
        <div class="space-y-4">
          {#each catBreakdown as cat}
            <div class="space-y-1.5">
              <div class="flex items-center justify-between text-xs">
                <span class="font-semibold text-warm-700 truncate pr-2">{cat.name}</span>
                <span class="font-bold text-warm-600 flex-shrink-0">{cat.pct.toFixed(0)}%</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="flex-1 h-1.5 bg-brand-100 rounded-full overflow-hidden">
                  <div class="h-full rounded-full transition-all duration-500"
                    style="width: {cat.pct}%; background-color: {getCategoryHex(cat.name, $categories)}">
                  </div>
                </div>
              </div>
              <span class="text-[10px] text-warm-400 block">{formatRupiah(cat.amount)}</span>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>

  <div class="bg-white/80 backdrop-blur-sm border border-brand-300/60 rounded-2xl p-5 shadow-sm">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-sm font-bold text-warm-900">Transaksi Terbaru</h2>
      <button on:click={() => activeTab = 'History'} class="text-xs font-bold text-brand-700 hover:underline">Lihat Semua</button>
    </div>

    <div class="divide-y divide-brand-200/50">
      {#each recentTxs as tx (tx.id)}
        <div class="py-3 flex items-center justify-between group">
          <div class="flex flex-col min-w-0 pr-4">
            <span class="text-xs font-semibold text-warm-800 truncate">{tx.description}</span>
            <div class="flex items-center gap-2 mt-0.5">
              <span class="text-[10px] text-warm-400">{formatDate(tx.date)}</span>
              {#if tx.type === 'expense'}
                <span class="text-[9px] px-1.5 py-0.2 border rounded font-bold uppercase select-none {getCategoryStyle(tx.category, $categories)}">
                  {tx.category || 'Lainnya'}
                </span>
              {/if}
            </div>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-sm font-bold {tx.type === 'income' ? 'text-emerald-600' : 'text-rose-500'}">
              {tx.type === 'income' ? '+' : '-'}{formatRupiah(tx.amount)}
            </span>
            <button on:click={() => deleteTx(tx.id)} class="text-warm-300 hover:text-rose-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3.5 h-3.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.34 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
            </button>
          </div>
        </div>
      {/each}
    </div>
  </div>

</div>

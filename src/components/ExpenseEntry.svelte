<script>
  import { onMount } from 'svelte';
  import {
    transactions, categories,
    addTransactionApi, deleteTransactionApi,
    getCategoryStyle, getCategoryHex
  } from '../stores/expenseStore.js';
  import { addNotification } from '../stores/notificationStore.js';
  import { askConfirmation } from '../stores/confirmationStore.js';

  // ─── Form States ──────────────────────────────────────────────────────────
  let items = [
    { description: '', amount: '', category: '', quantity: 1 }
  ];
  let formDate = todayStr();
  let formPayment = 'Tunai';
  let formLoading = false;

  // ─── OCR States ───────────────────────────────────────────────────────────
  let isScanning = false;
  let scanProgress = 0;
  let selectedFileName = '';
  let ocrStatusText = 'Menyiapkan engine OCR...';

  // ─── Budget Limits (Static Mock for premium UI showcase) ───────────────────
  const budgetLimits = {
    'Bahan Baku': 6000000,
    'Packaging': 2500000,
    'Gaji': 8000000,
    'Operasional': 2000000,
    'Lainnya': 1500005
  };

  // ─── Quick Templates ──────────────────────────────────────────────────────
  const templates = [
    { label: 'Bahan Baku Harian', desc: 'Belanja bahan baku ayam & bumbu', category: 'Bahan Baku', amount: 150000, qty: 1, payment: 'Tunai' },
    { label: 'Paper Bowl Sablon', desc: 'Paper bowl sablon logo 500 pcs', category: 'Packaging', amount: 600000, qty: 500, payment: 'Transfer Bank' },
    { label: 'Listrik & Air Toko', desc: 'Listrik & air operasional bulanan', category: 'Operasional', amount: 350000, qty: 1, payment: 'Transfer Bank' },
    { label: 'Gas LPG Operasional', desc: 'Refill gas melon LPG 3kg', category: 'Operasional', amount: 22000, qty: 1, payment: 'Tunai' }
  ];

  // ─── Helper Functions ─────────────────────────────────────────────────────
  function todayStr() { return new Date().toISOString().split('T')[0]; }
  
  function formatRupiah(v) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v);
  }
  
  function formatDate(d) {
    if (!d) return '';
    return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(d));
  }

  // ─── Reactive Variables ──────────────────────────────────────────────────
  $: expenseCats = $categories.filter(c => c.type === 'expense');

  // Inisialisasi kategori dikosongkan agar pengguna memilih secara manual
  // (menghindari kesalahan pencatatan kategori default secara tidak sengaja)

  $: thisMonth = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  })();

  // Hitung total pengeluaran per kategori yang disimpan bulan ini
  $: categoryUsage = (() => {
    const usage = {};
    $transactions
      .filter(t => t.type === 'expense' && t.date?.startsWith(thisMonth))
      .forEach(t => {
        const cat = t.category || 'Lainnya';
        usage[cat] = (usage[cat] || 0) + Number(t.amount);
      });
    return usage;
  })();

  // Hitung simulasi pengeluaran draf form saat ini per kategori
  $: draftUsage = (() => {
    const draft = {};
    items.forEach(item => {
      if (item.category && item.amount) {
        draft[item.category] = (draft[item.category] || 0) + Number(item.amount);
      }
    });
    return draft;
  })();

  // Total nominal seluruh baris draf
  $: totalDraftAmount = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  // Catatan Pengeluaran Hari Ini
  $: todayExpenses = $transactions.filter(t => t.type === 'expense' && t.date === todayStr());
  $: todayTotalExpense = todayExpenses.reduce((sum, t) => sum + Number(t.amount), 0);

  // ─── Form Actions ─────────────────────────────────────────────────────────
  function addItem() {
    items = [...items, { description: '', amount: '', category: '', quantity: 1 }];
  }

  function removeItem(index) {
    if (items.length > 1) {
      items = items.filter((_, idx) => idx !== index);
    }
  }

  function applyTemplate(tpl) {
    items = [{
      description: tpl.desc,
      amount: tpl.amount,
      category: tpl.category,
      quantity: tpl.qty
    }];
    formPayment = tpl.payment;
    addNotification(`Template "${tpl.label}" diterapkan!`, 'success');
  }

  // ─── Form Submission ──────────────────────────────────────────────────────
  async function submitForm(e) {
    if (e) e.preventDefault();
    
    // Validasi baris item
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.description.trim()) {
        addNotification(`Deskripsi barang #${i + 1} tidak boleh kosong!`, 'error');
        return;
      }
      if (!item.amount || Number(item.amount) <= 0) {
        addNotification(`Nominal barang #${i + 1} tidak valid!`, 'error');
        return;
      }
      if (!item.category) {
        addNotification(`Kategori barang #${i + 1} belum dipilih!`, 'error');
        return;
      }
    }

    formLoading = true;
    try {
      // Simpan seluruh baris secara paralel ke database
      const savePromises = items.map((item, idx) => {
        return addTransactionApi({
          id: (Date.now() + idx).toString(),
          description: item.description.trim(),
          amount: Number(item.amount),
          type: 'expense',
          category: item.category || 'Operasional',
          date: formDate,
          quantity: Number(item.quantity) || 1,
          payment_method: formPayment
        });
      });

      await Promise.all(savePromises);
      addNotification(`${items.length} item pengeluaran berhasil disimpan!`, 'success');
      
      // Reset form
      items = [{ description: '', amount: '', category: '', quantity: 1 }];
      formDate = todayStr();
      selectedFileName = '';
    } catch(e) {
      addNotification('Gagal menyimpan: ' + e.message, 'error');
    } finally {
      formLoading = false;
    }
  }

  // ─── OCR Tesseract Integration ────────────────────────────────────────────
  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    selectedFileName = file.name;
    runOcr(file);
  }

  async function runOcr(file) {
    if (typeof window === 'undefined') return;
    
    isScanning = true;
    ocrStatusText = 'Menghubungkan ke Engine OCR...';
    scanProgress = 5;

    // Unduh Tesseract.js via CDN jika belum termuat
    if (!window.Tesseract) {
      try {
        await loadTesseractScript();
      } catch (err) {
        addNotification("Gagal memuat engine OCR Tesseract: " + err.message, "error");
        isScanning = false;
        return;
      }
    }
    
    ocrStatusText = 'Menginisialisasi pemindaian...';
    scanProgress = 15;
    
    try {
      const imageUrl = URL.createObjectURL(file);
      
      const { data: { text } } = await window.Tesseract.recognize(
        imageUrl,
        'ind',
        {
          logger: m => {
            if (m.status === 'recognizing text') {
              ocrStatusText = `Mengekstrak teks struk... ${Math.round(m.progress * 100)}%`;
              scanProgress = 15 + Math.round(m.progress * 85);
            } else {
              ocrStatusText = `${m.status === 'loading tesseract api' ? 'Memuat Engine OCR' : m.status}...`;
              scanProgress = Math.min(scanProgress + 1, 15);
            }
          }
        }
      );
      
      parseOcrText(text, file.name);
      URL.revokeObjectURL(imageUrl);
    } catch (err) {
      console.error("OCR Error:", err);
      addNotification("Gagal memindai struk: " + err.message, "error");
    } finally {
      isScanning = false;
    }
  }

  function loadTesseractScript() {
    return new Promise((resolve, reject) => {
      if (window.Tesseract) return resolve();
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5.0.5/dist/tesseract.min.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Gagal mengunduh script Tesseract.js"));
      document.head.appendChild(script);
    });
  }

  function parseOcrText(text, fileName) {
    if (!text || text.trim().length === 0) {
      addNotification("Teks tidak terbaca. Pastikan foto struk tajam dan memiliki kontras yang baik.", "error");
      return;
    }

    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) return;

    // 1. Ekstrak nama toko / brand
    let detectedStore = '';
    for (let i = 0; i < Math.min(4, lines.length); i++) {
      const line = lines[i];
      const lineClean = line.replace(/[^a-zA-Z\s]/g, '').trim();
      if (lineClean.length > 3 && lineClean.length < 25 && 
          !['tanggal', 'nota', 'welcome', 'selamat', 'no.'].some(w => lineClean.toLowerCase().includes(w))) {
        detectedStore = lineClean;
        break;
      }
    }
    if (!detectedStore) {
      detectedStore = fileName.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
    }
    const cleanStore = detectedStore.replace(/^(welcome to|selamat datang di|kasir|outlet)\s+/i, '');

    // 2. Ekstrak tanggal struk
    const dateRegexes = [
      /(\d{2})[\/\-](\d{2})[\/\-](\d{4})/, // DD/MM/YYYY
      /(\d{4})[\/\-](\d{2})[\/\-](\d{2})/  // YYYY-MM-DD
    ];
    let dateFound = false;
    for (const r of dateRegexes) {
      const match = text.match(r);
      if (match) {
        if (match[3].length === 4) {
          formDate = `${match[3]}-${match[2]}-${match[1]}`;
        } else {
          formDate = match[0];
        }
        dateFound = true;
        break;
      }
    }
    if (!dateFound) formDate = todayStr();

    // 3. Ekstrak metode pembayaran
    const fullTextLower = text.toLowerCase();
    if (['qris', 'gopay', 'ovo', 'dana', 'linkaja', 'spay', 'shopeepay'].some(w => fullTextLower.includes(w))) {
      formPayment = 'QRIS';
    } else if (['debit', 'credit', 'transfer', 'bca', 'mandiri', 'bni', 'bri', 'card'].some(w => fullTextLower.includes(w))) {
      formPayment = 'Transfer Bank';
    } else {
      formPayment = 'Tunai';
    }

    // 4. Deteksi Line Items (Barang belanjaan per baris)
    const skipKeywords = ['total', 'grand', 'subtotal', 'sub', 'pajak', 'tax', 'diskon', 'discount', 'kembalian', 'change', 'cash', 'tunai', 'bayar', 'kembali', 'telp', 'alamat', 'jl.', 'jalan', 'welcome', 'selamat', 'promo', 'member', 'kartu', 'merchant', 'npwp', 'operator', 'kasir'];
    
    let parsedItems = [];
    
    lines.forEach(line => {
      const lower = line.toLowerCase();
      if (skipKeywords.some(kw => lower.includes(kw))) return;

      // Gabungkan ribuan (misal 150.000 menjadi 150000)
      const cleanLine = line.replace(/(\d+)[.,](\d{3})/g, '$1$2');
      const numMatches = cleanLine.match(/\d+/g);
      
      if (numMatches && numMatches.length > 0) {
        const lastNumStr = numMatches[numMatches.length - 1];
        const price = parseInt(lastNumStr, 10);
        
        // Cek harga barang masuk akal di Indonesia (Rp 2.000 s/d Rp 2.000.000)
        if (price >= 2000 && price <= 2000000) {
          const priceIdx = cleanLine.lastIndexOf(lastNumStr);
          const name = cleanLine.slice(0, priceIdx).replace(/[^a-zA-Z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
          
          if (name.length > 2 && name.length < 35) {
            // Deteksi Qty (misal "2 x" atau "3 pcs" atau "5 kg")
            let qty = 1;
            const qtyMatch = cleanLine.match(/(\d+)\s*(x|pcs|kg|pak|bks)/i);
            if (qtyMatch) qty = parseInt(qtyMatch[1], 10);
            
            // Klasifikasi kategori otomatis
            let cat = 'Operasional';
            const foodKeywords = ['ayam', 'beras', 'cabai', 'bawang', 'minyak', 'telur', 'sayur', 'daging', 'bumbu', 'kecap', 'saus', 'gula', 'garam'];
            const packagingKeywords = ['cup', 'box', 'kemasan', 'plastik', 'mika', 'sendok', 'garpu', 'sedotan', 'sablon', 'paper bowl'];
            
            const lowerName = name.toLowerCase();
            if (foodKeywords.some(kw => lowerName.includes(kw))) {
              cat = 'Bahan Baku';
            } else if (packagingKeywords.some(kw => lowerName.includes(kw))) {
              cat = 'Packaging';
            }
            
            const exists = expenseCats.some(c => c.name.toLowerCase() === cat.toLowerCase());
            const finalCat = exists 
              ? expenseCats.find(c => c.name.toLowerCase() === cat.toLowerCase()).name 
              : '';

            parsedItems.push({
              description: name,
              amount: price,
              category: finalCat,
              quantity: qty
            });
          }
        }
      }
    });

    // Masukkan data barang ke form
    if (parsedItems.length > 0) {
      items = parsedItems;
      addNotification(`OCR Sukses! Berhasil memindai ${parsedItems.length} item barang dari struk`, 'success');
    } else {
      // Fallback: Jika tidak terdeteksi per item, ambil nominal total belanja saja
      let totalAmount = 0;
      let maxNumberFound = 0;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].toLowerCase();
        if (['total', 'jumlah', 'grand', 'bayar'].some(w => line.includes(w))) {
          const numberMatches = line.replace(/[^0-9]/g, '');
          const amount = parseInt(numberMatches, 10);
          if (amount >= 1000 && amount <= 5000000) {
            totalAmount = amount;
            break;
          }
        }
      }
      
      if (totalAmount === 0) {
        lines.forEach(line => {
          const parsedLine = line.replace(/(\d+)[.,](\d{3})/g, '$1$2');
          const matches = parsedLine.match(/\b\d{4,7}\b/g);
          if (matches) {
            matches.forEach(m => {
              const val = parseInt(m, 10);
              if (val > maxNumberFound && val >= 1000 && val <= 5000000) {
                maxNumberFound = val;
              }
            });
          }
        });
        totalAmount = maxNumberFound;
      }
      
      const defaultCat = expenseCats.length > 0 ? expenseCats[0].name : 'Operasional';
      items = [{
        description: `Belanja di ${cleanStore}`,
        amount: totalAmount > 0 ? totalAmount : '',
        category: defaultCat,
        quantity: 1
      }];
      addNotification(`OCR Sukses! Berhasil membaca total belanja dari ${cleanStore}`, 'success');
    }
  }

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
</script>

<div class="space-y-6 animate-fade-in pb-12">
  <!-- Header Halaman -->
  <div>
    <h1 class="text-2xl font-bold tracking-tight text-warm-900 flex items-center gap-2">
      <span class="p-1.5 bg-rose-500/10 border border-rose-400/30 text-rose-600 rounded-lg flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 12h-15" />
        </svg>
      </span>
      Catat Pengeluaran Operasional
    </h1>
    <p class="text-sm text-warm-500 mt-1">
      Kelola struk belanja dengan banyak jenis barang sekaligus dan kendalikan anggaran per kategori secara real-time.
    </p>
  </div>

  <!-- Responsive Layout: Single column on mobile & tablet, 3-columns on desktop XL -->
  <div class="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
    
    <!-- ─── KOLOM KIRI: FORM MULTI-ITEM (2/3 Width on XL) ───────────────────── -->
    <div class="xl:col-span-2 space-y-6">
      
      <!-- Card Form Glassmorphism -->
      <div class="bg-white/80 backdrop-blur-sm border border-brand-300/60 rounded-3xl p-5 sm:p-7 md:p-8 shadow-md">
        
        <div class="flex items-center justify-between border-b border-brand-200 pb-4 mb-6">
          <h2 class="text-sm font-bold text-warm-900 uppercase tracking-wider flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 text-brand-700">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
            Formulir Catat Pengeluaran
          </h2>
          <span class="text-xs font-semibold text-brand-850 bg-brand-200/60 border border-brand-300/40 px-3 py-1 rounded-full">Batch Input</span>
        </div>

        <form on:submit={submitForm} class="space-y-6">
          
          <!-- Ringkasan Total Belanja Struk (Desain Besar) -->
          <div class="space-y-1.5 bg-rose-50/30 border border-rose-100 rounded-2xl p-4 sm:p-5 transition duration-150 flex items-center justify-between">
            <div>
              <span class="text-[10px] font-bold uppercase tracking-wider text-rose-700 block">Total Pengeluaran Struk Ini</span>
              <span class="text-2xl sm:text-3xl font-black text-rose-600 tracking-tight">{formatRupiah(totalDraftAmount)}</span>
            </div>
            <span class="text-xs font-semibold text-warm-650 bg-brand-100 border border-brand-200 px-3 py-1.5 rounded-xl">
              {items.length} Item Barang
            </span>
          </div>

          <!-- Dynamic Item Rows -->
          <div class="space-y-4">
            <!-- Table Header (Desktop LG screens and above) -->
            <div class="hidden lg:flex items-center gap-3 border-b border-brand-200/50 pb-2 text-[10px] font-bold text-warm-400 uppercase tracking-wider">
              <div class="flex-[3]">Deskripsi Barang / Jasa</div>
              <div class="flex-[2]">Total Harga (Rp)</div>
              <div class="flex-[2]">Kategori Anggaran</div>
              <div class="w-16 text-center">Qty</div>
              <div class="w-8"></div>
            </div>

            <!-- Loop Item list -->
            {#each items as item, idx}
              <!-- Card layout on mobile/tablet (below lg), row layout on desktop (lg and above) -->
              <div class="p-4 lg:p-0 bg-brand-50/30 lg:bg-transparent border border-brand-200/60 lg:border-none rounded-2xl space-y-4 lg:space-y-0 lg:flex lg:items-center lg:gap-3 group animate-fade-in">
                
                <!-- Tablet/Mobile Header Identifier -->
                <div class="flex items-center justify-between lg:hidden border-b border-brand-200 pb-2">
                  <span class="text-xs font-bold text-brand-850">Barang #{idx + 1}</span>
                  {#if items.length > 1}
                    <button type="button" on:click={() => removeItem(idx)} class="text-rose-500 hover:text-rose-700 text-xs font-bold flex items-center gap-1 active:scale-95 transition">
                      Hapus
                    </button>
                  {/if}
                </div>

                <!-- Deskripsi -->
                <div class="flex-grow lg:flex-[3] space-y-1">
                  <!-- svelte-ignore a11y-label-has-associated-control -->
                  <label class="text-[10px] font-bold text-warm-500 block lg:hidden">Nama Barang</label>
                  <input 
                    type="text" 
                    bind:value={item.description} 
                    placeholder="Contoh: Beli Beras 10kg" 
                    required 
                    class="w-full px-4 py-3 lg:px-3 lg:py-2.5 bg-brand-50/40 border border-brand-300/60 text-warm-900 placeholder-warm-300 focus:border-brand-700 focus:bg-white focus:outline-none rounded-xl text-xs transition" 
                  />
                </div>

                <!-- Nominal -->
                <div class="lg:flex-[2] space-y-1">
                  <!-- svelte-ignore a11y-label-has-associated-control -->
                  <label class="text-[10px] font-bold text-warm-500 block lg:hidden">Harga Total (Rp)</label>
                  <div class="relative">
                    <span class="absolute left-3 top-3 lg:top-2.5 text-xs text-warm-450 font-semibold select-none">Rp</span>
                    <input 
                      type="number" 
                      bind:value={item.amount} 
                      min="1"
                      placeholder="0" 
                      required 
                      class="w-full pl-8 pr-4 py-3 lg:pr-3 lg:py-2.5 bg-brand-50/40 border border-brand-300/60 text-warm-900 placeholder-warm-300 focus:border-brand-700 focus:bg-white focus:outline-none rounded-xl text-xs transition" 
                    />
                  </div>
                </div>

                <!-- Kategori -->
                <div class="lg:flex-[2] space-y-1">
                  <!-- svelte-ignore a11y-label-has-associated-control -->
                  <label class="text-[10px] font-bold text-warm-500 block lg:hidden">Kategori</label>
                  <select 
                    bind:value={item.category} 
                    required
                    class="w-full px-4 py-3 lg:px-3 lg:py-2.5 bg-brand-50/40 border border-brand-300/60 text-warm-900 focus:border-brand-700 focus:bg-white focus:outline-none rounded-xl text-xs transition"
                  >
                    <option value="" disabled selected>-- Pilih Kategori --</option>
                    {#each expenseCats as cat}
                      <option value={cat.name}>{cat.name}</option>
                    {/each}
                  </select>
                </div>

                <!-- Qty -->
                <div class="lg:w-16 space-y-1">
                  <!-- svelte-ignore a11y-label-has-associated-control -->
                  <label class="text-[10px] font-bold text-warm-500 block lg:hidden">Qty</label>
                  <input 
                    type="number" 
                    bind:value={item.quantity} 
                    min="1" 
                    placeholder="1" 
                    required
                    class="w-full px-4 py-3 lg:px-3 lg:py-2.5 bg-brand-50/40 border border-brand-300/60 text-warm-900 focus:border-brand-700 focus:bg-white focus:outline-none rounded-xl text-xs transition" 
                  />
                </div>

                <!-- Delete Action (Desktop/LG screen only) -->
                {#if items.length > 1}
                  <button 
                    type="button" 
                    on:click={() => removeItem(idx)} 
                    class="hidden lg:flex p-2 text-warm-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer self-end mb-0.5"
                    title="Hapus Baris"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 12h-15" />
                    </svg>
                  </button>
                {/if}

              </div>
            {/each}

            <!-- Add Row Button -->
            <button 
              type="button" 
              on:click={addItem}
              class="w-full py-3 border-2 border-dashed border-brand-350 hover:border-brand-700 hover:bg-brand-50/20 text-xs font-bold text-warm-650 hover:text-warm-950 rounded-xl transition duration-150 cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.98]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Tambah Baris Barang Baru
            </button>
          </div>

          <!-- Common Receipt Fields -->
          <div class="border-t border-brand-200/70 pt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <!-- Tanggal -->
            <div class="space-y-1">
              <label for="date" class="text-xs font-semibold text-warm-700">Tanggal Struk Belanja</label>
              <input 
                id="date" 
                type="date" 
                bind:value={formDate} 
                required
                class="w-full px-4 py-3 bg-brand-50/40 border border-brand-300/60 text-warm-900 focus:border-brand-700 focus:bg-white focus:outline-none rounded-xl text-xs transition" 
              />
            </div>

            <!-- Metode Pembayaran -->
            <div class="space-y-1">
              <label for="payment" class="text-xs font-semibold text-warm-700">Metode Pembayaran</label>
              <select 
                id="payment" 
                bind:value={formPayment} 
                required
                class="w-full px-4 py-3 bg-brand-50/40 border border-brand-300/60 text-warm-900 focus:border-brand-700 focus:bg-white focus:outline-none rounded-xl text-xs transition"
              >
                <option value="Tunai">Tunai</option>
                <option value="Transfer Bank">Transfer Bank</option>
                <option value="QRIS">QRIS</option>
                <option value="Kredit/Tempo">Kredit/Tempo</option>
              </select>
            </div>

          </div>

          <!-- Lampiran Struk (OCR) -->
          <div class="space-y-1.5">
            <!-- svelte-ignore a11y-label-has-associated-control -->
            <label class="text-xs font-semibold text-warm-750">Lampiran Nota / Struk Belanja (OCR Scanner)</label>
            <div class="relative border-2 border-dashed border-brand-350 hover:border-brand-700 rounded-2xl p-6 bg-brand-50/20 hover:bg-brand-50/50 transition duration-150 flex flex-col items-center justify-center text-center group min-h-36">
              <input 
                type="file" 
                accept="image/*" 
                on:change={handleFileChange} 
                class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isScanning}
              />
              
              {#if isScanning}
                <!-- Animasi Laser Scan OCR -->
                <div class="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-brand-700 to-transparent shadow-lg shadow-brand-700/60 animate-bounce"></div>
                
                <!-- Scanner Status -->
                <div class="flex flex-col items-center space-y-2">
                  <div class="w-10 h-10 border-4 border-brand-300 border-t-brand-700 rounded-full animate-spin"></div>
                  <span class="text-xs font-bold text-warm-850">{ocrStatusText}</span>
                  <p class="text-[10px] text-warm-400">Progres: {scanProgress}%</p>
                </div>
              {:else if selectedFileName}
                <!-- File Loaded -->
                <div class="flex flex-col items-center space-y-1.5 text-xs">
                  <div class="w-10 h-10 bg-emerald-500/10 border border-emerald-400/40 rounded-xl flex items-center justify-center text-emerald-600">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                    </svg>
                  </div>
                  <span class="font-bold text-emerald-700 truncate max-w-xs">{selectedFileName}</span>
                  <p class="text-[10px] text-warm-400">Data struk belanja berhasil dipetakan ke form. Seret berkas baru untuk memindai ulang.</p>
                </div>
              {:else}
                <!-- Upload Hint -->
                <div class="flex flex-col items-center space-y-2">
                  <div class="w-10 h-10 bg-brand-200/50 border border-brand-300/40 rounded-xl flex items-center justify-center text-warm-500 group-hover:scale-110 transition duration-150">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                    </svg>
                  </div>
                  <span class="text-xs font-semibold text-warm-700">Unggah foto struk belanja untuk dipindai otomatis</span>
                  <p class="text-[10px] text-warm-450">Mendukung deteksi otomatis banyak barang sekaligus.</p>
                </div>
              {/if}
            </div>
          </div>

          <!-- Submit Button -->
          <button 
            type="submit" 
            disabled={formLoading || isScanning}
            class="w-full py-4 bg-brand-700 hover:bg-brand-800 disabled:opacity-65 active:scale-[0.99] text-white text-xs font-bold rounded-xl transition duration-150 cursor-pointer shadow-md flex items-center justify-center gap-2"
          >
            {#if formLoading}
              <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Menyimpan Seluruh Pengeluaran...</span>
            {:else}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              <span>Simpan Catatan Pengeluaran ({items.length} Item)</span>
            {/if}
          </button>
        </form>
      </div>

    </div>

    <!-- ─── KOLOM KANAN: SIDEBAR PANEL (1/3 Width on XL, 2-cols on tablet MD) ─ -->
    <!-- On iPad portrait/landscape (>= md and < xl), this grid divides into 2 columns. Column 1 gets Panel 1, Column 2 gets Panel 2 & 3 stacked. -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-6 items-start">
      
      <!-- Panel 1: Sisa Anggaran Real-time (Col 1 on Tablet) -->
      <div class="bg-white/80 backdrop-blur-sm border border-brand-300/60 rounded-3xl p-5 shadow-sm space-y-4">
        <div>
          <h2 class="text-xs font-bold text-warm-900 uppercase tracking-wider flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5 text-brand-700">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.214.074a3 3 0 003.571-1.028A3 3 0 0013.25 12.18l-.213-.074a3 3 0 00-3.571 1.028A3 3 0 0010.75 16.18zM12 3v3m0 12v3" />
            </svg>
            Sisa Anggaran Bulanan
          </h2>
          <p class="text-[10px] text-warm-400 mt-0.5">Kontrol batas budget maksimal bulan berjalan.</p>
        </div>

        <div class="space-y-3.5">
          {#each Object.entries(budgetLimits) as [catName, limit]}
            {@const spent = categoryUsage[catName] || 0}
            {@const draftAmount = draftUsage[catName] || 0}
            {@const simulatedSpent = spent + draftAmount}
            {@const percentage = Math.min((spent / limit) * 100, 100)}
            {@const simulatedPercentage = Math.min((simulatedSpent / limit) * 100, 100)}
            {@const isExceeded = simulatedSpent > limit}

            <!-- Highlight if any draft item belongs to this category -->
            <div class="space-y-1.5 p-2 rounded-xl transition duration-150 {draftAmount > 0 ? 'bg-brand-200/40 border border-brand-300/40' : 'border border-transparent'}">
              <div class="flex items-center justify-between text-xs">
                <span class="font-bold text-warm-700">{catName}</span>
                <span class="font-extrabold text-[10px] uppercase {isExceeded ? 'text-rose-600 animate-pulse' : 'text-warm-550'}">
                  {simulatedPercentage.toFixed(0)}%
                </span>
              </div>

              <!-- Bar Progres -->
              <div class="relative w-full h-2.5 bg-brand-100/80 rounded-full overflow-hidden border border-brand-200/50">
                <!-- Bar Pengeluaran Tersimpan -->
                <div 
                  class="absolute left-0 top-0 h-full rounded-full transition-all duration-300"
                  style="width: {percentage}%; background-color: {getCategoryHex(catName, $categories)}"
                ></div>
                <!-- Bar Simulasi Draft Penambahan -->
                {#if draftAmount > 0}
                  <div 
                    class="absolute top-0 h-full rounded-full bg-rose-400/50 border-r border-dashed border-rose-600 transition-all duration-300"
                    style="left: {percentage}%; width: {simulatedPercentage - percentage}%;"
                  ></div>
                {/if}
              </div>

              <div class="flex items-center justify-between text-[9px] text-warm-400">
                <span>Terpakai: {formatRupiah(simulatedSpent)}</span>
                <span>Limit: {formatRupiah(limit)}</span>
              </div>
              
              {#if isExceeded}
                <div class="flex items-center gap-1 text-[8.5px] text-rose-600 font-bold bg-rose-50/70 p-1.5 rounded-lg border border-rose-100/50 mt-1 animate-fade-in">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-3 h-3 flex-shrink-0">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  <span>Anggaran Kategori ini Terlampaui!</span>
                </div>
              {/if}
            </div>
          {/each}
        </div>
      </div>

      <!-- Wrapper for Column 2 on Tablet (stacks Templates + Log vertically) -->
      <div class="space-y-6">
        
        <!-- Panel 2: Quick Templates -->
        <div class="bg-white/80 backdrop-blur-sm border border-brand-300/60 rounded-3xl p-5 shadow-sm space-y-3">
          <div>
            <h2 class="text-xs font-bold text-warm-900 uppercase tracking-wider flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5 text-brand-700">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 21l8.982-8.995m-8.982 3.899L9 21.002h9m0 0l.024-.035L19.5 16.5m-1.5 1.5l1.5-1.5m-1.5 1.5h.008v.008h-.008v-.008z" />
              </svg>
              Template Cepat
            </h2>
            <p class="text-[10px] text-warm-400 mt-0.5">Isi instan pengeluaran operasional yang sering dilakukan.</p>
          </div>

          <div class="grid grid-cols-1 gap-2">
            {#each templates as tpl}
              <button 
                type="button"
                on:click={() => applyTemplate(tpl)}
                class="text-left w-full p-3 bg-brand-50/40 hover:bg-brand-200/40 border border-brand-200/50 hover:border-brand-400/50 rounded-xl transition duration-100 flex items-center justify-between group active:scale-[0.98] cursor-pointer"
              >
                <div class="min-w-0 pr-2">
                  <span class="text-xs font-bold text-warm-880 group-hover:text-warm-950 block">{tpl.label}</span>
                  <span class="text-[9px] text-warm-400 block truncate">{tpl.desc}</span>
                </div>
                <div class="text-right shrink-0">
                  <span class="text-[10px] font-extrabold text-brand-700 block">{formatRupiah(tpl.amount)}</span>
                  <span class="text-[8px] uppercase font-bold text-warm-400 border border-brand-200 px-1 py-0.2 rounded bg-white">
                    {tpl.category}
                  </span>
                </div>
              </button>
            {/each}
          </div>
        </div>

        <!-- Panel 3: Pengeluaran Hari Ini -->
        <div class="bg-white/80 backdrop-blur-sm border border-brand-300/60 rounded-3xl p-5 shadow-sm space-y-3">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-xs font-bold text-warm-900 uppercase tracking-wider flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5 text-brand-700">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Pengeluaran Hari Ini
              </h2>
              <p class="text-[10px] text-warm-400 mt-0.5">Daftar item belanja tercatat hari ini.</p>
            </div>
            <span class="text-xs font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 border border-rose-100 rounded-lg">{formatRupiah(todayTotalExpense)}</span>
          </div>

          <div class="divide-y divide-brand-200 max-h-56 overflow-y-auto pr-1">
            {#each todayExpenses as tx (tx.id)}
              <div class="py-2.5 flex items-center justify-between group animate-fade-in">
                <div class="min-w-0 pr-3">
                  <span class="text-xs font-semibold text-warm-850 truncate block">{tx.description}</span>
                  <div class="flex items-center gap-1.5 mt-0.5">
                    <span class="text-[8px] font-bold uppercase border px-1 rounded-md {getCategoryStyle(tx.category, $categories)}">
                      {tx.category || 'Lainnya'}
                    </span>
                    <span class="text-[9px] text-warm-400">({tx.payment_method})</span>
                  </div>
                </div>
                <div class="flex items-center gap-2 shrink-0">
                  <span class="text-xs font-bold text-rose-600">-{formatRupiah(tx.amount)}</span>
                  <button 
                    on:click={() => deleteTx(tx.id)}
                    type="button"
                    class="text-warm-300 hover:text-rose-600 p-1.5 rounded hover:bg-rose-50 transition cursor-pointer md:opacity-0 group-hover:opacity-100"
                    title="Hapus"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.34 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
            {:else}
              <div class="py-8 text-center text-[11px] text-warm-400">
                Belum ada pengeluaran dicatat hari ini.
              </div>
            {/each}
          </div>
        </div>

      </div>

    </div>

  </div>
</div>

<script>
  import { onMount } from 'svelte';
  import { addNotification } from '../stores/notificationStore';

  let name = '';
  let address = '';
  let phone = '';
  let taxRate = 0;
  let serviceCharge = 0;

  let loading = true;
  let saving = false;

  onMount(async () => {
    await fetchSettings();
  });

  async function fetchSettings() {
    loading = true;
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        name = data.name || '';
        address = data.address || '';
        phone = data.phone || '';
        taxRate = data.tax_rate || 0;
        serviceCharge = data.service_charge || 0;
      } else {
        addNotification('Gagal memuat pengaturan toko.', 'error');
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      addNotification('Gagal terhubung ke server.', 'error');
    } finally {
      loading = false;
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    if (saving) return;

    if (!name.trim()) {
      addNotification('Nama toko tidak boleh kosong.', 'warning');
      return;
    }

    saving = true;
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          address: address.trim(),
          phone: phone.trim(),
          tax_rate: Number(taxRate) || 0,
          service_charge: Number(serviceCharge) || 0
        })
      });
      const data = await res.json();

      if (res.ok) {
        addNotification('Pengaturan toko berhasil disimpan!', 'success');
        // Refresh local values
        name = data.settings.name;
        address = data.settings.address;
        phone = data.settings.phone;
        taxRate = data.settings.tax_rate;
        serviceCharge = data.settings.service_charge;
      } else {
        addNotification(data.message || 'Gagal menyimpan pengaturan.', 'error');
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      addNotification('Gagal terhubung ke server.', 'error');
    } finally {
      saving = false;
    }
  }
</script>

<div class="space-y-8 animate-fade-in">
  <!-- View Header -->
  <div class="pb-6 border-b border-brand-300/60">
    <h1 class="text-2xl font-bold tracking-tight text-warm-900">Pengaturan Toko & Pajak</h1>
    <p class="text-sm text-warm-500 mt-1">Konfigurasikan profil toko, tarif pajak PPN, dan biaya operasional layanan untuk perhitungan POS.</p>
  </div>

  {#if loading}
    <div class="py-20 flex flex-col items-center justify-center text-warm-400 gap-2">
      <svg class="animate-spin h-6 w-6 text-brand-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span class="text-xs">Memuat pengaturan...</span>
    </div>
  {:else}
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <!-- Form Column -->
      <form on:submit={handleSave} class="lg:col-span-2 bg-white/70 backdrop-blur-sm border border-brand-300/60 rounded-2xl p-6 shadow-sm space-y-6">
        
        <h3 class="text-sm font-semibold text-warm-900 pb-3 border-b border-brand-200/60 flex items-center justify-between">
          <span>Identitas & Profil Toko</span>
          <span class="text-[9px] bg-brand-200 text-warm-700 font-bold px-2 py-0.5 rounded tracking-wide uppercase">Dinamis di Struk</span>
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Store Name -->
          <div class="space-y-1.5 md:col-span-2">
            <label for="store-name" class="text-xs font-semibold text-warm-600">Nama Toko / Bisnis</label>
            <input
              id="store-name"
              type="text"
              placeholder="Contoh: Selerasi Ricebowl"
              bind:value={name}
              required
              class="w-full px-3 py-2 bg-brand-50 border border-brand-300/60 text-warm-900 placeholder-warm-300 focus:border-brand-700 focus:ring-1 focus:ring-brand-600/30 focus:outline-none transition-colors rounded-xl text-sm"
            />
          </div>

          <!-- Store Phone -->
          <div class="space-y-1.5">
            <label for="store-phone" class="text-xs font-semibold text-warm-600">Nomor Telepon Kontak</label>
            <input
              id="store-phone"
              type="text"
              placeholder="Contoh: 0812-3456-7890"
              bind:value={phone}
              class="w-full px-3 py-2 bg-brand-50 border border-brand-300/60 text-warm-900 placeholder-warm-300 focus:border-brand-700 focus:ring-1 focus:ring-brand-600/30 focus:outline-none transition-colors rounded-xl text-sm"
            />
          </div>

          <!-- Store Address -->
          <div class="space-y-1.5 md:col-span-2">
            <label for="store-address" class="text-xs font-semibold text-warm-600">Alamat Toko</label>
            <textarea
              id="store-address"
              placeholder="Jl. Sukarno Hatta No. 45, Bandung"
              bind:value={address}
              rows="3"
              class="w-full px-3 py-2 bg-brand-50 border border-brand-300/60 text-warm-900 placeholder-warm-300 focus:border-brand-700 focus:ring-1 focus:ring-brand-600/30 focus:outline-none transition-colors rounded-xl text-sm resize-none"
            ></textarea>
          </div>
        </div>

        <h3 class="text-sm font-semibold text-warm-900 pb-3 border-b border-brand-200/60 pt-4 flex items-center justify-between">
          <span>Perhitungan Kasir & POS</span>
          <span class="text-[9px] bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded tracking-wide uppercase">Pajak & Servis</span>
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Tax Rate -->
          <div class="space-y-2">
            <div class="flex justify-between items-center">
              <label for="store-tax" class="text-xs font-semibold text-warm-600">Pajak PPN (%)</label>
              <span class="text-[10px] text-warm-400">Default: 10%</span>
            </div>
            <div class="relative">
              <input
                id="store-tax"
                type="number"
                min="0"
                max="100"
                step="0.1"
                placeholder="0"
                bind:value={taxRate}
                class="w-full pl-3 pr-8 py-2 bg-brand-50 border border-brand-300/60 text-warm-900 focus:border-brand-700 focus:outline-none rounded-xl text-sm font-bold"
              />
              <span class="absolute right-3 top-2.5 text-xs text-warm-400 font-bold">%</span>
            </div>
            <p class="text-[10px] text-warm-400 leading-normal">PPN hanya akan diterapkan pada transaksi dengan metode pembayaran <strong>Aplikasi Online</strong> (Online Shop).</p>
          </div>

          <!-- Service Charge -->
          <div class="space-y-2">
            <div class="flex justify-between items-center">
              <label for="store-service" class="text-xs font-semibold text-warm-600">Biaya Layanan (Service Charge) (%)</label>
              <span class="text-[10px] text-warm-400">Default: 5%</span>
            </div>
            <div class="relative">
              <input
                id="store-service"
                type="number"
                min="0"
                max="100"
                step="0.1"
                placeholder="0"
                bind:value={serviceCharge}
                class="w-full pl-3 pr-8 py-2 bg-brand-50 border border-brand-300/60 text-warm-900 focus:border-brand-700 focus:outline-none rounded-xl text-sm font-bold"
              />
              <span class="absolute right-3 top-2.5 text-xs text-warm-400 font-bold">%</span>
            </div>
            <p class="text-[10px] text-warm-400 leading-normal">Biaya operasional pelayanan / dine-in charge tambahan.</p>
          </div>
        </div>

        <!-- Submit Buttons -->
        <div class="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            class="px-6 py-2.5 bg-brand-700 hover:bg-brand-800 disabled:bg-brand-400 active:scale-[0.99] text-brand-50 text-xs font-bold rounded-xl transition-all duration-150 cursor-pointer shadow-md flex items-center gap-2"
          >
            {#if saving}
              <svg class="animate-spin h-4 w-4 text-brand-50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Menyimpan...
            {:else}
              Simpan Pengaturan
            {/if}
          </button>
        </div>

      </form>

      <!-- Sidebar Info Column -->
      <div class="bg-brand-50/50 border border-brand-300/60 rounded-2xl p-6 space-y-4">
        <h4 class="text-xs font-bold text-warm-800 uppercase tracking-wider">Bagaimana data ini bekerja?</h4>
        
        <div class="space-y-3.5 text-xs text-warm-600 leading-relaxed">
          <div class="flex items-start gap-2.5">
            <span class="w-5 h-5 rounded-full bg-brand-200 border border-brand-300 flex items-center justify-center font-bold text-[10px] text-brand-850 shrink-0">1</span>
            <p><strong>Cetak Struk</strong>: Nama toko, alamat, dan nomor telepon yang diatur di sini akan otomatis dicetak pada header struk kasir.</p>
          </div>
          
          <div class="flex items-start gap-2.5">
            <span class="w-5 h-5 rounded-full bg-brand-200 border border-brand-300 flex items-center justify-center font-bold text-[10px] text-brand-850 shrink-0">2</span>
            <p><strong>Akumulasi POS</strong>: Pajak PPN hanya diterapkan untuk transaksi <strong>Aplikasi Online</strong>, sedangkan metode pembayaran lainnya dibebaskan dari pajak.</p>
          </div>

          <div class="flex items-start gap-2.5">
            <span class="w-5 h-5 rounded-full bg-brand-200 border border-brand-300 flex items-center justify-center font-bold text-[10px] text-brand-850 shrink-0">3</span>
            <p><strong>Real-time</strong>: Setiap perubahan akan langsung aktif seketika pada halaman kasir POS tanpa perlu melakukan reload halaman.</p>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

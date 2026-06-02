<script>
  import { onMount } from 'svelte';
  import { fade, scale } from 'svelte/transition';
  import { transactions, addTransactionApi } from '../stores/expenseStore';
  import { products, fetchProducts } from '../stores/productStore';
  import { addNotification } from '../stores/notificationStore';

  // State
  let cart = [];
  let paymentMethod = 'QRIS';
  let date = new Date().toISOString().split('T')[0];
  let processing = false;

  // Search filter for products
  let searchQuery = '';

  // State for Checkout Details
  let showCheckoutDetails = false;
  let customerList = [{ name: '', paymentMethod: 'QRIS', items: {} }];

  // State for Invoice Success Modal
  let showSuccessModal = false;
  let checkoutSummary = { date: '', paymentMethod: '', invoices: [] };
  let storeSettings = { name: '', address: '', phone: '', tax_rate: 0, service_charge: 0 };

  async function fetchStoreSettings() {
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        storeSettings = await res.json();
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  }

  // Reactive Store Values
  $: activeProducts = $products.filter(p => p.status === 'Tersedia');

  onMount(() => {
    fetchProducts();
    fetchStoreSettings();
  });

  function openCheckoutModal(e) {
    e.preventDefault();
    if (cart.length === 0) {
      alert('Keranjang belanja masih kosong.');
      return;
    }
    // Initialize customer list with one customer paying for everything in the cart
    const initialItems = {};
    cart.forEach(item => {
      initialItems[item.id] = item.quantity;
    });
    customerList = [{ name: '', paymentMethod: paymentMethod, items: initialItems }];
    showCheckoutDetails = true;
  }

  function addCustomer() {
    const emptyItems = {};
    cart.forEach(item => {
      emptyItems[item.id] = 0;
    });
    customerList = [...customerList, { name: '', paymentMethod: paymentMethod, items: emptyItems }];
  }

  function removeCustomer(index) {
    if (customerList.length > 1) {
      customerList = customerList.filter((_, i) => i !== index);
    }
  }

  function updateCustomerItemQty(custIndex, itemId, amount) {
    const current = customerList[custIndex].items[itemId] || 0;
    const newVal = current + amount;
    if (newVal >= 0) {
      const cartItem = cart.find(item => item.id === itemId);
      const cartMax = cartItem ? cartItem.quantity : 0;
      
      // Calculate total allocated for this item by other customers
      const allocatedByOthers = customerList.reduce((sum, cust, idx) => {
        if (idx === custIndex) return sum;
        return sum + (cust.items[itemId] || 0);
      }, 0);
      
      if (newVal + allocatedByOthers <= cartMax) {
        customerList[custIndex].items[itemId] = newVal;
        customerList = [...customerList];
      }
    }
  }

  // Reactive state for menu item allocations
  $: allocatedSums = (() => {
    const sums = {};
    cart.forEach(item => {
      sums[item.id] = customerList.reduce((sum, cust) => sum + (cust.items[item.id] || 0), 0);
    });
    return sums;
  })();

  $: isAllocationValid = (() => {
    if (cart.length === 0) return false;
    return cart.every(item => allocatedSums[item.id] === item.quantity);
  })();

  // Filtered products list based on search query
  $: filteredProducts = activeProducts.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Helper to format Rupiah
  function formatRupiah(value) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  // Cart Management
  function addToCart(product) {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      cart = cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      cart = [...cart, { ...product, quantity: 1 }];
    }
  }

  function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
  }

  function updateQuantity(productId, amount) {
    cart = cart.map(item => {
      if (item.id === productId) {
        const newQty = item.quantity + amount;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    });
  }

  // Calculate cart total
  $: cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  $: totalPortions = cart.reduce((sum, item) => sum + item.quantity, 0);
  $: taxAmount = paymentMethod === 'Aplikasi Online' 
    ? Math.round((cartTotal * (storeSettings.tax_rate || 0)) / 100) 
    : 0;
  $: grandTotal = cartTotal + taxAmount;

  // Process transaction submission
  async function handleCheckout(e) {
    e.preventDefault();

    if (cart.length === 0) {
      alert('Keranjang belanja masih kosong.');
      return;
    }

    if (!isAllocationValid) {
      alert('Semua menu dalam keranjang harus dialokasikan sepenuhnya ke pelanggan.');
      return;
    }

    processing = true;
    try {
      const invoices = [];
      const nowTimestamp = Date.now();

      for (let i = 0; i < customerList.length; i++) {
        const customer = customerList[i];
        const custName = customer.name.trim() || `Pelanggan ${i + 1}`;
        const custPaymentMethod = customer.paymentMethod || paymentMethod;
        const txIdPrefix = `${nowTimestamp}_c${i}`;

        const itemsForInvoice = [];
        let custTotal = 0;
        let g = 0;

        for (const cartItem of cart) {
          const qtyAllocated = customer.items[cartItem.id] || 0;
          if (qtyAllocated > 0) {
            const itemSubtotal = cartItem.price * qtyAllocated;
            custTotal += itemSubtotal;

            itemsForInvoice.push({
              name: cartItem.name,
              price: cartItem.price,
              qty: qtyAllocated,
              subtotal: itemSubtotal
            });

            // Save transaction records for this product group of this customer
            const newTx = {
              id: `${txIdPrefix}_g${g}`,
              description: `${cartItem.name} (${custName})`,
              amount: itemSubtotal,
              type: 'income',
              category: 'Penjualan Ricebowl', // Hardcoded as category is no longer used in UI
              date,
              quantity: Number(qtyAllocated),
              payment_method: custPaymentMethod
            };
            await addTransactionApi(newTx);
            g++;
          }
        }

        // Hitung PPN hanya untuk penjualan Aplikasi Online (Online Shop)
        let custTax = 0;
        if (custPaymentMethod === 'Aplikasi Online' && storeSettings.tax_rate > 0) {
          custTax = Math.round((custTotal * storeSettings.tax_rate) / 100);
        }

        // Rekam transaksi pajak jika ada
        if (custTax > 0) {
          const taxTx = {
            id: `${txIdPrefix}_tax`,
            description: `Pajak PPN Online Shop (${custName})`,
            amount: custTax,
            type: 'income',
            category: 'Pajak PPN',
            date,
            quantity: 1,
            payment_method: custPaymentMethod
          };
          await addTransactionApi(taxTx);
        }

        if (itemsForInvoice.length > 0) {
          invoices.push({
            txId: txIdPrefix.substring(txIdPrefix.length - 8),
            customerName: custName,
            items: itemsForInvoice,
            subtotal: custTotal,
            tax: custTax,
            total: custTotal + custTax,
            paymentMethod: custPaymentMethod
          });
        }
      }

      // Set checkoutSummary for invoice printing
      checkoutSummary = {
        date,
        paymentMethod,
        invoices
      };

      // Reset cart and detail view
      cart = [];
      customerList = [{ name: '', paymentMethod: paymentMethod, items: {} }];
      showCheckoutDetails = false;
      showSuccessModal = true;
      addNotification('Transaksi berhasil disimpan dan dibukukan!', 'success');
    } catch (err) {
      addNotification('Gagal memproses transaksi: ' + err.message, 'error');
    } finally {
      processing = false;
    }
  }

  function cancelCheckout() {
    cart = [];
    customerList = [{ name: '', paymentMethod: paymentMethod, items: {} }];
    showCheckoutDetails = false;
  }

  function printInvoice(invoice) {
    const printWindow = window.open('', '_blank', 'width=320,height=600');
    if (!printWindow) {
      alert('Popup diblokir! Harap izinkan popup di browser Anda untuk mencetak invoice.');
      return;
    }
    
    const itemsHtml = invoice.items.map(item => `
      <tr>
        <td style="padding: 2.5px 0;">${item.name} (${item.qty} porsi)</td>
        <td style="padding: 2.5px 0; text-align: right;">${formatRupiah(item.subtotal)}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${invoice.customerName}</title>
          <style>
            @page { size: auto; margin: 0mm; }
            body {
              font-family: 'Courier New', Courier, monospace;
              font-size: 11px;
              line-height: 1.3;
              margin: 8px;
              color: #000;
            }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .bold { font-weight: bold; }
            .divider { border-top: 1px dashed #000; margin: 6px 0; }
            @import url('https://fonts.googleapis.com/css2?family=Alex+Brush&display=swap');
            .header { margin-bottom: 10px; }
            .header p { margin: 2px 0; font-size: 9px; }
            .info-table, .items-table { width: 100%; border-collapse: collapse; }
            .info-table td { padding: 1px 0; }
            .totals { margin-top: 6px; font-size: 11px; }
            .footer { margin-top: 15px; font-size: 9px; }
          </style>
        </head>
        <body>
          <div class="header text-center">
            <div style="display: inline-flex; align-items: center; justify-content: center; margin-bottom: 4px; border: none;">
              <svg viewBox="0 0 100 100" style="width: 30px; height: 30px; margin-right: -4px; flex-shrink: 0;" fill="none" stroke="#000" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
                <path d="M 85,25 C 75,18 55,18 42,24 C 26,30 22,48 29,62 C 34,71 44,79 47,82 C 51,86 33,88 32,82 C 31,76 43,76 49,83" />
              </svg>
              <span style="font-family: 'Alex Brush', cursive; font-size: 27px; font-weight: normal; margin-top: 5px; letter-spacing: 0.5px; color: #000; line-height: 1;">elerasi</span>
            </div>
            <p>Rasa Autentik, Harga Bersahabat</p>
            <p>Tgl: ${checkoutSummary.date} | ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          <div class="divider"></div>
          <table class="info-table">
            <tr>
              <td>No. Transaksi:</td>
              <td class="text-right">${invoice.txId}</td>
            </tr>
            <tr>
              <td>Pelanggan:</td>
              <td class="text-right bold">${invoice.customerName}</td>
            </tr>
            <tr>
              <td>Pembayaran:</td>
              <td class="text-right">${invoice.paymentMethod}</td>
            </tr>
          </table>
          <div class="divider"></div>
          <table class="items-table">
            <thead>
              <tr class="bold" style="border-bottom: 1px dashed #000;">
                <td style="padding-bottom: 4px;">Item (Porsi)</td>
                <td style="padding-bottom: 4px; text-align: right;">Total</td>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          <div class="divider"></div>
          <table class="info-table totals">
            ${invoice.tax > 0 ? `
            <tr>
              <td>Subtotal:</td>
              <td class="text-right">${formatRupiah(invoice.subtotal)}</td>
            </tr>
            <tr>
              <td>PPN (${storeSettings.tax_rate}%):</td>
              <td class="text-right">${formatRupiah(invoice.tax)}</td>
            </tr>
            ` : ''}
            <tr class="bold">
              <td>GRAND TOTAL:</td>
              <td class="text-right">${formatRupiah(invoice.total)}</td>
            </tr>
          </table>
          <div class="divider"></div>
          <div class="footer text-center">
            <p>Terma kasih atas pesanan Anda!</p>
            <p>Silakan berkunjung kembali</p>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          <\/script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  function printCombinedInvoice() {
    const printWindow = window.open('', '_blank', 'width=320,height=600');
    if (!printWindow) {
      alert('Popup diblokir! Harap izinkan popup di browser Anda untuk mencetak invoice.');
      return;
    }

    const grandTotal = checkoutSummary.invoices.reduce((sum, inv) => sum + inv.total, 0);

    const customersHtml = checkoutSummary.invoices.map((invoice, idx) => {
      const itemsHtml = invoice.items.map(item => `
        <tr>
          <td style="padding: 2.5px 0;">${item.name} (${item.qty} porsi)</td>
          <td style="padding: 2.5px 0; text-align: right;">${formatRupiah(item.subtotal)}</td>
        </tr>
      `).join('');

      return `
        <div style="margin-bottom: 12px;">
          <div style="font-weight: bold; text-transform: uppercase; font-size: 10px; font-family: monospace;">Pelanggan: ${invoice.customerName} (${invoice.paymentMethod})</div>
          <table style="width: 100%; border-collapse: collapse; margin-top: 4px; font-family: monospace; font-size: 10px;">
            <tbody>
              ${itemsHtml}
              <tr style="border-top: 1px dotted #000; font-weight: bold;">
                <td style="padding: 4px 0;">Subtotal:</td>
                <td style="padding: 4px 0; text-align: right;">${formatRupiah(invoice.subtotal)}</td>
              </tr>
              ${invoice.tax > 0 ? `
              <tr style="font-weight: bold;">
                <td style="padding: 2px 0;">PPN (${storeSettings.tax_rate}%):</td>
                <td style="padding: 2px 0; text-align: right;">${formatRupiah(invoice.tax)}</td>
              </tr>
              ` : ''}
              <tr style="font-weight: bold;">
                <td style="padding: 4px 0;">Total Pelanggan:</td>
                <td style="padding: 4px 0; text-align: right;">${formatRupiah(invoice.total)}</td>
              </tr>
            </tbody>
          </table>
          ${idx < checkoutSummary.invoices.length - 1 ? '<div class="divider"></div>' : ''}
        </div>
      `;
    }).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice Gabungan</title>
          <style>
            @page { size: auto; margin: 0mm; }
            body {
              font-family: 'Courier New', Courier, monospace;
              font-size: 11px;
              line-height: 1.3;
              margin: 8px;
              color: #000;
            }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .bold { font-weight: bold; }
            .divider { border-top: 1px dashed #000; margin: 6px 0; }
            @import url('https://fonts.googleapis.com/css2?family=Alex+Brush&display=swap');
            .header { margin-bottom: 10px; }
            .header p { margin: 2px 0; font-size: 9px; }
            .info-table { width: 100%; border-collapse: collapse; font-size: 10px; }
            .info-table td { padding: 1px 0; }
            .totals { margin-top: 10px; font-size: 12px; }
            .footer { margin-top: 15px; font-size: 9px; }
          </style>
        </head>
        <body>
          <div class="header text-center">
            <div style="display: inline-flex; align-items: center; justify-content: center; margin-bottom: 4px; border: none;">
              <svg viewBox="0 0 100 100" style="width: 30px; height: 30px; margin-right: -4px; flex-shrink: 0;" fill="none" stroke="#000" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
                <path d="M 85,25 C 75,18 55,18 42,24 C 26,30 22,48 29,62 C 34,71 44,79 47,82 C 51,86 33,88 32,82 C 31,76 43,76 49,83" />
              </svg>
              <span style="font-family: 'Alex Brush', cursive; font-size: 27px; font-weight: normal; margin-top: 5px; letter-spacing: 0.5px; color: #000; line-height: 1;">elerasi</span>
            </div>
            <p>Rasa Autentik, Harga Bersahabat</p>
            <p>Tgl: ${checkoutSummary.date} | ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          <div class="divider"></div>
          
          <table class="info-table">
            <tr>
              <td>No. Transaksi:</td>
              <td class="text-right">${checkoutSummary.invoices[0]?.txId || ''}</td>
            </tr>
            <tr>
              <td>Pembayaran:</td>
              <td class="text-right">Split / Campuran</td>
            </tr>
          </table>
          <div class="divider"></div>
          
          ${customersHtml}
          
          <div class="divider" style="border-top: 2px solid #000;"></div>
          
          <table style="width: 100%; border-collapse: collapse;" class="totals">
            <tr class="bold">
              <td>TOTAL BELANJA:</td>
              <td class="text-right">${formatRupiah(grandTotal)}</td>
            </tr>
          </table>
          
          <div class="divider"></div>
          <div class="footer text-center">
            <p>Terima kasih atas pesanan Anda!</p>
            <p>Silakan berkunjung kembali</p>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          <\/script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  function getAvatarGradient(index) {
    const gradients = [
      'from-brand-650 to-teal-700 text-brand-100',
      'from-blue-650 to-indigo-700 text-blue-100',
      'from-amber-600 to-orange-700 text-amber-100',
      'from-violet-650 to-purple-700 text-violet-100',
      'from-rose-650 to-pink-700 text-rose-100',
      'from-cyan-600 to-teal-700 text-cyan-100'
    ];
    return gradients[index % gradients.length];
  }
</script>

<div class="space-y-6">
  <!-- POS Header -->
  <div class="pb-6 border-b border-brand-300/60">
    <h1 class="text-2xl font-bold tracking-tight text-warm-900">Mesin Kasir (POS)</h1>
    <p class="text-sm text-warm-500 mt-1">Kelola transaksi pesanan Ricebowl secara real-time dan terintegrasi otomatis.</p>
  </div>

  <!-- POS Main Layout Grid -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start">
    
    <!-- LEFT SIDE: Product Selection / Checkout Details -->
    <div class="md:col-span-2 space-y-4">
      {#if !showCheckoutDetails}
        <!-- Search Input -->
        <div class="relative">
          <span class="absolute left-3 top-2.5 text-warm-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.637 10.637Z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Cari menu Ricebowl..."
            bind:value={searchQuery}
            class="w-full pl-9 pr-4 py-2 bg-white/70 border border-brand-300/60 text-warm-900 placeholder-warm-300 focus:border-brand-600 focus:ring-1 focus:ring-brand-500/30 focus:outline-none transition-colors rounded-xl text-sm backdrop-blur-sm"
          />
        </div>

        <!-- Products Grid -->
        {#if filteredProducts.length === 0}
          <div class="bg-white/50 border border-brand-300/50 rounded-2xl py-24 text-center px-4">
            <div class="w-12 h-12 border-2 border-dashed border-brand-300 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-warm-400">
                <path stroke-linecap="round" stroke-linejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0-3-3m3 3 3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
              </svg>
            </div>
            <h3 class="text-sm font-medium text-warm-700">Menu tidak ditemukan</h3>
            <p class="text-xs text-warm-400 mt-1">Coba gunakan kata kunci pencarian lain atau tambahkan menu baru di tab Menu Produk.</p>
          </div>
        {:else}
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {#each filteredProducts as product, index (product.id)}
              <!-- svelte-ignore a11y-click-events-have-key-events -->
              <!-- svelte-ignore a11y-no-static-element-interactions -->
              <div 
                on:click={() => addToCart(product)}
                class="bg-white/70 border border-brand-300/60 hover:border-brand-500 hover:bg-brand-50/60 rounded-2xl p-4 flex flex-col justify-between transition-all duration-200 cursor-pointer group active:scale-[0.98] shadow-sm select-none backdrop-blur-sm"
              >
                <div class="flex items-start space-x-3 mb-4">
                  <div class="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs bg-gradient-to-br {getAvatarGradient(index)} shadow">
                    {product.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()}
                  </div>
                  <div class="min-w-0">
                    <h3 class="text-xs font-bold text-warm-900 group-hover:text-brand-800 transition-colors truncate">{product.name}</h3>
                  </div>
                </div>
                <div class="flex items-center justify-between mt-auto border-t border-brand-200/60 pt-3">
                  <span class="text-xs font-bold text-brand-800">{formatRupiah(product.price)}</span>
                  <button 
                    type="button"
                    class="px-2.5 py-1 bg-brand-100 border border-brand-300 hover:bg-brand-500 hover:text-warm-900 group-hover:border-brand-500 group-hover:bg-brand-200 rounded-lg text-[10px] font-bold text-warm-700 transition duration-150 cursor-pointer"
                  >
                    + Tambah
                  </button>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      {:else}
        <!-- Checkout / Allocation Details Panel -->
        <div class="bg-white/80 backdrop-blur-sm border border-brand-300/60 rounded-3xl p-6 space-y-6 shadow-md" transition:fade={{ duration: 150 }}>
          <!-- Header with Back to Products button -->
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-brand-200/60 gap-4">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center text-brand-850 shrink-0 shadow-sm border border-brand-250">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                </svg>
              </div>
              <div>
                <h3 class="text-sm font-extrabold text-warm-900 leading-tight">Detail Pemesan & Porsi</h3>
                <p class="text-[11px] text-warm-500 mt-0.5">Alokasikan total <span class="font-bold text-brand-800">{totalPortions} porsi</span> ke pelanggan.</p>
              </div>
            </div>
            
            <button
              type="button"
              on:click={() => showCheckoutDetails = false}
              class="flex items-center justify-center space-x-1.5 px-3.5 py-1.5 bg-brand-100 hover:bg-brand-200 border border-brand-300 text-brand-850 hover:text-brand-950 rounded-xl text-xs font-bold transition duration-150 cursor-pointer shadow-2xs active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-3.5 h-3.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
              <span>Pilih Menu Lagi</span>
            </button>
          </div>

          <div class="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
            {#each customerList as customer, i (i)}
              <div class="bg-brand-50/40 border border-brand-200/80 rounded-2xl p-4 flex flex-col gap-4 shadow-xs transition-all hover:bg-brand-50/70 hover:border-brand-300/80 animate-fade-in">
                <div class="flex items-center gap-2.5">
                  <div class="w-6 h-6 rounded-full bg-brand-200 flex items-center justify-center font-extrabold text-[10px] text-brand-900 shrink-0">
                    {i + 1}
                  </div>
                  <div class="flex-grow min-w-0">
                    <input
                      type="text"
                      placeholder="Nama Pelanggan"
                      bind:value={customer.name}
                      class="w-full px-3 py-1.5 bg-white border border-brand-300/50 text-warm-900 placeholder-warm-400 focus:border-brand-700 focus:ring-1 focus:ring-brand-500/20 focus:outline-none rounded-xl text-xs transition-colors shadow-2xs font-semibold"
                    />
                  </div>
                  <div class="shrink-0 select-none">
                    <select
                      bind:value={customer.paymentMethod}
                      class="px-2 py-1.5 bg-white border border-brand-300/50 text-warm-900 focus:border-brand-700 focus:outline-none rounded-xl text-[10px] font-bold shadow-2xs cursor-pointer focus:ring-1 focus:ring-brand-500/20"
                    >
                      <option value="QRIS">QRIS</option>
                      <option value="Tunai">Tunai</option>
                      <option value="Transfer Bank">Tf Bank</option>
                      <option value="Aplikasi Online">Online</option>
                    </select>
                  </div>
                  {#if customerList.length > 1}
                    <button
                      type="button"
                      on:click={() => removeCustomer(i)}
                      class="p-1.5 text-warm-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-xl transition-all cursor-pointer shrink-0 active:scale-95"
                      title="Hapus Pelanggan"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>
                    </button>
                  {/if}
                </div>

                <div class="border-t border-brand-200/50 pt-3 space-y-2">
                  <span class="text-[9px] font-bold uppercase tracking-wider text-warm-400 block mb-1">Alokasi Item Belanja</span>
                  {#each cart as item}
                    <div class="flex items-center justify-between text-xs py-1">
                      <div class="min-w-0 flex-grow pr-2">
                        <span class="font-bold text-warm-800 truncate block">{item.name}</span>
                        <span class="text-[9px] text-warm-400">Keranjang: {item.quantity} porsi</span>
                      </div>
                      <div class="flex items-center bg-white border border-brand-300/50 rounded-xl p-1 shadow-2xs shrink-0 select-none">
                        <button
                          type="button"
                          on:click={() => updateCustomerItemQty(i, item.id, -1)}
                          class="w-9 h-9 flex items-center justify-center text-sm font-bold text-warm-600 hover:text-warm-900 hover:bg-brand-100 rounded-lg cursor-pointer transition active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed"
                          disabled={(customer.items[item.id] || 0) <= 0}
                        >
                          -
                        </button>
                        <span class="w-8 text-center font-extrabold text-sm text-warm-850">
                          {customer.items[item.id] || 0}
                        </span>
                        <button
                          type="button"
                          on:click={() => updateCustomerItemQty(i, item.id, 1)}
                          class="w-9 h-9 flex items-center justify-center text-sm font-bold text-warm-600 hover:text-warm-900 hover:bg-brand-100 rounded-lg cursor-pointer transition active:scale-90"
                          disabled={allocatedSums[item.id] >= item.quantity}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  {/each}
                </div>
              </div>
            {/each}
          </div>

          <button
            type="button"
            on:click={addCustomer}
            class="w-full flex items-center justify-center space-x-1.5 py-2.5 bg-brand-100 hover:bg-brand-200/80 border border-brand-350 text-warm-850 hover:text-warm-950 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span>Tambah Pelanggan Baru</span>
          </button>

          <div class="p-4 bg-brand-50/70 border border-brand-300/70 rounded-2xl space-y-3 text-xs shadow-2xs shrink-0">
            <span class="text-[10px] font-bold uppercase tracking-wider text-warm-500 block mb-1">Status Alokasi Item</span>
            {#each cart as item}
              <div class="space-y-1.5">
                <div class="flex justify-between items-center text-[11px]">
                  <span class="font-semibold text-warm-700 truncate pr-2">{item.name}</span>
                  <span class="font-bold {allocatedSums[item.id] === item.quantity ? 'text-emerald-700' : 'text-brand-850'}">
                    {allocatedSums[item.id] || 0} / {item.quantity} porsi
                  </span>
                </div>
                <div class="w-full bg-warm-200 h-1.5 rounded-full overflow-hidden">
                  <div 
                    class="h-full transition-all duration-300 rounded-full {allocatedSums[item.id] === item.quantity ? 'bg-emerald-600' : 'bg-brand-700'}"
                    style="width: {Math.min(100, (((allocatedSums[item.id] || 0) / item.quantity) * 100))}%"
                  ></div>
                </div>
              </div>
            {/each}

            {#if !isAllocationValid}
              <div class="text-[10px] text-rose-600 font-bold mt-1 flex items-center gap-1.5 bg-rose-50 border border-rose-100 p-2.5 rounded-xl leading-relaxed">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4 shrink-0">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                </svg>
                <span>Harap sesuaikan alokasi semua menu di atas agar cocok dengan total pesanan.</span>
              </div>
            {:else}
              <div class="text-[10px] text-emerald-700 font-bold mt-1 flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl leading-relaxed">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4 shrink-0">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                <span>Semua menu telah dialokasikan dengan cocok! Siap checkout.</span>
              </div>
            {/if}
          </div>
        </div>
      {/if}
    </div>

    <!-- RIGHT SIDE: Cart Panel -->
    <div class="md:col-span-1">
      <form on:submit={handleCheckout} class="bg-white/80 backdrop-blur-sm border border-brand-300/60 rounded-2xl p-5 shadow-md space-y-5 sticky top-24">
        <h2 class="text-sm font-bold tracking-tight text-warm-900 pb-3 border-b border-brand-200/60 mb-2">
          Detail Transaksi Kasir
        </h2>

        <div class="space-y-3">
          <span class="text-[10px] font-bold uppercase tracking-wider text-warm-500 block">Daftar Belanja ({cart.length} Item)</span>
          
          {#if cart.length === 0}
            <div class="py-10 border border-dashed border-brand-300/60 rounded-xl flex flex-col items-center justify-center text-center px-4 bg-brand-50/50">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-warm-300 mb-2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
              <p class="text-xs text-warm-400 font-medium">Kasir masih kosong</p>
              <p class="text-[9px] text-warm-300 mt-0.5">Klik menu makanan di sebelah kiri untuk menambah ke keranjang belanja.</p>
            </div>
          {:else}
            <div class="divide-y divide-brand-200/60 max-h-56 overflow-y-auto pr-1">
              {#each cart as item (item.id)}
                <div class="py-2.5 flex items-center justify-between group">
                  <div class="min-w-0 pr-2 flex-grow">
                    <div class="text-xs font-bold text-warm-800 truncate">{item.name}</div>
                    <div class="text-[10px] text-brand-700 font-semibold mt-0.5">{formatRupiah(item.price)}</div>
                  </div>
                  
                  <div class="flex items-center space-x-3">
                    <div class="flex items-center bg-brand-100 border border-brand-300/60 rounded-xl p-1">
                      <button
                        type="button"
                        on:click={() => updateQuantity(item.id, -1)}
                        class="w-9 h-9 flex items-center justify-center text-sm font-bold text-warm-600 hover:text-warm-900 hover:bg-brand-200 rounded-lg cursor-pointer transition active:scale-90"
                      >
                        -
                      </button>
                      <span class="text-sm font-extrabold text-warm-850 w-8 text-center select-none">{item.quantity}</span>
                      <button
                        type="button"
                        on:click={() => updateQuantity(item.id, 1)}
                        class="w-9 h-9 flex items-center justify-center text-sm font-bold text-warm-600 hover:text-warm-900 hover:bg-brand-200 rounded-lg cursor-pointer transition active:scale-90"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      on:click={() => removeFromCart(item.id)}
                      aria-label="Hapus dari keranjang"
                      title="Hapus dari keranjang"
                      class="text-warm-400 hover:text-rose-500 p-1 rounded-md transition duration-150 cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m6 18 12-12M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>

        <div class="space-y-3.5 pt-3 border-t border-brand-200/60">
          <span class="text-[10px] font-bold uppercase tracking-wider text-warm-500 block">Setelan Transaksi</span>

          <div class="space-y-1.5">
            <label for="pos-pay" class="text-[10px] font-semibold text-warm-500 uppercase tracking-wide">Metode Pembayaran</label>
            <select
              id="pos-pay"
              bind:value={paymentMethod}
              required
              class="w-full px-3 py-1.5 bg-brand-50 border border-brand-300/60 text-warm-900 focus:border-brand-700 focus:ring-1 focus:outline-none rounded-xl text-xs"
            >
              <option value="QRIS">QRIS</option>
              <option value="Tunai">Tunai</option>
              <option value="Transfer Bank">Transfer Bank</option>
              <option value="Aplikasi Online">Aplikasi Online</option>
            </select>
          </div>

          <div class="space-y-1.5">
            <label for="pos-date" class="text-[10px] font-semibold text-warm-500 uppercase tracking-wide">Tanggal Pembukuan</label>
            <input
              id="pos-date"
              type="date"
              bind:value={date}
              required
              class="w-full px-3 py-1.5 bg-brand-50 border border-brand-300/60 text-warm-900 focus:border-brand-700 focus:ring-1 focus:outline-none rounded-xl text-xs"
            />
          </div>
        </div>

        <div class="p-3 bg-brand-100/80 border border-brand-300/60 rounded-xl space-y-2 mt-4">
          <div class="flex items-center justify-between text-xs text-warm-500">
            <span>Total Kuantitas</span>
            <span class="font-bold text-warm-800">
              {totalPortions} porsi
            </span>
          </div>
          
          {#if paymentMethod === 'Aplikasi Online' && storeSettings.tax_rate > 0}
            <div class="flex items-center justify-between text-xs text-warm-500 pt-1">
              <span>Subtotal</span>
              <span class="font-semibold text-warm-800">
                {formatRupiah(cartTotal)}
              </span>
            </div>
            <div class="flex items-center justify-between text-xs text-warm-500 pb-1">
              <span>Pajak PPN ({storeSettings.tax_rate}%)</span>
              <span class="font-semibold text-warm-800">
                {formatRupiah(taxAmount)}
              </span>
            </div>
          {/if}

          <div class="flex items-center justify-between pt-2 border-t border-brand-200/60">
            <span class="text-xs font-bold text-warm-800">Total Tagihan</span>
            <span class="text-base font-extrabold text-brand-800">
              {formatRupiah(grandTotal)}
            </span>
          </div>
        </div>

        {#if !showCheckoutDetails}
          <button
            type="button"
            on:click={openCheckoutModal}
            disabled={processing || cart.length === 0}
            class="w-full py-2.5 bg-brand-700 hover:bg-brand-800 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-brand-50 text-xs font-bold rounded-xl transition-all duration-150 cursor-pointer shadow-md"
          >
            Proses
          </button>
        {:else}
          <div class="flex gap-3 pt-1">
            <button
              type="button"
              on:click={cancelCheckout}
              class="flex-1 py-2.5 bg-warm-50 hover:bg-warm-150 border border-brand-300 text-warm-750 text-xs font-bold rounded-xl transition active:scale-[0.98] text-center cursor-pointer font-bold"
            >
              Batal
            </button>
            <button
              type="button"
              on:click={handleCheckout}
              disabled={processing || !isAllocationValid}
              class="flex-2 py-2.5 bg-brand-700 hover:bg-brand-800 disabled:opacity-50 disabled:cursor-not-allowed text-brand-50 text-xs font-bold rounded-xl transition shadow-md active:scale-[0.98] text-center cursor-pointer font-bold"
            >
              {processing ? 'Menyimpan...' : 'Simpan & Checkout'}
            </button>
          </div>
        {/if}
      </form>
    </div>

  </div>
</div>



{#if showSuccessModal}
  <div 
    transition:fade={{ duration: 150 }} 
    class="fixed inset-0 bg-white/10 backdrop-blur-md z-50 flex items-center justify-center p-4"
  >
    <div 
      transition:scale={{ duration: 150, start: 0.96 }}
      class="bg-white border border-brand-300/80 rounded-3xl max-w-md w-full shadow-2xl p-6 space-y-5 flex flex-col max-h-[90vh]"
    >
      <div class="text-center pb-4 border-b border-brand-200/60 shrink-0">
        <div class="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mx-auto mb-3 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </div>
        <h3 class="text-base font-extrabold text-warm-900 leading-tight">Transaksi Berhasil!</h3>
        <p class="text-[11px] text-warm-500 mt-1">Pembayaran melalui <span class="font-bold text-warm-750">{checkoutSummary.paymentMethod}</span> telah dibukukan.</p>
      </div>

      <div class="space-y-4 overflow-y-auto pr-1 flex-grow">
        {#each checkoutSummary.invoices as invoice}
          <div class="bg-warm-50 border border-brand-300/60 rounded-2xl p-4 shadow-2xs space-y-3 relative overflow-hidden">
            <div class="text-center font-mono text-[10px] text-warm-600 space-y-0.5">
              <div class="font-bold text-xs text-warm-900 uppercase">Selerasi Ricebowl</div>
              <div>Tgl: {checkoutSummary.date} | ID: {invoice.txId}</div>
            </div>
            
            <div class="border-t border-dashed border-warm-300 my-1"></div>
            
            <div class="font-mono text-[10px] text-warm-850 space-y-1">
              <div class="flex justify-between">
                <span>Pelanggan:</span>
                <span class="font-bold">{invoice.customerName}</span>
              </div>
              <div class="flex justify-between">
                <span>Pembayaran:</span>
                <span>{invoice.paymentMethod}</span>
              </div>
            </div>
            
            <div class="border-t border-dashed border-warm-300 my-1"></div>
            
            <div class="font-mono text-[10px] text-warm-850 space-y-1">
              {#each invoice.items as item}
                <div class="flex justify-between">
                  <span>{item.name} (x{item.qty})</span>
                  <span>{formatRupiah(item.subtotal)}</span>
                </div>
              {/each}
            </div>
            
            <div class="border-t border-dashed border-warm-300 my-1"></div>
            
            {#if invoice.tax > 0}
              <div class="font-mono text-[10px] text-warm-850 flex justify-between">
                <span>Subtotal:</span>
                <span>{formatRupiah(invoice.subtotal)}</span>
              </div>
              <div class="font-mono text-[10px] text-warm-850 flex justify-between">
                <span>PPN ({storeSettings.tax_rate}%):</span>
                <span>{formatRupiah(invoice.tax)}</span>
              </div>
              <div class="border-t border-dashed border-warm-300 my-1"></div>
            {/if}

            <div class="font-mono text-xs flex justify-between font-bold text-brand-900">
              <span>GRAND TOTAL:</span>
              <span>{formatRupiah(invoice.total)}</span>
            </div>

            <div class="pt-2">
              <button
                type="button"
                on:click={() => printInvoice(invoice)}
                class="w-full flex items-center justify-center space-x-1.5 py-1.5 bg-white border border-brand-300 hover:bg-brand-50 text-warm-800 hover:text-warm-950 rounded-xl text-[10px] font-bold transition shadow-3xs"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.615 0-1.101-.486-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.653m9 0h-9M4 10.5h.008v.008H4V10.5Zm2.25 0h.008v.008H6.25V10.5Z" />
                </svg>
                <span>Cetak Invoice Ini</span>
              </button>
            </div>
          </div>
        {/each}
      </div>

      <div class="flex flex-col space-y-2 pt-4 border-t border-brand-200/60 shrink-0">
        {#if checkoutSummary.invoices.length > 1}
          <button
            type="button"
            on:click={printCombinedInvoice}
            class="w-full flex items-center justify-center space-x-2 py-2.5 bg-brand-100 hover:bg-brand-200 border border-brand-350 text-warm-850 hover:text-warm-950 rounded-xl text-xs font-bold transition-all shadow-2xs shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.615 0-1.101-.486-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.653m9 0h-9M4 10.5h.008v.008H4V10.5Zm2.25 0h.008v.008H6.25V10.5Z" />
            </svg>
            <span>Cetak Invoice Gabungan</span>
          </button>
        {/if}
        
        <button
          type="button"
          on:click={() => showSuccessModal = false}
          class="w-full py-2.5 bg-brand-700 hover:bg-brand-800 text-brand-50 text-xs font-bold rounded-xl transition shadow-md text-center"
        >
          Mulai Transaksi Baru
        </button>
      </div>
    </div>
  </div>
{/if}

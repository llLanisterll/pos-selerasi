<script>
  import { createEventDispatcher } from 'svelte';
  
  export let activeTab = 'Dashboard';
  export let userRole = 'owner';
  export let userEmail = '';
  
  const dispatch = createEventDispatcher();
  let isOpen = false; // Mobile sidebar open state
  let isCollapsed = false; // Desktop sidebar collapsed state
  let menuSections = [];

  // Definisikan menuSections secara reaktif sesuai role user
  $: {
    const sections = [
      {
        title: 'Menu Utama',
        items: [
          { 
            name: 'Dashboard', 
            label: 'Dashboard', 
            icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>`
          },
          { 
            name: 'POS', 
            label: 'Mesin Kasir (POS)', 
            icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 18 4.5H6a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 6 18.75Zm.75-12h.008v.008H6.75V6.75Zm0 3h.008v.008H6.75V9.75Zm0 3h.008v.008H6.75v-.008Z" /></svg>`
          },
          { 
            name: 'Products', 
            label: 'Menu Produk', 
            icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615 3.001 3.001 0 0 1 4.5 0 3.001 3.001 0 0 0 4.5 0 3.001 3.001 0 0 1 4.5 0 3.001 3.001 0 0 0 3.75.615m-16.5 0a2.999 2.999 0 0 1-.224-2.356l1.39-4.867a3.001 3.001 0 0 1 2.91-2.127H19.5c1.336 0 2.502.88 2.91 2.127l1.39 4.867a2.999 2.999 0 0 1-.224 2.356" /></svg>`
          }
        ]
      },
      {
        title: 'Keuangan',
        items: [
          { 
            name: 'ExpenseEntry', 
            label: 'Catat Pengeluaran', 
            icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>`
          },
          { 
            name: 'FinancialReport', 
            label: 'Laporan Keuangan', 
            icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" /></svg>`
          },
          { 
            name: 'History', 
            label: 'Riwayat Transaksi', 
            icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>`
          }
        ]
      },
      {
        title: 'Lainnya',
        items: [
          { 
            name: 'Settings', 
            label: 'Pengaturan', 
            icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.43l1.004-.827c.292-.24.437-.613.43-.991a6.936 6.936 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>`
          }
        ]
      }
    ];
 
     if (userRole === 'superadmin') {
       sections.push({
         title: 'Sistem & IT (Dev)',
         items: [
           {
             name: 'SystemHealth',
             label: 'Kesehatan Sistem',
             icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" /></svg>`
           },
           { 
             name: 'ActivityLogs', 
             label: 'Log Aktivitas Sistem', 
             icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" /></svg>`
           }
         ]
       });
     }
 
     menuSections = sections;
   }

  function selectTab(tabName) {
    activeTab = tabName;
    isOpen = false; // Close mobile drawer
  }

  async function handleLogout() {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        dispatch('logout');
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
  }
</script>

<!-- Mobile Navigation Bar Header -->
<header class="md:hidden w-full bg-brand-100/90 backdrop-blur-md border-b border-brand-300/60 px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-sm">
  <div class="flex items-center space-x-2">
    <div class="w-8 h-8 bg-brand-500 border border-brand-600/40 flex items-center justify-center rounded-lg shadow-sm p-1.5 text-warm-900">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full">
        <path d="M 85,25 C 75,18 55,18 42,24 C 26,30 22,48 29,62 C 34,71 44,79 47,82 C 51,86 33,88 32,82 C 31,76 43,76 49,83" />
      </svg>
    </div>
    <span class="text-lg font-bold text-warm-900">selerasi<span class="text-brand-700">.</span></span>
  </div>
  
  <button 
    on:click={() => isOpen = !isOpen} 
    class="p-1.5 text-warm-600 hover:text-warm-900 focus:outline-none bg-brand-200/60 border border-brand-300/60 rounded-md cursor-pointer active:scale-95 transition"
  >
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
      {#if isOpen}
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
      {:else}
        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
      {/if}
    </svg>
  </button>
</header>

<!-- Backdrop Overlay for Mobile Sidebar Drawer -->
{#if isOpen}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div 
    on:click={() => isOpen = false} 
    class="md:hidden fixed inset-0 bg-warm-900/30 backdrop-blur-sm z-30 transition-all duration-300"
  ></div>
{/if}

<!-- Sidebar Container -->
<aside class="
  fixed inset-y-0 left-0 z-40 bg-brand-100/95 backdrop-blur-md border-r border-brand-300/50 flex flex-col justify-between h-screen transition-all duration-300 md:sticky md:translate-x-0 shadow-lg
  {isOpen ? 'translate-x-0' : '-translate-x-full'}
  {isCollapsed ? 'md:w-20' : 'md:w-64'} w-64
">
  <!-- Floating Collapse Button for Desktop -->
  <button
    type="button"
    on:click={() => isCollapsed = !isCollapsed}
    class="hidden md:flex absolute top-5 -right-3 z-50 w-6 h-6 rounded-full bg-brand-100 hover:bg-brand-200 border border-brand-300/60 text-warm-600 hover:text-warm-950 shadow-md items-center justify-center cursor-pointer transition-all duration-150 active:scale-90"
    title={isCollapsed ? "Buka Sidebar" : "Tutup Sidebar"}
  >
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-3 h-3">
      {#if isCollapsed}
        <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5" />
      {:else}
        <path stroke-linecap="round" stroke-linejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" />
      {/if}
    </svg>
  </button>

  <div class="flex flex-col flex-grow">
    <!-- Branding Header -->
    <div class="h-16 border-b border-brand-300/40 hidden md:flex items-center transition-all duration-300 {isCollapsed ? 'justify-center px-2' : 'px-4'}">
      <div class="flex items-center space-x-2.5 overflow-hidden">
        <div class="w-9 h-9 bg-brand-500 border border-brand-600/40 flex items-center justify-center rounded-xl shadow-sm shrink-0 p-2 text-warm-900">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full">
            <path d="M 85,25 C 75,18 55,18 42,24 C 26,30 22,48 29,62 C 34,71 44,79 47,82 C 51,86 33,88 32,82 C 31,76 43,76 49,83" />
          </svg>
        </div>
        {#if !isCollapsed}
          <div class="animate-fade-in whitespace-nowrap">
            <span class="text-xl font-bold tracking-tight text-warm-900">selerasi<span class="text-brand-700">.</span></span>
            <p class="text-[10px] text-warm-500 font-medium -mt-0.5 tracking-wide">Ricebowl Keuangan</p>
          </div>
        {/if}
      </div>
    </div>

    <!-- Navigation Menu Items -->
    <nav class="flex-grow px-3 py-6 space-y-6 overflow-y-auto">
      {#each menuSections as section}
        <div class="space-y-1.5">
          {#if !isCollapsed}
            <h3 class="px-4 text-[10px] font-bold text-warm-400 uppercase tracking-widest animate-fade-in mb-2">
              {section.title}
            </h3>
          {/if}

          {#each section.items as item}
            <button
              on:click={() => selectTab(item.name)}
              class="
                w-full flex items-center py-2.5 text-xs font-semibold rounded-xl transition-all duration-150 cursor-pointer relative group
                {isCollapsed ? 'justify-center space-x-0 px-2' : 'space-x-3 px-4'}
                {activeTab === item.name 
                  ? 'bg-brand-500 text-warm-900 shadow-sm border border-brand-600/30' 
                  : 'text-warm-600 hover:text-warm-900 hover:bg-brand-200/70 border border-transparent'}
              "
              title={isCollapsed ? item.label : ""}
            >
              <!-- Active Indicator Line -->
              {#if activeTab === item.name}
                <div class="absolute left-0 w-1 h-5 bg-brand-800 rounded-r-full"></div>
              {/if}

              <!-- Icon Wrapper -->
              <div class="
                transition-colors duration-150 shrink-0
                {activeTab === item.name ? 'text-warm-800' : 'text-warm-400 group-hover:text-warm-700'}
              ">
                {@html item.icon}
              </div>
              
              {#if !isCollapsed}
                <span class="tracking-wide animate-fade-in whitespace-nowrap">{item.label}</span>
              {/if}
            </button>
          {/each}
        </div>
      {/each}
    </nav>
  </div>

  <!-- Profile & Business Info Footer -->
  <div class="border-t border-brand-300/40 bg-brand-200/40 shrink-0 transition-all duration-300 {isCollapsed ? 'p-2' : 'p-3'}">
    <div class="flex items-center bg-brand-500/50 rounded-xl border border-brand-400/50 transition-all duration-300 justify-between {isCollapsed ? 'p-1.5' : 'p-2 space-x-3'}">
      <div class="flex items-center min-w-0 {isCollapsed ? '' : 'space-x-2'}">
        <div class="w-8 h-8 bg-brand-600 border border-brand-700/40 rounded-full flex items-center justify-center select-none shadow-sm shrink-0">
          <span class="text-xs font-bold text-warm-900">{userEmail ? userEmail.slice(0, 2).toUpperCase() : 'SS'}</span>
        </div>
        {#if !isCollapsed}
          <div class="min-w-0 flex-1 animate-fade-in whitespace-nowrap overflow-hidden">
            <p class="text-xs font-bold text-warm-900 truncate">{userEmail || 'Sarham San'}</p>
            <p class="text-[10px] text-brand-800 font-semibold tracking-wide uppercase mt-0.5">{userRole === 'superadmin' ? 'SUPERADMIN' : 'Selerasi Owner'}</p>
          </div>
        {/if}
      </div>
      
      <!-- Logout Button -->
      {#if !isCollapsed}
        <button
          type="button"
          on:click={handleLogout}
          class="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 border border-rose-200/40 hover:border-rose-300/60 rounded-lg cursor-pointer transition active:scale-95 shrink-0"
          title="Logout"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
          </svg>
        </button>
      {/if}
    </div>
    {#if isCollapsed}
      <div class="flex justify-center mt-2">
        <button
          type="button"
          on:click={handleLogout}
          class="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 border border-rose-200/40 hover:border-rose-300/60 rounded-lg cursor-pointer transition active:scale-95"
          title="Logout"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
          </svg>
        </button>
      </div>
    {/if}
  </div>
</aside>


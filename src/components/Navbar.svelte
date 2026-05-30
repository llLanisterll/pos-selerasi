<script>
  // Simple navigation items
  export let activeTab = 'Dashboard';
  const tabs = [
    { name: 'Dashboard', label: 'Dashboard' },
    { name: 'History', label: 'Riwayat' },
    { name: 'Settings', label: 'Pengaturan' }
  ];
</script>

<header class="w-full bg-zinc-900/70 backdrop-blur-md border-b border-zinc-800/80 sticky top-0 z-40">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between h-16">
      
      <!-- Brand Logo -->
      <div class="flex items-center space-x-2">
        <div class="w-8 h-8 bg-zinc-800 border border-zinc-700 flex items-center justify-center rounded-lg p-1.5 text-brand-400">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full">
            <path d="M 85,25 C 75,18 55,18 42,24 C 26,30 22,48 29,62 C 34,71 44,79 47,82 C 51,86 33,88 32,82 C 31,76 43,76 49,83" />
          </svg>
        </div>
        <span class="text-xl font-bold tracking-tight text-zinc-100">selerasi<span class="text-brand-500">.</span></span>
      </div>

      <!-- Navigation Menu (Flat 2D Tabs for Desktop) -->
      <nav class="hidden md:flex space-x-1">
        {#each tabs as tab}
          <button
            on:click={() => activeTab = tab.name}
            class="px-3.5 py-1.5 text-sm font-medium transition-colors duration-150 rounded-md cursor-pointer
              {activeTab === tab.name 
                ? 'bg-zinc-800 text-zinc-100 border border-zinc-700' 
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60'}"
          >
            {tab.label}
          </button>
        {/each}
      </nav>

      <!-- User Profile Summary (Flat Initial Circle) -->
      <div class="flex items-center space-x-3">
        <span class="hidden sm:inline-block text-xs font-medium text-zinc-400">Sarham San</span>
        <div class="w-9 h-9 bg-zinc-800 border border-zinc-700 rounded-full flex items-center justify-center select-none">
          <span class="text-sm font-semibold text-zinc-200">SS</span>
        </div>
      </div>

    </div>
  </div>
</header>

<!-- Bottom Tab Navigation Bar for Mobile Viewports (sticky bottom) -->
<nav class="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-900/95 backdrop-blur-md border-t border-zinc-800 px-4 py-2 flex justify-around items-center z-50 shadow-[0_-4px_24px_rgba(0,0,0,0.4)] select-none">
  {#each tabs as tab}
    <button
      on:click={() => activeTab = tab.name}
      class="flex flex-col items-center justify-center w-20 py-1 transition-all duration-150 cursor-pointer relative"
    >
      <!-- Active background indicator -->
      {#if activeTab === tab.name}
        <div class="absolute -top-2 w-10 h-0.5 bg-brand-500 rounded-full"></div>
      {/if}
      
      <div class="transition-colors duration-150 {activeTab === tab.name ? 'text-brand-400 scale-105' : 'text-zinc-500 hover:text-zinc-300'}">
        {#if tab.name === 'Dashboard'}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
        {:else if tab.name === 'History'}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
          </svg>
        {:else if tab.name === 'Settings'}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.43l1.004-.827c.292-.24.437-.613.43-.991a6.936 6.936 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
        {/if}
      </div>
      
      <span class="text-[10px] font-semibold mt-1 tracking-wide uppercase transition-colors duration-150 {activeTab === tab.name ? 'text-zinc-100 font-bold' : 'text-zinc-500'}">
        {tab.label}
      </span>
    </button>
  {/each}
</nav>

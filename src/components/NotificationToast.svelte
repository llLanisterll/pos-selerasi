<script>
  import { notifications, dismissNotification } from '../stores/notificationStore';
  import { flip } from 'svelte/animate';
  import { fly } from 'svelte/transition';

  const typeStyles = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800 icon-emerald-600',
    error: 'bg-rose-50 border-rose-200 text-rose-800 icon-rose-600',
    info: 'bg-blue-50 border-blue-200 text-blue-800 icon-blue-600',
    warning: 'bg-amber-50 border-amber-200 text-amber-800 icon-amber-600'
  };
</script>

<div class="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
  {#each $notifications as notification (notification.id)}
    <div
      animate:flip={{ duration: 300 }}
      transition:fly={{ x: 20, duration: 300, opacity: 0 }}
      class="pointer-events-auto flex items-start p-4 rounded-2xl border shadow-lg backdrop-blur-md {typeStyles[notification.type] || typeStyles.success} transition-all duration-300"
    >
      <!-- Icon -->
      <div class="shrink-0 mr-3 mt-0.5">
        {#if notification.type === 'success'}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        {:else if notification.type === 'error'}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        {:else}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
          </svg>
        {/if}
      </div>

      <!-- Content -->
      <div class="flex-grow">
        <p class="text-xs font-bold leading-relaxed">{notification.message}</p>
      </div>

      <!-- Close Button -->
      <button
        on:click={() => dismissNotification(notification.id)}
        class="shrink-0 ml-4 p-0.5 hover:bg-black/5 rounded-lg transition-colors cursor-pointer"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4 opacity-50">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  {/each}
</div>

<script>
  import { confirmation, closeConfirmation } from '../stores/confirmationStore';
  import { fade, scale } from 'svelte/transition';

  function handleConfirm() {
    $confirmation.onConfirm();
    closeConfirmation();
  }

  function handleCancel() {
    $confirmation.onCancel();
    closeConfirmation();
  }

  const typeStyles = {
    danger: {
      iconBg: 'bg-rose-100',
      iconColor: 'text-rose-600',
      confirmBtn: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200',
      iconPath: 'm14.74 9-.34 12.142m-10.11-12.14 1.1 11.24a2.25 2.25 0 0 0 2.23 2.19h8.56a2.25 2.25 0 0 0 2.23-2.19l1.1-11.24m-12 0h12m-9-3h9m-7.3-3.6H17c.445 0 .833.207 1.085.53l.9 1.25M6.285 5.25c.252-.323.64-.53 1.085-.53h8.56c.445 0 .833.207 1.085.53'
    },
    warning: {
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      confirmBtn: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-200',
      iconPath: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z'
    },
    info: {
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      confirmBtn: 'bg-brand-700 hover:bg-brand-800 text-white shadow-brand-200',
      iconPath: 'm11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z'
    }
  };

  $: style = typeStyles[$confirmation.type] || typeStyles.danger;
</script>

{#if $confirmation.isOpen}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div 
    transition:fade={{ duration: 200 }}
    class="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-warm-900/40 backdrop-blur-sm"
    on:click|self={handleCancel}
  >
    <div 
      transition:scale={{ duration: 200, start: 0.95 }}
      class="bg-white rounded-3xl shadow-2xl border border-brand-300/50 max-w-sm w-full overflow-hidden"
    >
      <div class="p-6">
        <div class="flex items-center gap-4 mb-4">
          <div class="w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center {style.iconBg} {style.iconColor} shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d={style.iconPath} />
            </svg>
          </div>
          <div>
            <h3 class="text-base font-extrabold text-warm-900 leading-tight">{$confirmation.title}</h3>
          </div>
        </div>

        <p class="text-sm text-warm-500 leading-relaxed font-medium">
          {$confirmation.message}
        </p>
      </div>

      <div class="flex items-center gap-3 p-4 bg-brand-50/50 border-t border-brand-100">
        <button
          on:click={handleCancel}
          class="flex-1 px-4 py-2.5 bg-white border border-brand-300 text-warm-600 text-xs font-bold rounded-xl hover:bg-brand-50 hover:text-warm-800 transition-all cursor-pointer active:scale-95"
        >
          {$confirmation.cancelText}
        </button>
        <button
          on:click={handleConfirm}
          class="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer {style.confirmBtn}"
        >
          {$confirmation.confirmText}
        </button>
      </div>
    </div>
  </div>
{/if}

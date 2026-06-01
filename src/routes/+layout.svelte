<script>
  import '../app.css';
  import NotificationToast from '../components/NotificationToast.svelte';
  import ConfirmationModal from '../components/ConfirmationModal.svelte';
  import { onMount } from 'svelte';
  import { initPwa } from '../stores/pwaStore.js';
  
  let { children } = $props();

  onMount(() => {
    // Inisialisasi listener PWA (beforeinstallprompt)
    initPwa();

    // Registrasi Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js', { type: 'module' })
        .then((reg) => {
          console.log('SW: Registrasi berhasil, scope:', reg.scope);
        })
        .catch((err) => {
          console.error('SW: Registrasi gagal:', err);
        });
    }
  });
</script>

{@render children()}
<NotificationToast />
<ConfirmationModal />

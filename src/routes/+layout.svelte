<script>
  import '../app.css';
  import NotificationToast from '../components/NotificationToast.svelte';
  import ConfirmationModal from '../components/ConfirmationModal.svelte';
  let { children } = $props();
</script>

{@render children()}
<NotificationToast />
<ConfirmationModal />

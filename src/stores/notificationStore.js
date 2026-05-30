import { writable } from 'svelte/store';

export const notifications = writable([]);

export function addNotification(message, type = 'success', duration = 3000) {
  const id = Date.now();
  notifications.update(n => [...n, { id, message, type }]);

  if (duration > 0) {
    setTimeout(() => {
      dismissNotification(id);
    }, duration);
  }
}

export function dismissNotification(id) {
  notifications.update(n => n.filter(item => item.id !== id));
}

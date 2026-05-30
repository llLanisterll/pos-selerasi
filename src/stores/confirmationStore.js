import { writable } from 'svelte/store';

const initialState = {
  isOpen: false,
  title: 'Konfirmasi',
  message: 'Apakah Anda yakin ingin melakukan tindakan ini?',
  confirmText: 'Ya, Lanjutkan',
  cancelText: 'Batal',
  onConfirm: () => {},
  onCancel: () => {},
  type: 'danger' // 'danger' | 'warning' | 'info'
};

export const confirmation = writable({ ...initialState });

export function askConfirmation(options) {
  confirmation.set({
    ...initialState,
    ...options,
    isOpen: true
  });
}

export function closeConfirmation() {
  confirmation.update(state => ({ ...state, isOpen: false }));
}

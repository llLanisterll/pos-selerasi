import { writable } from 'svelte/store';

export const deferredPrompt = writable(null);
export const isInstallable = writable(false);
export const isInstalled = writable(false);

// Menginisialisasi event listeners PWA di sisi browser
export function initPwa() {
  if (typeof window === 'undefined') return;

  // Cek apakah saat ini sudah berjalan dalam mode standalone (aplikasi terinstal)
  if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
    isInstalled.set(true);
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    // Mencegah prompt instalasi bawaan browser agar kita bisa memicu dari tombol kustom
    e.preventDefault();
    // Simpan event agar bisa dijalankan saat tombol "Instal" diklik
    deferredPrompt.set(e);
    isInstallable.set(true);
  });

  window.addEventListener('appinstalled', () => {
    console.log('Selerasi PWA berhasil diinstal!');
    isInstallable.set(false);
    deferredPrompt.set(null);
    isInstalled.set(true);
  });
}

// Fungsi untuk memicu prompt instalasi browser
export async function triggerInstall() {
  let promptEvent;
  const unsubscribe = deferredPrompt.subscribe(val => {
    promptEvent = val;
  });
  unsubscribe();

  if (!promptEvent) {
    return false;
  }

  // Tampilkan prompt instalasi browser
  promptEvent.prompt();

  // Tunggu interaksi dari user
  const { outcome } = await promptEvent.userChoice;
  console.log(`Pilihan user untuk instalasi: ${outcome}`);

  if (outcome === 'accepted') {
    deferredPrompt.set(null);
    isInstallable.set(false);
    return true;
  }
  return false;
}

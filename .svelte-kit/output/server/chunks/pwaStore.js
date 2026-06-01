import { P as writable } from "./index-server.js";
import "./index-server2.js";
//#region src/stores/notificationStore.js
var notifications = writable([]);
function addNotification(message, type = "success", duration = 3e3) {
	const id = Date.now();
	notifications.update((n) => [...n, {
		id,
		message,
		type
	}]);
	if (duration > 0) setTimeout(() => {
		dismissNotification(id);
	}, duration);
}
function dismissNotification(id) {
	notifications.update((n) => n.filter((item) => item.id !== id));
}
var confirmation = writable({
	isOpen: false,
	title: "Konfirmasi",
	message: "Apakah Anda yakin ingin melakukan tindakan ini?",
	confirmText: "Ya, Lanjutkan",
	cancelText: "Batal",
	onConfirm: () => {},
	onCancel: () => {},
	type: "danger"
});
//#endregion
//#region src/stores/pwaStore.js
var deferredPrompt = writable(null);
var isInstallable = writable(false);
var isInstalled = writable(false);
function initPwa() {
	if (typeof window === "undefined") return;
	if (window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone) isInstalled.set(true);
	window.addEventListener("beforeinstallprompt", (e) => {
		e.preventDefault();
		deferredPrompt.set(e);
		isInstallable.set(true);
	});
	window.addEventListener("appinstalled", () => {
		console.log("Selerasi PWA berhasil diinstal!");
		isInstallable.set(false);
		deferredPrompt.set(null);
		isInstalled.set(true);
	});
}
//#endregion
export { addNotification as a, confirmation as i, isInstallable as n, notifications as o, isInstalled as r, initPwa as t };

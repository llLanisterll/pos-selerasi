import { A as writable } from "./dev.js";
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
export { addNotification as n, notifications as r, confirmation as t };

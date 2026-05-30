import { A as writable } from "./dev.js";
import "./index-server2.js";
//#region src/stores/notificationStore.js
var notifications = writable([]);
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
export { notifications as n, confirmation as t };

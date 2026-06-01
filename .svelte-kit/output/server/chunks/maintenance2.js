//#region src/lib/server/maintenance.js
var maintenanceActive = false;
/**
* Mendapatkan status mode pemeliharaan (maintenance mode).
* @returns {boolean}
*/
function isMaintenanceActive() {
	return maintenanceActive;
}
/**
* Mengatur status mode pemeliharaan.
* @param {boolean} active 
*/
function setMaintenanceActive(active) {
	maintenanceActive = !!active;
}
//#endregion
export { setMaintenanceActive as n, isMaintenanceActive as t };

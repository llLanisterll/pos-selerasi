let maintenanceActive = false;

/**
 * Mendapatkan status mode pemeliharaan (maintenance mode).
 * @returns {boolean}
 */
export function isMaintenanceActive() {
  return maintenanceActive;
}

/**
 * Mengatur status mode pemeliharaan.
 * @param {boolean} active 
 */
export function setMaintenanceActive(active) {
  maintenanceActive = !!active;
}

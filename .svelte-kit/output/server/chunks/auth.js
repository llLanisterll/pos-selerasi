import { n as supabase } from "./db.js";
import { t as isMaintenanceActive } from "./maintenance2.js";
//#region src/lib/server/auth.js
/**
* Memverifikasi token autentikasi dari cookies atau header Authorization, serta opsional mengecek role user.
* @param {Request} request 
* @param {import('@sveltejs/kit').Cookies} cookies
* @param {string|null} requiredRole - Role yang diperlukan (misal: 'superadmin')
* @returns {Promise<{ user: import('@supabase/supabase-js').User|null, error: Error|null }>}
*/
async function authenticate(request, cookies, requiredRole = null) {
	let token = cookies.get("session");
	if (!token) {
		const authHeader = request.headers.get("Authorization");
		if (authHeader && authHeader.startsWith("Bearer ")) token = authHeader.substring(7);
	}
	if (!token) return {
		user: null,
		error: /* @__PURE__ */ new Error("Sesi tidak ditemukan. Silakan login kembali.")
	};
	try {
		const { data: { user }, error } = await supabase.auth.getUser(token);
		if (error || !user) return {
			user: null,
			error: error || /* @__PURE__ */ new Error("Sesi tidak valid atau telah kedaluwarsa.")
		};
		const userRole = user.user_metadata?.role || "owner";
		if (isMaintenanceActive() && userRole !== "superadmin") return {
			user: null,
			error: /* @__PURE__ */ new Error("MAINTENANCE_MODE: Aplikasi sedang dalam pemeliharaan oleh Superadmin.")
		};
		if (requiredRole) {
			if (requiredRole === "superadmin") {
				if (userRole !== "superadmin" && userRole !== "owner") return {
					user,
					error: /* @__PURE__ */ new Error("Anda tidak memiliki izin (hak akses) untuk melakukan operasi ini.")
				};
			} else if (requiredRole === "superadmin-strict") {
				if (userRole !== "superadmin") return {
					user,
					error: /* @__PURE__ */ new Error("Operasi ini sangat sensitif dan hanya dapat dilakukan oleh Superadmin.")
				};
			} else if (userRole !== requiredRole) return {
				user,
				error: /* @__PURE__ */ new Error("Anda tidak memiliki izin (hak akses) untuk melakukan operasi ini.")
			};
		}
		return {
			user,
			error: null
		};
	} catch (err) {
		return {
			user: null,
			error: err
		};
	}
}
//#endregion
export { authenticate as t };

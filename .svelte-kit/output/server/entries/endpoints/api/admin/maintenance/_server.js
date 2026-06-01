import { t as logActivity } from "../../../../../chunks/db.js";
import { n as setMaintenanceActive, t as isMaintenanceActive } from "../../../../../chunks/maintenance2.js";
import { t as authenticate } from "../../../../../chunks/auth.js";
import { json } from "@sveltejs/kit";
//#region src/routes/api/admin/maintenance/+server.js
async function GET() {
	return json({ active: isMaintenanceActive() });
}
async function POST({ request, cookies }) {
	try {
		const { user: currentAdmin, error: authError } = await authenticate(request, cookies, "superadmin");
		if (authError) return json({ message: authError.message }, { status: 403 });
		if ((currentAdmin.user_metadata?.role || "owner") !== "superadmin") return json({ message: "Anda tidak memiliki hak akses Superadmin." }, { status: 403 });
		const { active } = await request.json();
		if (typeof active !== "boolean") return json({ message: "Parameter \"active\" harus berupa boolean." }, { status: 400 });
		setMaintenanceActive(active);
		await logActivity(currentAdmin.email, active ? "Mengaktifkan Mode Pemeliharaan" : "Menonaktifkan Mode Pemeliharaan", `Status Pemeliharaan: ${active ? "AKTIF" : "NONAKTIF"}`);
		return json({
			message: `Mode pemeliharaan berhasil ${active ? "diaktifkan" : "dinonaktifkan"}.`,
			active
		});
	} catch (err) {
		return json({ message: err.message }, { status: 500 });
	}
}
//#endregion
export { GET, POST };

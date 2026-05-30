import { n as supabaseAdmin } from "../../../../../chunks/db.js";
import { t as authenticate } from "../../../../../chunks/auth.js";
import { json } from "@sveltejs/kit";
//#region src/routes/api/users/[id]/+server.js
async function DELETE({ params, request, cookies }) {
	const { id } = params;
	try {
		const { user: currentAdmin, error: authError } = await authenticate(request, cookies, "superadmin");
		if (authError) return json({ message: authError.message }, { status: 403 });
		if (!supabaseAdmin) return json({ message: "Service Role Key belum diatur. Pengaturan user dinonaktifkan." }, { status: 500 });
		if (currentAdmin.id === id) return json({ message: "Anda tidak dapat menghapus akun Anda sendiri yang sedang digunakan." }, { status: 400 });
		const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
		if (error) return json({ message: error.message }, { status: 422 });
		return json({ message: "User berhasil dihapus." });
	} catch (err) {
		return json({ message: err.message }, { status: 500 });
	}
}
//#endregion
export { DELETE };

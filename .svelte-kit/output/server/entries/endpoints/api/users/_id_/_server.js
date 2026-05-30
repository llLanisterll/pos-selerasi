import { r as supabaseAdmin, t as logActivity } from "../../../../../chunks/db.js";
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
		const { data: { user: userToDelete } } = await supabaseAdmin.auth.admin.getUserById(id);
		const targetEmail = userToDelete?.email || id;
		const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
		if (error) return json({ message: error.message }, { status: 422 });
		await logActivity(currentAdmin.email, "Menghapus Pengguna", `Email: ${targetEmail}`);
		return json({ message: "User berhasil dihapus." });
	} catch (err) {
		return json({ message: err.message }, { status: 500 });
	}
}
async function PUT({ params, request, cookies }) {
	const { id } = params;
	try {
		const { user: currentAdmin, error: authError } = await authenticate(request, cookies, "superadmin");
		if (authError) return json({ message: authError.message }, { status: 403 });
		if (!supabaseAdmin) return json({ message: "Service Role Key belum diatur. Pengaturan user dinonaktifkan." }, { status: 500 });
		const { role, password } = await request.json();
		const updateData = {};
		if (role) {
			if (role !== "owner" && role !== "superadmin") return json({ message: "Role tidak valid." }, { status: 400 });
			updateData.user_metadata = { role };
		}
		if (password) {
			if (password.length < 6) return json({ message: "Password minimal 6 karakter." }, { status: 400 });
			updateData.password = password;
		}
		if (currentAdmin.id === id && role && role !== "superadmin") return json({ message: "Anda tidak dapat menurunkan peran (demote) akun Anda sendiri." }, { status: 400 });
		const { data: { user: userToUpdate } } = await supabaseAdmin.auth.admin.getUserById(id);
		const targetEmail = userToUpdate?.email || id;
		const { data: { user }, error } = await supabaseAdmin.auth.admin.updateUserById(id, updateData);
		if (error) return json({ message: error.message }, { status: 422 });
		let logDetail = `Email: ${targetEmail}`;
		if (role) logDetail += `, Peran: ${role}`;
		if (password) logDetail += `, Sandi diubah`;
		await logActivity(currentAdmin.email, "Memperbarui Pengguna", logDetail);
		return json({
			message: "User berhasil diperbarui.",
			user: {
				id: user.id,
				email: user.email,
				role: user.user_metadata?.role
			}
		});
	} catch (err) {
		return json({ message: err.message }, { status: 500 });
	}
}
//#endregion
export { DELETE, PUT };

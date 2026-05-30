import { r as supabaseAdmin, t as logActivity } from "../../../../chunks/db.js";
import { t as authenticate } from "../../../../chunks/auth.js";
import { json } from "@sveltejs/kit";
//#region src/routes/api/users/+server.js
async function GET({ request, cookies }) {
	try {
		const { error: authError } = await authenticate(request, cookies, "superadmin");
		if (authError) return json({ message: authError.message }, { status: 403 });
		if (!supabaseAdmin) return json({ message: "Service Role Key belum diatur. Pengaturan user dinonaktifkan." }, { status: 500 });
		const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
		if (error) throw error;
		return json(users.map((u) => ({
			id: u.id,
			email: u.email,
			role: u.user_metadata?.role || "owner",
			created_at: u.created_at,
			last_sign_in_at: u.last_sign_in_at
		})));
	} catch (err) {
		return json({ message: err.message }, { status: 500 });
	}
}
async function POST({ request, cookies }) {
	try {
		const { error: authError } = await authenticate(request, cookies, "superadmin");
		if (authError) return json({ message: authError.message }, { status: 403 });
		if (!supabaseAdmin) return json({ message: "Service Role Key belum diatur. Pengaturan user dinonaktifkan." }, { status: 500 });
		const { email, password, role } = await request.json();
		if (!email || !password || !role) return json({ message: "Email, password, dan role wajib diisi." }, { status: 400 });
		if (role !== "owner" && role !== "superadmin") return json({ message: "Role tidak valid." }, { status: 400 });
		const { data: { user }, error } = await supabaseAdmin.auth.admin.createUser({
			email,
			password,
			email_confirm: true,
			user_metadata: { role }
		});
		if (error) return json({ message: error.message }, { status: 422 });
		await logActivity((await authenticate(request, cookies, "superadmin")).user?.email || "System", "Membuat Pengguna Baru", `Email: ${email}, Peran: ${role}`);
		return json({
			message: "User baru berhasil dibuat.",
			user: {
				id: user.id,
				email: user.email,
				role: user.user_metadata?.role
			}
		}, { status: 201 });
	} catch (err) {
		return json({ message: err.message }, { status: 500 });
	}
}
//#endregion
export { GET, POST };

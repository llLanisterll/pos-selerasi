import { n as supabase, t as logActivity } from "../../../../chunks/db.js";
import { t as authenticate } from "../../../../chunks/auth.js";
import { json } from "@sveltejs/kit";
//#region src/routes/api/clear-all/+server.js
async function POST({ request, cookies }) {
	try {
		const { user, error: authError } = await authenticate(request, cookies, "superadmin-strict");
		if (authError) return json({ message: authError.message }, { status: 403 });
		const { error: err1 } = await supabase.from("transactions").delete().neq("id", "dummy");
		const { error: err2 } = await supabase.from("categories").delete().neq("id", "dummy");
		const { error: err3 } = await supabase.from("products").delete().neq("id", "dummy");
		if (err1) throw err1;
		if (err2) throw err2;
		if (err3) throw err3;
		await logActivity(user.email, "Menghapus Semua Data", "Mengosongkan tabel kategori, produk, dan transaksi.");
		return json({
			message: "All data cleared successfully",
			categories: [],
			transactions: [],
			products: []
		});
	} catch (err) {
		return json({ message: err.message }, { status: 500 });
	}
}
//#endregion
export { POST };

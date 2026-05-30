import { n as supabase } from "../../../../../chunks/db.js";
import { t as authenticate } from "../../../../../chunks/auth.js";
import { json } from "@sveltejs/kit";
//#region src/routes/api/transactions/[id]/+server.js
async function DELETE({ params, request, cookies }) {
	const { id } = params;
	try {
		const { error: authError } = await authenticate(request, cookies);
		if (authError) return json({ message: authError.message }, { status: 401 });
		const { data: transaction, error: getError } = await supabase.from("transactions").select("*").eq("id", id).maybeSingle();
		if (getError) throw getError;
		if (!transaction) return json({ message: "Transaksi tidak ditemukan" }, { status: 404 });
		const { error: deleteError } = await supabase.from("transactions").delete().eq("id", id);
		if (deleteError) throw deleteError;
		return json({ message: "Transaction deleted successfully" });
	} catch (err) {
		return json({ message: err.message }, { status: 500 });
	}
}
//#endregion
export { DELETE };

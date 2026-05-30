import { t as supabase } from "../../../../../chunks/db.js";
import { t as authenticate } from "../../../../../chunks/auth.js";
import { json } from "@sveltejs/kit";
//#region src/routes/api/products/[id]/+server.js
async function PUT({ params, request, cookies }) {
	const { id } = params;
	try {
		const { error: authError } = await authenticate(request, cookies);
		if (authError) return json({ message: authError.message }, { status: 401 });
		const body = await request.json();
		const { data: product, error: getError } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
		if (getError) throw getError;
		if (!product) return json({ message: "Menu tidak ditemukan." }, { status: 404 });
		const newName = body.name.trim();
		const { data: duplicate, error: dupError } = await supabase.from("products").select("*").ilike("name", newName).neq("id", id).maybeSingle();
		if (dupError) throw dupError;
		if (duplicate) return json({ message: "Nama menu sudah terdaftar." }, { status: 422 });
		const now = (/* @__PURE__ */ new Date()).toISOString();
		const { data: updated, error: updateError } = await supabase.from("products").update({
			name: newName,
			price: body.price,
			description: body.description || "",
			status: body.status,
			updated_at: now
		}).eq("id", id).select().single();
		if (updateError) throw updateError;
		return json(updated);
	} catch (err) {
		return json({ message: err.message }, { status: 500 });
	}
}
async function DELETE({ params, request, cookies }) {
	const { id } = params;
	try {
		const { error: authError } = await authenticate(request, cookies);
		if (authError) return json({ message: authError.message }, { status: 401 });
		const { data: product, error: getError } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
		if (getError) throw getError;
		if (!product) return json({ message: "Menu tidak ditemukan." }, { status: 404 });
		const { error: deleteError } = await supabase.from("products").delete().eq("id", id);
		if (deleteError) throw deleteError;
		return json({ message: "Product deleted successfully." });
	} catch (err) {
		return json({ message: err.message }, { status: 500 });
	}
}
//#endregion
export { DELETE, PUT };

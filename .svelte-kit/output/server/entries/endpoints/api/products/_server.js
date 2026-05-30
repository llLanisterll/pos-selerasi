import { t as supabase } from "../../../../chunks/db.js";
import { t as authenticate } from "../../../../chunks/auth.js";
import { json } from "@sveltejs/kit";
//#region src/routes/api/products/+server.js
async function GET({ request, cookies }) {
	try {
		const { error: authError } = await authenticate(request, cookies);
		if (authError) return json({ message: authError.message }, { status: 401 });
		const { data: products, error } = await supabase.from("products").select("*").order("name", { ascending: true });
		if (error) throw error;
		return json(products);
	} catch (err) {
		return json({ message: err.message }, { status: 500 });
	}
}
async function POST({ request, cookies }) {
	try {
		const { error: authError } = await authenticate(request, cookies);
		if (authError) return json({ message: authError.message }, { status: 401 });
		const body = await request.json();
		const name = body.name.trim();
		const { data: existing, error: getError } = await supabase.from("products").select("*").ilike("name", name).maybeSingle();
		if (getError) throw getError;
		if (existing) return json({ message: "Nama menu sudah terdaftar." }, { status: 422 });
		const now = (/* @__PURE__ */ new Date()).toISOString();
		const { data: added, error: insertError } = await supabase.from("products").insert({
			id: body.id,
			name,
			price: body.price,
			description: body.description || "",
			status: body.status || "Tersedia",
			created_at: now,
			updated_at: now
		}).select().single();
		if (insertError) throw insertError;
		return json(added, { status: 201 });
	} catch (err) {
		return json({ message: err.message }, { status: 500 });
	}
}
//#endregion
export { GET, POST };

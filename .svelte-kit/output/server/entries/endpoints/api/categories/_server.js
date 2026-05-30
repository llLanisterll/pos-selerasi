import { t as supabase } from "../../../../chunks/db.js";
import { json } from "@sveltejs/kit";
//#region src/routes/api/categories/+server.js
async function GET() {
	try {
		const { data: categories, error } = await supabase.from("categories").select("*").order("name", { ascending: true });
		if (error) throw error;
		return json(categories);
	} catch (err) {
		return json({ message: err.message }, { status: 500 });
	}
}
async function POST({ request }) {
	try {
		const body = await request.json();
		const name = body.name.trim();
		const { data: existing, error: findError } = await supabase.from("categories").select("*").ilike("name", name).maybeSingle();
		if (findError) throw findError;
		if (existing) return json({ message: "Nama kategori sudah terdaftar" }, { status: 422 });
		const now = (/* @__PURE__ */ new Date()).toISOString();
		const { data: added, error: insertError } = await supabase.from("categories").insert({
			id: body.id,
			name,
			type: body.type,
			bgClass: body.bgClass,
			textClass: body.textClass,
			borderClass: body.borderClass,
			hex: body.hex,
			colorName: body.colorName,
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

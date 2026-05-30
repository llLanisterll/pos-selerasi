import { t as supabase } from "../../../../chunks/db.js";
import { json } from "@sveltejs/kit";
//#region src/routes/api/transactions/+server.js
async function GET() {
	try {
		const { data: transactions, error } = await supabase.from("transactions").select("*").order("date", { ascending: false }).order("created_at", { ascending: false });
		if (error) throw error;
		return json(transactions);
	} catch (err) {
		return json({ message: err.message }, { status: 500 });
	}
}
async function POST({ request }) {
	try {
		const body = await request.json();
		const now = (/* @__PURE__ */ new Date()).toISOString();
		const { data: added, error: insertError } = await supabase.from("transactions").insert({
			id: body.id,
			description: body.description,
			amount: body.amount,
			type: body.type,
			category: body.category,
			date: body.date,
			quantity: body.quantity ?? 1,
			payment_method: body.payment_method ?? "Tunai",
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

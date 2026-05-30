import { t as supabase } from "../../../../chunks/db.js";
import { t as authenticate } from "../../../../chunks/auth.js";
import { json } from "@sveltejs/kit";
//#region src/routes/api/import/+server.js
async function POST({ request, cookies }) {
	try {
		const { error: authError } = await authenticate(request, cookies);
		if (authError) return json({ message: authError.message }, { status: 401 });
		const body = await request.json();
		const { error: delTxErr } = await supabase.from("transactions").delete().neq("id", "dummy");
		const { error: delCatErr } = await supabase.from("categories").delete().neq("id", "dummy");
		const { error: delProdErr } = await supabase.from("products").delete().neq("id", "dummy");
		if (delTxErr) throw delTxErr;
		if (delCatErr) throw delCatErr;
		if (delProdErr) throw delProdErr;
		const now = (/* @__PURE__ */ new Date()).toISOString();
		if (body.categories && Array.isArray(body.categories) && body.categories.length > 0) {
			const catsToInsert = body.categories.map((cat) => ({
				id: cat.id,
				name: cat.name,
				type: cat.type,
				bgClass: cat.bgClass,
				textClass: cat.textClass,
				borderClass: cat.borderClass,
				hex: cat.hex,
				colorName: cat.colorName,
				created_at: now,
				updated_at: now
			}));
			const { error: catInsertErr } = await supabase.from("categories").insert(catsToInsert);
			if (catInsertErr) throw catInsertErr;
		}
		if (body.transactions && Array.isArray(body.transactions) && body.transactions.length > 0) {
			const txToInsert = body.transactions.map((tx) => ({
				id: tx.id,
				description: tx.description,
				amount: tx.amount,
				type: tx.type,
				category: tx.category,
				date: tx.date,
				quantity: tx.quantity ?? 1,
				payment_method: tx.payment_method ?? "Tunai",
				created_at: now,
				updated_at: now
			}));
			const { error: txInsertErr } = await supabase.from("transactions").insert(txToInsert);
			if (txInsertErr) throw txInsertErr;
		}
		if (body.products && Array.isArray(body.products) && body.products.length > 0) {
			const prodToInsert = body.products.map((prod) => ({
				id: prod.id,
				name: prod.name,
				price: prod.price,
				description: prod.description || "",
				status: prod.status || "Tersedia",
				created_at: now,
				updated_at: now
			}));
			const { error: prodInsertErr } = await supabase.from("products").insert(prodToInsert);
			if (prodInsertErr) throw prodInsertErr;
		}
		const { data: finalCats, error: getCatsErr } = await supabase.from("categories").select("*");
		if (getCatsErr) throw getCatsErr;
		const { data: finalTxs, error: getTxsErr } = await supabase.from("transactions").select("*").order("date", { ascending: false }).order("created_at", { ascending: false });
		if (getTxsErr) throw getTxsErr;
		const { data: finalProds, error: getProdsErr } = await supabase.from("products").select("*");
		if (getProdsErr) throw getProdsErr;
		return json({
			message: "Data imported successfully",
			categories: finalCats,
			transactions: finalTxs,
			products: finalProds
		});
	} catch (err) {
		return json({ message: err.message }, { status: 500 });
	}
}
//#endregion
export { POST };

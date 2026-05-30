import { n as supabaseAdmin, t as supabase } from "../../../../../chunks/db.js";
import { t as authenticate } from "../../../../../chunks/auth.js";
import { json } from "@sveltejs/kit";
//#region src/routes/api/admin/stats/+server.js
async function GET({ request, cookies }) {
	try {
		const { error: authError } = await authenticate(request, cookies, "superadmin");
		if (authError) return json({ message: authError.message }, { status: 403 });
		let usersCount = 0;
		if (supabaseAdmin) {
			const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
			if (!usersError && users) usersCount = users.length;
		}
		const [productsRes, categoriesRes, transactionsRes] = await Promise.all([
			supabase.from("products").select("*", {
				count: "exact",
				head: true
			}),
			supabase.from("categories").select("*", {
				count: "exact",
				head: true
			}),
			supabase.from("transactions").select("*", {
				count: "exact",
				head: true
			})
		]);
		return json({
			usersCount,
			productsCount: productsRes.count || 0,
			categoriesCount: categoriesRes.count || 0,
			transactionsCount: transactionsRes.count || 0,
			errors: {
				products: productsRes.error?.message || null,
				categories: categoriesRes.error?.message || null,
				transactions: transactionsRes.error?.message || null
			}
		});
	} catch (err) {
		return json({ message: err.message }, { status: 500 });
	}
}
//#endregion
export { GET };

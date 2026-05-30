import { n as supabase } from "../../../../../chunks/db.js";
import { json } from "@sveltejs/kit";
//#region src/routes/api/auth/logout/+server.js
async function POST({ cookies }) {
	try {
		await supabase.auth.signOut();
		cookies.delete("session", { path: "/" });
		return json({ message: "Logout berhasil." });
	} catch (err) {
		return json({ message: err.message }, { status: 500 });
	}
}
//#endregion
export { POST };

import { t as authenticate } from "../../../../../chunks/auth.js";
import { json } from "@sveltejs/kit";
//#region src/routes/api/auth/session/+server.js
async function GET({ request, cookies }) {
	const { user, error } = await authenticate(request, cookies);
	if (error || !user) return json({
		user: null,
		message: error?.message || "Sesi tidak aktif."
	}, { status: 401 });
	return json({ user });
}
//#endregion
export { GET };

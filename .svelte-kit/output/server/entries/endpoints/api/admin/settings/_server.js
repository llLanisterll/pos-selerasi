import { n as supabase, t as logActivity } from "../../../../../chunks/db.js";
import { t as authenticate } from "../../../../../chunks/auth.js";
import { json } from "@sveltejs/kit";
//#region src/routes/api/admin/settings/+server.js
async function GET({ request, cookies }) {
	try {
		const { error: authError } = await authenticate(request, cookies);
		if (authError) return json({ message: authError.message }, { status: 401 });
		const { data: settings, error } = await supabase.from("store_settings").select("*").eq("id", "default").maybeSingle();
		if (error) throw error;
		return json(settings || {
			id: "default",
			name: "Selerasi Ricebowl",
			address: "Jl. Sukarno Hatta No. 45, Bandung",
			phone: "0812-3456-7890",
			tax_rate: 0,
			service_charge: 0
		});
	} catch (err) {
		return json({ message: err.message }, { status: 500 });
	}
}
async function PUT({ request, cookies }) {
	try {
		const { user: currentAdmin, error: authError } = await authenticate(request, cookies, "superadmin");
		if (authError) return json({ message: authError.message }, { status: 403 });
		const { name, address, phone, tax_rate, service_charge } = await request.json();
		if (!name || name.trim() === "") return json({ message: "Nama toko wajib diisi." }, { status: 400 });
		const now = (/* @__PURE__ */ new Date()).toISOString();
		const { data: updated, error } = await supabase.from("store_settings").upsert({
			id: "default",
			name: name.trim(),
			address: address ? address.trim() : "",
			phone: phone ? phone.trim() : "",
			tax_rate: Number(tax_rate) || 0,
			service_charge: Number(service_charge) || 0,
			updated_at: now
		}).select().single();
		if (error) throw error;
		await logActivity(currentAdmin.email, "Mengubah Pengaturan Toko", `Nama: ${name}, PPN: ${tax_rate}%, Servis: ${service_charge}%`);
		return json({
			message: "Pengaturan toko berhasil diperbarui.",
			settings: updated
		});
	} catch (err) {
		return json({ message: err.message }, { status: 500 });
	}
}
//#endregion
export { GET, PUT };

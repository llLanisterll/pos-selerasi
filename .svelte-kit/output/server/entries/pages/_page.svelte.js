import { n as onDestroy } from "../../chunks/index-server.js";
import { A as writable, H as attr, O as derived, Q as fallback, U as escape_html, c as store_get, d as html, i as bind_props, l as stringify, n as attr_class, o as ensure_array_like, r as attr_style, u as unsubscribe_stores } from "../../chunks/dev.js";
import "../../chunks/index-server2.js";
import "../../chunks/confirmationStore.js";
var categories = writable([]);
var transactions = writable([]);
var totalBalance = derived([derived(transactions, ($transactions) => {
	return $transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + Number(t.amount), 0);
}), derived(transactions, ($transactions) => {
	return $transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + Number(t.amount), 0);
})], ([$totalIncome, $totalExpense]) => {
	return $totalIncome - $totalExpense;
});
var totalPortionsSold = derived(transactions, ($transactions) => {
	return $transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + (Number(t.quantity) || 0), 0);
});
function getCategoryStyle(categoryName, categoriesList) {
	const cat = categoriesList.find((c) => c.name.toLowerCase() === categoryName.toLowerCase());
	if (cat) return `${cat.bgClass} ${cat.textClass} ${cat.borderClass}`;
	return "bg-brand-100 text-warm-700 border-brand-200";
}
function getCategoryHex(categoryName, categoriesList) {
	const cat = categoriesList.find((c) => c.name.toLowerCase() === categoryName.toLowerCase());
	return cat ? cat.hex : "#71717a";
}
var products = writable([]);
//#endregion
//#region src/components/Sidebar.svelte
function Sidebar($$renderer, $$props) {
	let activeTab = fallback($$props["activeTab"], "Dashboard");
	const menuSections = [
		{
			title: "Menu Utama",
			items: [
				{
					name: "Dashboard",
					label: "Dashboard",
					icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>`
				},
				{
					name: "POS",
					label: "Mesin Kasir (POS)",
					icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 18 4.5H6a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 6 18.75Zm.75-12h.008v.008H6.75V6.75Zm0 3h.008v.008H6.75V9.75Zm0 3h.008v.008H6.75v-.008Z" /></svg>`
				},
				{
					name: "Products",
					label: "Menu Produk",
					icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615 3.001 3.001 0 0 1 4.5 0 3.001 3.001 0 0 0 4.5 0 3.001 3.001 0 0 1 4.5 0 3.001 3.001 0 0 0 3.75.615m-16.5 0a2.999 2.999 0 0 1-.224-2.356l1.39-4.867a3.001 3.001 0 0 1 2.91-2.127H19.5c1.336 0 2.502.88 2.91 2.127l1.39 4.867a2.999 2.999 0 0 1-.224 2.356" /></svg>`
				}
			]
		},
		{
			title: "Keuangan",
			items: [{
				name: "FinancialReport",
				label: "Laporan Keuangan",
				icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" /></svg>`
			}, {
				name: "History",
				label: "Riwayat Transaksi",
				icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>`
			}]
		},
		{
			title: "Lainnya",
			items: [{
				name: "Settings",
				label: "Pengaturan Kategori",
				icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.43l1.004-.827c.292-.24.437-.613.43-.991a6.936 6.936 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>`
			}]
		}
	];
	$$renderer.push(`<header class="md:hidden w-full bg-brand-100/90 backdrop-blur-md border-b border-brand-300/60 px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-sm"><div class="flex items-center space-x-2"><div class="w-8 h-8 bg-brand-500 border border-brand-600/40 flex items-center justify-center rounded-lg shadow-sm"><span class="text-warm-900 font-bold text-sm">S</span></div> <span class="text-lg font-bold text-warm-900">selerasi<span class="text-brand-700">.</span></span></div> <button class="p-1.5 text-warm-600 hover:text-warm-900 focus:outline-none bg-brand-200/60 border border-brand-300/60 rounded-md cursor-pointer active:scale-95 transition"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">`);
	$$renderer.push("<!--[-1-->");
	$$renderer.push(`<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"></path>`);
	$$renderer.push(`<!--]--></svg></button></header> `);
	$$renderer.push("<!--[-1-->");
	$$renderer.push(`<!--]--> <aside${attr_class(` fixed inset-y-0 left-0 z-40 bg-brand-100/95 backdrop-blur-md border-r border-brand-300/50 flex flex-col justify-between h-screen transition-all duration-300 md:sticky md:translate-x-0 shadow-lg ${stringify("-translate-x-full")} ${stringify("md:w-64")} w-64 `)}><button type="button" class="hidden md:flex absolute top-5 -right-3 z-50 w-6 h-6 rounded-full bg-brand-100 hover:bg-brand-200 border border-brand-300/60 text-warm-600 hover:text-warm-950 shadow-md items-center justify-center cursor-pointer transition-all duration-150 active:scale-90"${attr("title", "Tutup Sidebar")}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-3 h-3">`);
	$$renderer.push("<!--[-1-->");
	$$renderer.push(`<path stroke-linecap="round" stroke-linejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5"></path>`);
	$$renderer.push(`<!--]--></svg></button> <div class="flex flex-col flex-grow"><div${attr_class(`h-16 border-b border-brand-300/40 hidden md:flex items-center transition-all duration-300 ${stringify("px-4")}`)}><div class="flex items-center space-x-2.5 overflow-hidden"><div class="w-9 h-9 bg-brand-500 border border-brand-600/40 flex items-center justify-center rounded-xl shadow-sm shrink-0"><span class="text-warm-900 font-bold text-sm">S</span></div> `);
	$$renderer.push("<!--[0-->");
	$$renderer.push(`<div class="animate-fade-in whitespace-nowrap"><span class="text-xl font-bold tracking-tight text-warm-900">selerasi<span class="text-brand-700">.</span></span> <p class="text-[10px] text-warm-500 font-medium -mt-0.5 tracking-wide">Ricebowl Keuangan</p></div>`);
	$$renderer.push(`<!--]--></div></div> <nav class="flex-grow px-3 py-6 space-y-6 overflow-y-auto"><!--[-->`);
	const each_array = ensure_array_like(menuSections);
	for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
		let section = each_array[$$index_1];
		$$renderer.push(`<div class="space-y-1.5">`);
		$$renderer.push("<!--[0-->");
		$$renderer.push(`<h3 class="px-4 text-[10px] font-bold text-warm-400 uppercase tracking-widest animate-fade-in mb-2">${escape_html(section.title)}</h3>`);
		$$renderer.push(`<!--]--> <!--[-->`);
		const each_array_1 = ensure_array_like(section.items);
		for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
			let item = each_array_1[$$index];
			$$renderer.push(`<button${attr_class(` w-full flex items-center py-2.5 text-xs font-semibold rounded-xl transition-all duration-150 cursor-pointer relative group ${stringify("space-x-3 px-4")} ${stringify(activeTab === item.name ? "bg-brand-500 text-warm-900 shadow-sm border border-brand-600/30" : "text-warm-600 hover:text-warm-900 hover:bg-brand-200/70 border border-transparent")} `)}${attr("title", "")}>`);
			if (activeTab === item.name) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="absolute left-0 w-1 h-5 bg-brand-800 rounded-r-full"></div>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> <div${attr_class(` transition-colors duration-150 shrink-0 ${stringify(activeTab === item.name ? "text-warm-800" : "text-warm-400 group-hover:text-warm-700")} `)}>${html(item.icon)}</div> `);
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<span class="tracking-wide animate-fade-in whitespace-nowrap">${escape_html(item.label)}</span>`);
			$$renderer.push(`<!--]--></button>`);
		}
		$$renderer.push(`<!--]--></div>`);
	}
	$$renderer.push(`<!--]--></nav></div> <div${attr_class(`border-t border-brand-300/40 bg-brand-200/40 shrink-0 transition-all duration-300 ${stringify("p-3")}`)}><div${attr_class(`flex items-center bg-brand-500/50 rounded-xl border border-brand-400/50 transition-all duration-300 ${stringify("space-x-3 p-2")}`)}><div class="w-9 h-9 bg-brand-600 border border-brand-700/40 rounded-full flex items-center justify-center select-none shadow-sm shrink-0"><span class="text-xs font-bold text-warm-900">SS</span></div> `);
	$$renderer.push("<!--[0-->");
	$$renderer.push(`<div class="min-w-0 flex-1 animate-fade-in whitespace-nowrap overflow-hidden"><p class="text-xs font-bold text-warm-900 truncate">Sarham San</p> <p class="text-[10px] text-brand-800 font-semibold tracking-wide uppercase mt-0.5">Selerasi Owner</p></div>`);
	$$renderer.push(`<!--]--></div></div></aside>`);
	bind_props($$props, { activeTab });
}
//#endregion
//#region src/components/Dashboard.svelte
function Dashboard($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let greeting, greetingEmoji, timeStr, dateStr, todayTxs, todayIncome, todayExpense, todayPortions, trendDays, chartMax, incomePoints, expensePoints, incomeArea, expenseArea, thisMonth, monthExpenses, catBreakdown, recentTxs, expenseCats;
		let activeTab = fallback($$props["activeTab"], "Dashboard");
		let now = /* @__PURE__ */ new Date();
		let clockInterval;
		onDestroy(() => clearInterval(clockInterval));
		function formatRupiah(v) {
			return new Intl.NumberFormat("id-ID", {
				style: "currency",
				currency: "IDR",
				minimumFractionDigits: 0
			}).format(v);
		}
		function formatRupiahShort(v) {
			if (v >= 1e6) return `${(v / 1e6).toFixed(1)}jt`;
			if (v >= 1e3) return `${(v / 1e3).toFixed(0)}rb`;
			return String(Math.round(v));
		}
		function formatDate(d) {
			if (!d) return "";
			return new Intl.DateTimeFormat("id-ID", {
				day: "numeric",
				month: "short",
				year: "numeric"
			}).format(new Date(d));
		}
		function todayStr() {
			return (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
		}
		const CHART_W = 480;
		const CHART_H = 140;
		const PAD_L = 48;
		const PAD_B = 28;
		const PAD_R = 12;
		const PAD_T = 10;
		const innerW = CHART_W - PAD_L - PAD_R;
		const innerH = CHART_H - PAD_B - PAD_T;
		function chartX(i) {
			return PAD_L + i / 6 * innerW;
		}
		function chartY(v) {
			return PAD_T + innerH - v / chartMax * innerH;
		}
		let formCategory = "";
		todayStr();
		$: greeting = (() => {
			const h = now.getHours();
			if (h < 5) return "Selamat Malam";
			if (h < 11) return "Selamat Pagi";
			if (h < 15) return "Selamat Siang";
			if (h < 19) return "Selamat Sore";
			return "Selamat Malam";
		})();
		$: greetingEmoji = (() => {
			const h = now.getHours();
			if (h < 5) return "🌙";
			if (h < 11) return "☀️";
			if (h < 15) return "🌤️";
			if (h < 19) return "🌇";
			return "🌙";
		})();
		$: timeStr = now.toLocaleTimeString("id-ID", {
			hour: "2-digit",
			minute: "2-digit"
		});
		$: dateStr = now.toLocaleDateString("id-ID", {
			weekday: "long",
			day: "numeric",
			month: "long",
			year: "numeric"
		});
		$: todayTxs = store_get($$store_subs ??= {}, "$transactions", transactions).filter((t) => t.date === todayStr());
		$: todayIncome = todayTxs.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
		$: todayExpense = todayTxs.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
		$: todayPortions = todayTxs.filter((t) => t.type === "income").reduce((s, t) => s + (Number(t.quantity) || 0), 0);
		$: trendDays = (() => {
			const days = [];
			for (let i = 6; i >= 0; i--) {
				const d = /* @__PURE__ */ new Date();
				d.setDate(d.getDate() - i);
				const ds = d.toISOString().split("T")[0];
				const dayTxs = store_get($$store_subs ??= {}, "$transactions", transactions).filter((t) => t.date === ds);
				days.push({
					label: d.toLocaleDateString("id-ID", {
						weekday: "short",
						day: "numeric"
					}),
					date: ds,
					income: dayTxs.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0),
					expense: dayTxs.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0)
				});
			}
			return days;
		})();
		$: chartMax = Math.max(...trendDays.map((d) => Math.max(d.income, d.expense)), 1e5);
		$: incomePoints = trendDays.map((d, i) => `${chartX(i)},${chartY(d.income)}`).join(" ");
		$: expensePoints = trendDays.map((d, i) => `${chartX(i)},${chartY(d.expense)}`).join(" ");
		$: incomeArea = `M${chartX(0)},${chartY(trendDays[0]?.income ?? 0)} ` + trendDays.map((d, i) => `L${chartX(i)},${chartY(d.income)}`).join(" ") + ` L${chartX(6)},${PAD_T + innerH} L${chartX(0)},${PAD_T + innerH} Z`;
		$: expenseArea = `M${chartX(0)},${chartY(trendDays[0]?.expense ?? 0)} ` + trendDays.map((d, i) => `L${chartX(i)},${chartY(d.expense)}`).join(" ") + ` L${chartX(6)},${PAD_T + innerH} L${chartX(0)},${PAD_T + innerH} Z`;
		$: thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
		$: monthExpenses = store_get($$store_subs ??= {}, "$transactions", transactions).filter((t) => t.type === "expense" && t.date?.startsWith(thisMonth));
		$: catBreakdown = (() => {
			const map = {};
			monthExpenses.forEach((t) => {
				const catName = t.category || "Lainnya";
				map[catName] = (map[catName] || 0) + Number(t.amount);
			});
			const total = Object.values(map).reduce((s, v) => s + v, 0) || 1;
			return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, amount]) => ({
				name,
				amount,
				pct: amount / total * 100
			}));
		})();
		$: recentTxs = [...store_get($$store_subs ??= {}, "$transactions", transactions)].sort((a, b) => {
			const dateA = a.date || "";
			const dateB = b.date || "";
			if (dateA !== dateB) return dateB.localeCompare(dateA);
			const timeA = a.created_at || "";
			const timeB = b.created_at || "";
			if (timeA !== timeB) return timeB.localeCompare(timeA);
			return String(b.id).localeCompare(String(a.id));
		}).slice(0, 10);
		$: expenseCats = store_get($$store_subs ??= {}, "$categories", categories).filter((c) => c.type === "expense");
		$: if (expenseCats.length > 0 && !formCategory) formCategory = expenseCats[0].name;
		$$renderer.push(`<div class="space-y-6 animate-fade-in"><div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"><div><div class="flex items-center gap-2 mb-1"><span class="text-2xl">${escape_html(greetingEmoji)}</span> <h1 class="text-2xl font-bold tracking-tight text-warm-900">${escape_html(greeting)}, Selerasi!</h1></div> <p class="text-sm text-warm-500 flex items-center gap-1.5"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3.5 h-3.5 flex-shrink-0"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"></path></svg> ${escape_html(dateStr)} <span class="text-warm-300 mx-1">·</span> <span class="font-mono font-semibold text-warm-700">${escape_html(timeStr)}</span></p></div> <button class="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-700 hover:bg-brand-800 active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-md transition-all duration-150 cursor-pointer self-start sm:self-auto"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"></path></svg> ${escape_html("Catat Pengeluaran")}</button></div> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <div class="grid grid-cols-2 md:grid-cols-4 gap-4"><div${attr_class(`col-span-2 md:col-span-1 bg-white/80 backdrop-blur-sm border ${stringify(store_get($$store_subs ??= {}, "$totalBalance", totalBalance) < 0 ? "border-rose-200 bg-rose-50/60" : "border-brand-300/60")} rounded-2xl p-5 shadow-sm`)}><div class="flex items-start justify-between mb-3"><span${attr_class(`text-xs font-bold uppercase tracking-wider ${stringify(store_get($$store_subs ??= {}, "$totalBalance", totalBalance) < 0 ? "text-rose-500" : "text-warm-500")}`)}>Saldo Bersih</span></div> <div${attr_class(`text-2xl font-extrabold ${stringify(store_get($$store_subs ??= {}, "$totalBalance", totalBalance) < 0 ? "text-rose-600" : "text-warm-900")} tracking-tight leading-none mb-2`)}>${escape_html(formatRupiah(store_get($$store_subs ??= {}, "$totalBalance", totalBalance)))}</div> <p class="text-xs text-warm-400">Akumulasi saldo keseluruhan</p></div> <div class="bg-white/80 backdrop-blur-sm border border-brand-300/60 rounded-2xl p-5 shadow-sm"><div class="flex items-start justify-between mb-3"><span class="text-xs font-bold uppercase tracking-wider text-warm-500">Masuk Hari Ini</span></div> <div class="text-xl font-extrabold text-warm-900 tracking-tight leading-none mb-2">${escape_html(formatRupiah(todayIncome))}</div> <p class="text-xs text-warm-400">${escape_html(todayTxs.filter((t) => t.type === "income").length)} transaksi</p></div> <div class="bg-white/80 backdrop-blur-sm border border-brand-300/60 rounded-2xl p-5 shadow-sm"><div class="flex items-start justify-between mb-3"><span class="text-xs font-bold uppercase tracking-wider text-warm-500">Keluar Hari Ini</span></div> <div class="text-xl font-extrabold text-warm-900 tracking-tight leading-none mb-2">${escape_html(formatRupiah(todayExpense))}</div> <p class="text-xs text-warm-400">${escape_html(todayTxs.filter((t) => t.type === "expense").length)} transaksi</p></div> <div class="bg-white/80 backdrop-blur-sm border border-brand-300/60 rounded-2xl p-5 shadow-sm"><div class="flex items-start justify-between mb-3"><span class="text-xs font-bold uppercase tracking-wider text-warm-500">Porsi Hari Ini</span></div> <div class="text-xl font-extrabold text-warm-900 tracking-tight leading-none mb-2">${escape_html(todayPortions)} <span class="text-sm font-medium text-warm-400">porsi</span></div> <p class="text-xs text-warm-400">Total ${escape_html(store_get($$store_subs ??= {}, "$totalPortionsSold", totalPortionsSold))} porsi</p></div></div> <div class="grid grid-cols-1 md:grid-cols-3 gap-6"><div class="md:col-span-2 bg-white/80 backdrop-blur-sm border border-brand-300/60 rounded-2xl p-5 shadow-sm"><div class="flex items-center justify-between mb-5"><h2 class="text-sm font-bold text-warm-900">Tren Arus Kas 7 Hari</h2></div> <div class="w-full overflow-hidden"><svg${attr("viewBox", `0 0 ${stringify(CHART_W)} ${stringify(CHART_H)}`)} class="w-full h-auto select-none" preserveAspectRatio="none"><defs><linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#c4994f" stop-opacity="0.18"></stop><stop offset="100%" stop-color="#c4994f" stop-opacity="0"></stop></linearGradient><linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f43f5e" stop-opacity="0.12"></stop><stop offset="100%" stop-color="#f43f5e" stop-opacity="0"></stop></linearGradient></defs><!--[-->`);
		const each_array_1 = ensure_array_like([
			0,
			.25,
			.5,
			.75,
			1
		]);
		for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
			let ratio = each_array_1[$$index_1];
			const y = PAD_T + innerH - ratio * innerH;
			$$renderer.push(`<line${attr("x1", PAD_L)}${attr("y1", y)}${attr("x2", CHART_W - PAD_R)}${attr("y2", y)} stroke="#e8e3da" stroke-dasharray="3" stroke-width="1"></line><text${attr("x", PAD_L - 4)}${attr("y", y + 3)} text-anchor="end" font-size="7" fill="#b0aa9e">${escape_html(formatRupiahShort(ratio * chartMax))}</text>`);
		}
		$$renderer.push(`<!--]--><path${attr("d", incomeArea)} fill="url(#incomeGrad)"></path><path${attr("d", expenseArea)} fill="url(#expenseGrad)"></path><polyline${attr("points", incomePoints)} fill="none" stroke="#c4994f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></polyline><polyline${attr("points", expensePoints)} fill="none" stroke="#f43f5e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></polyline><!--[-->`);
		const each_array_2 = ensure_array_like(trendDays);
		for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
			let d = each_array_2[i];
			$$renderer.push(`<circle${attr("cx", chartX(i))}${attr("cy", chartY(d.income))} r="3" fill="#c4994f" stroke="#fffef9" stroke-width="1"></circle><circle${attr("cx", chartX(i))}${attr("cy", chartY(d.expense))} r="3" fill="#f43f5e" stroke="#fffef9" stroke-width="1"></circle><text${attr("x", chartX(i))}${attr("y", CHART_H - 4)} text-anchor="middle" font-size="7.5" fill="#8a8276">${escape_html(d.label)}</text>`);
		}
		$$renderer.push(`<!--]--></svg></div></div> <div class="bg-white/80 backdrop-blur-sm border border-brand-300/60 rounded-2xl p-5 shadow-sm"><div class="mb-5"><h2 class="text-sm font-bold text-warm-900">Kategori Pengeluaran</h2> <p class="text-xs text-warm-400 mt-0.5">Rincian pengeluaran bulan ini</p></div> `);
		if (catBreakdown.length === 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="flex flex-col items-center justify-center py-12 text-center text-warm-400"><p class="text-xs">Tidak ada pengeluaran bulan ini.</p></div>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="space-y-4"><!--[-->`);
			const each_array_3 = ensure_array_like(catBreakdown);
			for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
				let cat = each_array_3[$$index_3];
				$$renderer.push(`<div class="space-y-1.5"><div class="flex items-center justify-between text-xs"><span class="font-semibold text-warm-700 truncate pr-2">${escape_html(cat.name)}</span> <span class="font-bold text-warm-600 flex-shrink-0">${escape_html(cat.pct.toFixed(0))}%</span></div> <div class="flex items-center gap-2"><div class="flex-1 h-1.5 bg-brand-100 rounded-full overflow-hidden"><div class="h-full rounded-full transition-all duration-500"${attr_style(`width: ${stringify(cat.pct)}%; background-color: ${stringify(getCategoryHex(cat.name, store_get($$store_subs ??= {}, "$categories", categories)))}`)}></div></div></div> <span class="text-[10px] text-warm-400 block">${escape_html(formatRupiah(cat.amount))}</span></div>`);
			}
			$$renderer.push(`<!--]--></div>`);
		}
		$$renderer.push(`<!--]--></div></div> <div class="bg-white/80 backdrop-blur-sm border border-brand-300/60 rounded-2xl p-5 shadow-sm"><div class="flex items-center justify-between mb-4"><h2 class="text-sm font-bold text-warm-900">Transaksi Terbaru</h2> <button class="text-xs font-bold text-brand-700 hover:underline">Lihat Semua</button></div> <div class="divide-y divide-brand-200/50"><!--[-->`);
		const each_array_4 = ensure_array_like(recentTxs);
		for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
			let tx = each_array_4[$$index_4];
			$$renderer.push(`<div class="py-3 flex items-center justify-between group"><div class="flex flex-col min-w-0 pr-4"><span class="text-xs font-semibold text-warm-800 truncate">${escape_html(tx.description)}</span> <div class="flex items-center gap-2 mt-0.5"><span class="text-[10px] text-warm-400">${escape_html(formatDate(tx.date))}</span> `);
			if (tx.type === "expense") {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<span${attr_class(`text-[9px] px-1.5 py-0.2 border rounded font-bold uppercase select-none ${stringify(getCategoryStyle(tx.category, store_get($$store_subs ??= {}, "$categories", categories)))}`)}>${escape_html(tx.category || "Lainnya")}</span>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></div></div> <div class="flex items-center gap-3"><span${attr_class(`text-sm font-bold ${stringify(tx.type === "income" ? "text-emerald-600" : "text-rose-500")}`)}>${escape_html(tx.type === "income" ? "+" : "-")}${escape_html(formatRupiah(tx.amount))}</span> <button class="text-warm-300 hover:text-rose-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3.5 h-3.5"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.34 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"></path></svg></button></div></div>`);
		}
		$$renderer.push(`<!--]--></div></div></div>`);
		if ($$store_subs) unsubscribe_stores($$store_subs);
		bind_props($$props, { activeTab });
	});
}
//#endregion
//#region src/components/SalesReport.svelte
function SalesReport($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let salesTransactions, filteredSalesTransactions, totalSalesRevenue, totalPortionsSold, avgPricePerPortion, menuRanking, paymentBreakdown, maxPortions, dailyTrendData, monthlyTrendData, activeTrendData, chartMax, chartPoints, pathData, areaPathData;
		let filterType = "monthly";
		let selectedDate = "";
		let selectedMonth = "";
		function formatRupiah(value) {
			return new Intl.NumberFormat("id-ID", {
				style: "currency",
				currency: "IDR",
				minimumFractionDigits: 0,
				maximumFractionDigits: 0
			}).format(value);
		}
		function formatRupiahShort(value) {
			if (value >= 1e6) return `Rp ${(value / 1e6).toFixed(1).replace(".0", "")} Jt`;
			else if (value >= 1e3) return `Rp ${(value / 1e3).toFixed(0)} K`;
			return `Rp ${value}`;
		}
		function formatDate(dateStr) {
			if (!dateStr) return "";
			try {
				const date = new Date(dateStr);
				return new Intl.DateTimeFormat("id-ID", {
					day: "numeric",
					month: "long",
					year: "numeric"
				}).format(date);
			} catch (e) {
				return dateStr;
			}
		}
		function formatMonth(monthStr) {
			if (!monthStr) return "";
			try {
				const [year, month] = monthStr.split("-");
				const date = new Date(year, month - 1, 1);
				return new Intl.DateTimeFormat("id-ID", {
					month: "long",
					year: "numeric"
				}).format(date);
			} catch (e) {
				return monthStr;
			}
		}
		$: salesTransactions = store_get($$store_subs ??= {}, "$transactions", transactions).filter((t) => t.type === "income");
		$: filteredSalesTransactions = salesTransactions.filter((t) => {
			if (filterType === "daily") return t.date === selectedDate;
			else return t.date && t.date.startsWith(selectedMonth);
		});
		$: totalSalesRevenue = filteredSalesTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
		$: totalPortionsSold = filteredSalesTransactions.reduce((sum, t) => sum + (Number(t.quantity) || 0), 0);
		$: avgPricePerPortion = totalPortionsSold > 0 ? totalSalesRevenue / totalPortionsSold : 0;
		$: menuRanking = (() => {
			const map = {};
			filteredSalesTransactions.forEach((t) => {
				const name = t.description;
				const qty = Number(t.quantity) || 0;
				const rev = Number(t.amount);
				if (!map[name]) map[name] = {
					name,
					portions: 0,
					revenue: 0,
					count: 0
				};
				map[name].portions += qty;
				map[name].revenue += rev;
				map[name].count += 1;
			});
			const list = Object.values(map);
			list.sort((a, b) => b.portions - a.portions);
			return list;
		})();
		$: paymentBreakdown = (() => {
			const map = {};
			filteredSalesTransactions.forEach((t) => {
				const method = t.payment_method || "Tunai";
				const rev = Number(t.amount);
				if (!map[method]) map[method] = {
					method,
					revenue: 0,
					count: 0
				};
				map[method].revenue += rev;
				map[method].count += 1;
			});
			const list = Object.values(map);
			const totalRev = list.reduce((sum, item) => sum + item.revenue, 0);
			const result = list.map((item) => ({
				...item,
				percentage: totalRev > 0 ? item.revenue / totalRev * 100 : 0
			}));
			result.sort((a, b) => b.revenue - a.revenue);
			return result;
		})();
		$: maxPortions = menuRanking.length > 0 ? menuRanking[0].portions : 1;
		$: dailyTrendData = [];
		$: monthlyTrendData = [];
		$: activeTrendData = filterType === "daily" ? dailyTrendData : monthlyTrendData;
		$: chartMax = Math.max(...activeTrendData.map((d) => d.revenue), 1e4);
		$: chartPoints = activeTrendData.map((d, i) => {
			return {
				x: 50 + i * (430 / (activeTrendData.length - 1 || 1)),
				y: 170 - d.revenue / chartMax * 140,
				...d
			};
		});
		$: pathData = chartPoints.map((p) => `${p.x},${p.y}`).join(" ");
		$: areaPathData = chartPoints.length > 0 ? `50,170 ${pathData} ${chartPoints[chartPoints.length - 1].x},170` : "";
		$$renderer.push(`<div class="space-y-6 animate-fade-in"><div class="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-brand-300/60 gap-4"><div><h1 class="text-2xl font-bold tracking-tight text-warm-900">Laporan Analisis Penjualan</h1> <p class="text-sm text-warm-500 mt-1">Pantau performa penjualan menu Ricebowl, omzet operasional, dan tren pembayaran outlet Selerasi.</p></div> <div class="flex border border-brand-300/60 rounded-xl overflow-hidden p-0.5 bg-brand-50 self-start md:self-auto"><button type="button"${attr_class(`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 cursor-pointer ${stringify(filterType === "daily" ? "bg-brand-500 text-warm-900 shadow-sm border border-brand-600/30" : "text-warm-500 hover:text-warm-900 bg-transparent border-0")}`)}>Laporan Harian</button> <button type="button"${attr_class(`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 cursor-pointer ${stringify(filterType === "monthly" ? "bg-brand-500 text-warm-900 shadow-sm border border-brand-600/30" : "text-warm-500 hover:text-warm-900 bg-transparent border-0")}`)}>Laporan Bulanan</button></div></div> <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white/70 backdrop-blur-sm border border-brand-300/60 rounded-2xl p-4 gap-4 shadow-sm"><div class="flex items-center space-x-3"><div class="p-2 bg-brand-200/70 border border-brand-300/50 rounded-xl text-brand-800"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"></path></svg></div> <div><h2 class="text-sm font-bold text-warm-900">${escape_html(filterType === "daily" ? "Filter Penjualan Harian" : "Filter Penjualan Bulanan")}</h2> <p class="text-xs text-warm-500 mt-0.5">${escape_html(filterType === "daily" ? formatDate(selectedDate) : formatMonth(selectedMonth))}</p></div></div> <div class="flex items-center space-x-2 self-end sm:self-center">`);
		if (filterType === "daily") {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<button title="Hari Sebelumnya" class="p-2 bg-brand-100 border border-brand-300/60 hover:border-brand-500 hover:bg-brand-200 rounded-xl text-warm-600 hover:text-warm-900 transition duration-150 cursor-pointer active:scale-95"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5"></path></svg></button> <input type="date"${attr("value", selectedDate)} class="bg-brand-100 border border-brand-300/60 focus:border-brand-600 rounded-xl px-3 py-1.5 text-xs text-warm-900 focus:outline-none"/> <button title="Hari Berikutnya" class="p-2 bg-brand-100 border border-brand-300/60 hover:border-brand-500 hover:bg-brand-200 rounded-xl text-warm-600 hover:text-warm-900 transition duration-150 cursor-pointer active:scale-95"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5"></path></svg></button> <button class="px-3 py-1.5 bg-brand-500 border border-brand-600/40 hover:bg-brand-600 rounded-xl text-xs font-semibold text-warm-900 transition duration-150 cursor-pointer active:scale-95">Hari Ini</button>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<button title="Bulan Sebelumnya" class="p-2 bg-brand-100 border border-brand-300/60 hover:border-brand-500 hover:bg-brand-200 rounded-xl text-warm-600 hover:text-warm-900 transition duration-150 cursor-pointer active:scale-95"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5"></path></svg></button> <input type="month"${attr("value", selectedMonth)} class="bg-brand-100 border border-brand-300/60 focus:border-brand-600 rounded-xl px-3 py-1.5 text-xs text-warm-900 focus:outline-none"/> <button title="Bulan Berikutnya" class="p-2 bg-brand-100 border border-brand-300/60 hover:border-brand-500 hover:bg-brand-200 rounded-xl text-warm-600 hover:text-warm-900 transition duration-150 cursor-pointer active:scale-95"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5"></path></svg></button> <button class="px-3 py-1.5 bg-brand-500 border border-brand-600/40 hover:bg-brand-600 rounded-xl text-xs font-semibold text-warm-900 transition duration-150 cursor-pointer active:scale-95">Bulan Ini</button>`);
		}
		$$renderer.push(`<!--]--></div></div> <div class="grid grid-cols-1 md:grid-cols-3 gap-5"><div class="bg-white/70 backdrop-blur-sm border border-brand-300/60 p-5 rounded-2xl flex flex-col justify-between transition-all duration-200 hover:border-brand-500 hover:shadow-md"><div><span class="text-xs font-semibold uppercase tracking-wider text-brand-800">Omzet Penjualan</span> <h3 class="text-2xl font-bold tracking-tight text-brand-800 mt-2">${escape_html(formatRupiah(totalSalesRevenue))}</h3></div> <div class="mt-4 flex items-center space-x-2"><div class="w-2 h-2 rounded-full bg-brand-700"></div> <span class="text-xs text-warm-500">Pendapatan kotor dari menu ricebowl</span></div></div> <div class="bg-white/70 backdrop-blur-sm border border-brand-300/60 p-5 rounded-2xl flex flex-col justify-between transition-all duration-200 hover:border-amber-400 hover:shadow-md"><div><span class="text-xs font-semibold uppercase tracking-wider text-amber-600">Porsi Ricebowl Terjual</span> <h3 class="text-2xl font-bold tracking-tight text-amber-600 mt-2">${escape_html(totalPortionsSold)} <span class="text-xs font-bold text-warm-400 lowercase tracking-wide ml-1">porsi</span></h3></div> <div class="mt-4 flex items-center space-x-2"><div class="w-2 h-2 rounded-full bg-amber-500"></div> <span class="text-xs text-warm-500">Total mangkuk makanan terjual</span></div></div> <div class="bg-white/70 backdrop-blur-sm border border-brand-300/60 p-5 rounded-2xl flex flex-col justify-between transition-all duration-200 hover:border-blue-300 hover:shadow-md"><div><span class="text-xs font-semibold uppercase tracking-wider text-blue-600">Rata-Rata per Porsi</span> <h3 class="text-2xl font-bold tracking-tight text-blue-600 mt-2">${escape_html(formatRupiah(avgPricePerPortion))}</h3></div> <div class="mt-4 flex items-center space-x-2"><div class="w-2 h-2 rounded-full bg-blue-500"></div> <span class="text-xs text-warm-500">Nilai transaksi rata-rata porsi terjual</span></div></div></div> <div class="bg-white/70 backdrop-blur-sm border border-brand-300/60 rounded-2xl p-5 shadow-sm w-full"><div class="pb-4 border-b border-brand-200/60 mb-6 flex items-center justify-between"><div><h3 class="text-sm font-semibold tracking-tight text-warm-900">${escape_html(filterType === "daily" ? "Grafik Jam Penjualan Harian" : "Grafik Tren Penjualan Bulanan")}</h3> <p class="text-[10px] text-warm-500 mt-0.5">${escape_html(filterType === "daily" ? `Statistik omzet per jam operasional pada ${formatDate(selectedDate)}` : `Statistik omzet harian sepanjang bulan ${formatMonth(selectedMonth)}`)}</p></div></div> <div class="w-full relative min-h-[200px] flex items-center justify-center">`);
		if (activeTrendData.length === 0 || chartMax <= 1e4) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="text-center py-12"><p class="text-xs text-warm-400">Tidak ada data transaksi penjualan pada periode ini.</p></div>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="w-full"><svg viewBox="0 0 500 200" class="w-full h-auto select-none" preserveAspectRatio="none"><defs><linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#c4994f" stop-opacity="0.20"></stop><stop offset="100%" stop-color="#c4994f" stop-opacity="0.00"></stop></linearGradient></defs><!--[-->`);
			const each_array = ensure_array_like([
				0,
				.25,
				.5,
				.75,
				1
			]);
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let ratio = each_array[$$index];
				const y = 170 - ratio * 140;
				$$renderer.push(`<line x1="50"${attr("y1", y)} x2="480"${attr("y2", y)} stroke="#d5d1c8" stroke-dasharray="3" stroke-width="1"></line><text x="42"${attr("y", y + 3)} text-anchor="end" class="fill-warm-400 text-[8px] font-semibold">${escape_html(formatRupiahShort(ratio * chartMax))}</text>`);
			}
			$$renderer.push(`<!--]-->`);
			if (areaPathData) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<polygon${attr("points", areaPathData)} fill="url(#trendGrad)"></polygon>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]-->`);
			if (pathData) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<polyline${attr("points", pathData)} fill="none" stroke="#9a7331" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></polyline>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--><!--[-->`);
			const each_array_1 = ensure_array_like(chartPoints);
			for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
				let pt = each_array_1[index];
				$$renderer.push(`<circle${attr("cx", pt.x)}${attr("cy", pt.y)} r="4.5" fill="#c4994f" stroke="#fffef9" stroke-width="1.5"><title>${escape_html(pt.label)}: ${escape_html(formatRupiah(pt.revenue))}</title></circle>`);
				if (filterType === "daily" || index === 0 || index === chartPoints.length - 1 || (index + 1) % 5 === 0) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<text${attr("x", pt.x)} y="188" text-anchor="middle" class="fill-warm-500 text-[8.5px] font-bold">${escape_html(pt.label)}</text>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]-->`);
			}
			$$renderer.push(`<!--]--><line x1="50" y1="30" x2="50" y2="170" stroke="#d5d1c8" stroke-width="1"></line><line x1="50" y1="170" x2="480" y2="170" stroke="#d5d1c8" stroke-width="1"></line></svg></div>`);
		}
		$$renderer.push(`<!--]--></div></div> <div class="grid grid-cols-1 md:grid-cols-3 gap-8 items-start"><div class="bg-white/70 backdrop-blur-sm border border-brand-300/60 rounded-2xl p-6 md:col-span-2 shadow-sm"><h3 class="text-sm font-semibold text-warm-900 pb-3 border-b border-brand-200/60 mb-5">Peringkat Menu Ricebowl Terlaris</h3> `);
		if (menuRanking.length === 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="py-16 text-center"><p class="text-sm text-warm-400">Tidak ada data transaksi penjualan pada periode ini.</p></div>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="space-y-5"><!--[-->`);
			const each_array_2 = ensure_array_like(menuRanking);
			for (let index = 0, $$length = each_array_2.length; index < $$length; index++) {
				let item = each_array_2[index];
				$$renderer.push(`<div class="space-y-2"><div class="flex items-center justify-between text-xs"><div class="flex items-center space-x-2.5"><span class="w-5 h-5 flex items-center justify-center bg-brand-200 border border-brand-300 rounded text-[10px] font-bold text-warm-700 select-none">#${escape_html(index + 1)}</span> <span class="font-semibold text-warm-800">${escape_html(item.name)}</span></div> <div class="text-right font-semibold"><span class="text-warm-700">${escape_html(item.portions)} porsi</span> <span class="text-warm-400 text-[10px] ml-2">(${escape_html(formatRupiah(item.revenue))})</span></div></div> <div class="w-full h-2.5 bg-brand-100 border border-brand-200 rounded-full overflow-hidden"><div class="h-full rounded-full transition-all duration-300"${attr_style(`width: ${stringify(item.portions / maxPortions * 100)}%; background: linear-gradient(90deg, #c4994f 0%, #9a7331 100%)`)}></div></div></div>`);
			}
			$$renderer.push(`<!--]--></div>`);
		}
		$$renderer.push(`<!--]--></div> <div class="bg-white/70 backdrop-blur-sm border border-brand-300/60 rounded-2xl p-6 md:col-span-1 shadow-sm"><h3 class="text-sm font-semibold text-warm-900 pb-3 border-b border-brand-200/60 mb-5">Omzet Berdasarkan Metode Pembayaran</h3> `);
		if (paymentBreakdown.length === 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="py-16 text-center"><p class="text-sm text-warm-400">Tidak ada data transaksi penjualan pada periode ini.</p></div>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="space-y-5"><!--[-->`);
			const each_array_3 = ensure_array_like(paymentBreakdown);
			for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
				let item = each_array_3[$$index_3];
				$$renderer.push(`<div class="space-y-1.5"><div class="flex items-center justify-between text-xs font-semibold"><span class="px-2 py-0.5 border border-brand-300 bg-brand-100 rounded text-[9px] text-warm-700 select-none uppercase tracking-wide">${escape_html(item.method)}</span> <span class="text-warm-700 font-medium">${escape_html(formatRupiah(item.revenue))} <span class="text-[10px] font-bold text-warm-400 ml-1">(${escape_html(item.percentage.toFixed(1))}%)</span></span></div> <div class="w-full h-1.5 bg-brand-100 border border-brand-200 rounded-full overflow-hidden"><div class="h-full rounded-full transition-all duration-300"${attr_style(`width: ${stringify(item.percentage)}%; background-color: ${stringify(item.method === "QRIS" ? "#9a7331" : item.method === "Tunai" ? "#8a8276" : item.method === "Transfer Bank" ? "#3b82f6" : "#8b5cf6")}`)}></div></div></div>`);
			}
			$$renderer.push(`<!--]--></div>`);
		}
		$$renderer.push(`<!--]--></div></div></div>`);
		if ($$store_subs) unsubscribe_stores($$store_subs);
	});
}
//#endregion
//#region src/components/ExpenseReport.svelte
function ExpenseReport($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let expenseTransactions, filteredExpenseTransactions, totalExpenseValue, transactionCount, avgExpensePerTx, categoryBreakdown, topExpenses, maxCategoryAmount, dailyTrendData, monthlyTrendData, activeTrendData, chartMax, chartPoints, pathData, areaPathData;
		let filterType = "monthly";
		let selectedDate = "";
		let selectedMonth = "";
		function formatRupiah(value) {
			return new Intl.NumberFormat("id-ID", {
				style: "currency",
				currency: "IDR",
				minimumFractionDigits: 0,
				maximumFractionDigits: 0
			}).format(value);
		}
		function formatRupiahShort(value) {
			if (value >= 1e6) return `Rp ${(value / 1e6).toFixed(1).replace(".0", "")} Jt`;
			else if (value >= 1e3) return `Rp ${(value / 1e3).toFixed(0)} K`;
			return `Rp ${value}`;
		}
		function formatDate(dateStr) {
			if (!dateStr) return "";
			try {
				const date = new Date(dateStr);
				return new Intl.DateTimeFormat("id-ID", {
					day: "numeric",
					month: "long",
					year: "numeric"
				}).format(date);
			} catch (e) {
				return dateStr;
			}
		}
		function formatMonth(monthStr) {
			if (!monthStr) return "";
			try {
				const [year, month] = monthStr.split("-");
				const date = new Date(year, month - 1, 1);
				return new Intl.DateTimeFormat("id-ID", {
					month: "long",
					year: "numeric"
				}).format(date);
			} catch (e) {
				return monthStr;
			}
		}
		$: expenseTransactions = store_get($$store_subs ??= {}, "$transactions", transactions).filter((t) => t.type === "expense");
		$: filteredExpenseTransactions = expenseTransactions.filter((t) => {
			if (filterType === "daily") return t.date === selectedDate;
			else return t.date && t.date.startsWith(selectedMonth);
		});
		$: totalExpenseValue = filteredExpenseTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
		$: transactionCount = filteredExpenseTransactions.length;
		$: avgExpensePerTx = transactionCount > 0 ? totalExpenseValue / transactionCount : 0;
		$: categoryBreakdown = (() => {
			const map = {};
			filteredExpenseTransactions.forEach((t) => {
				const name = t.category || "Lainnya";
				const rev = Number(t.amount);
				if (!map[name]) map[name] = {
					name,
					amount: 0,
					count: 0
				};
				map[name].amount += rev;
				map[name].count += 1;
			});
			const list = Object.values(map);
			list.sort((a, b) => b.amount - a.amount);
			return list;
		})();
		$: topExpenses = [...filteredExpenseTransactions].sort((a, b) => b.amount - a.amount).slice(0, 10);
		$: maxCategoryAmount = categoryBreakdown.length > 0 ? categoryBreakdown[0].amount : 1;
		$: dailyTrendData = [];
		$: monthlyTrendData = [];
		$: activeTrendData = filterType === "daily" ? dailyTrendData : monthlyTrendData;
		$: chartMax = Math.max(...activeTrendData.map((d) => d.amount), 1e4);
		$: chartPoints = activeTrendData.map((d, i) => {
			return {
				x: 50 + i * (430 / (activeTrendData.length - 1 || 1)),
				y: 170 - d.amount / chartMax * 140,
				...d
			};
		});
		$: pathData = chartPoints.map((p) => `${p.x},${p.y}`).join(" ");
		$: areaPathData = chartPoints.length > 0 ? `50,170 ${pathData} ${chartPoints[chartPoints.length - 1].x},170` : "";
		$$renderer.push(`<div class="space-y-6 animate-fade-in"><div class="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-brand-300/60 gap-4"><div><h1 class="text-2xl font-bold tracking-tight text-warm-900">Laporan Analisis Pengeluaran</h1> <p class="text-sm text-warm-500 mt-1">Pantau biaya operasional, belanja bahan baku, dan pengeluaran lainnya.</p></div> <div class="flex border border-brand-300/60 rounded-xl overflow-hidden p-0.5 bg-brand-50 self-start md:self-auto"><button type="button"${attr_class(`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 cursor-pointer ${stringify(filterType === "daily" ? "bg-rose-500 text-white shadow-sm border border-rose-600/30" : "text-warm-500 hover:text-warm-900 bg-transparent border-0")}`)}>Laporan Harian</button> <button type="button"${attr_class(`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 cursor-pointer ${stringify(filterType === "monthly" ? "bg-rose-500 text-white shadow-sm border border-rose-600/30" : "text-warm-500 hover:text-warm-900 bg-transparent border-0")}`)}>Laporan Bulanan</button></div></div> <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white/70 backdrop-blur-sm border border-brand-300/60 rounded-2xl p-4 gap-4 shadow-sm"><div class="flex items-center space-x-3"><div class="p-2 bg-rose-100/70 border border-rose-200/50 rounded-xl text-rose-800"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"></path></svg></div> <div><h2 class="text-sm font-bold text-warm-900">${escape_html(filterType === "daily" ? "Filter Pengeluaran Harian" : "Filter Pengeluaran Bulanan")}</h2> <p class="text-xs text-warm-500 mt-0.5">${escape_html(filterType === "daily" ? formatDate(selectedDate) : formatMonth(selectedMonth))}</p></div></div> <div class="flex items-center space-x-2 self-end sm:self-center">`);
		if (filterType === "daily") {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<button title="Hari Sebelumnya" class="p-2 bg-brand-100 border border-brand-300/60 hover:border-brand-500 hover:bg-brand-200 rounded-xl text-warm-600 hover:text-warm-900 transition duration-150 cursor-pointer active:scale-95"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5"></path></svg></button> <input type="date"${attr("value", selectedDate)} class="bg-brand-100 border border-brand-300/60 focus:border-brand-600 rounded-xl px-3 py-1.5 text-xs text-warm-900 focus:outline-none"/> <button title="Hari Berikutnya" class="p-2 bg-brand-100 border border-brand-300/60 hover:border-brand-500 hover:bg-brand-200 rounded-xl text-warm-600 hover:text-warm-900 transition duration-150 cursor-pointer active:scale-95"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5"></path></svg></button> <button class="px-3 py-1.5 bg-brand-500 border border-brand-600/40 hover:bg-brand-600 rounded-xl text-xs font-semibold text-warm-900 transition duration-150 cursor-pointer active:scale-95">Hari Ini</button>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<button title="Bulan Sebelumnya" class="p-2 bg-brand-100 border border-brand-300/60 hover:border-brand-500 hover:bg-brand-200 rounded-xl text-warm-600 hover:text-warm-900 transition duration-150 cursor-pointer active:scale-95"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5"></path></svg></button> <input type="month"${attr("value", selectedMonth)} class="bg-brand-100 border border-brand-300/60 focus:border-brand-600 rounded-xl px-3 py-1.5 text-xs text-warm-900 focus:outline-none"/> <button title="Bulan Berikutnya" class="p-2 bg-brand-100 border border-brand-300/60 hover:border-brand-500 hover:bg-brand-200 rounded-xl text-warm-600 hover:text-warm-900 transition duration-150 cursor-pointer active:scale-95"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5"></path></svg></button> <button class="px-3 py-1.5 bg-brand-500 border border-brand-600/40 hover:bg-brand-600 rounded-xl text-xs font-semibold text-warm-900 transition duration-150 cursor-pointer active:scale-95">Bulan Ini</button>`);
		}
		$$renderer.push(`<!--]--></div></div> <div class="grid grid-cols-1 md:grid-cols-3 gap-5"><div class="bg-white/70 backdrop-blur-sm border border-brand-300/60 p-5 rounded-2xl flex flex-col justify-between transition-all duration-200 hover:border-rose-500 hover:shadow-md"><div><span class="text-xs font-semibold uppercase tracking-wider text-rose-600">Total Pengeluaran</span> <h3 class="text-2xl font-bold tracking-tight text-rose-600 mt-2">${escape_html(formatRupiah(totalExpenseValue))}</h3></div> <div class="mt-4 flex items-center space-x-2"><div class="w-2 h-2 rounded-full bg-rose-500"></div> <span class="text-xs text-warm-500">Jumlah total biaya operasional</span></div></div> <div class="bg-white/70 backdrop-blur-sm border border-brand-300/60 p-5 rounded-2xl flex flex-col justify-between transition-all duration-200 hover:border-amber-400 hover:shadow-md"><div><span class="text-xs font-semibold uppercase tracking-wider text-amber-600">Jumlah Transaksi</span> <h3 class="text-2xl font-bold tracking-tight text-amber-600 mt-2">${escape_html(transactionCount)} <span class="text-xs font-bold text-warm-400 lowercase tracking-wide ml-1">transaksi</span></h3></div> <div class="mt-4 flex items-center space-x-2"><div class="w-2 h-2 rounded-full bg-amber-500"></div> <span class="text-xs text-warm-500">Banyaknya item pengeluaran</span></div></div> <div class="bg-white/70 backdrop-blur-sm border border-brand-300/60 p-5 rounded-2xl flex flex-col justify-between transition-all duration-200 hover:border-blue-300 hover:shadow-md"><div><span class="text-xs font-semibold uppercase tracking-wider text-blue-600">Rata-Rata per Transaksi</span> <h3 class="text-2xl font-bold tracking-tight text-blue-600 mt-2">${escape_html(formatRupiah(avgExpensePerTx))}</h3></div> <div class="mt-4 flex items-center space-x-2"><div class="w-2 h-2 rounded-full bg-blue-500"></div> <span class="text-xs text-warm-500">Nilai rata-rata tiap pengeluaran</span></div></div></div> <div class="bg-white/70 backdrop-blur-sm border border-brand-300/60 rounded-2xl p-5 shadow-sm w-full"><div class="pb-4 border-b border-brand-200/60 mb-6 flex items-center justify-between"><div><h3 class="text-sm font-semibold tracking-tight text-warm-900">${escape_html(filterType === "daily" ? "Grafik Jam Pengeluaran Harian" : "Grafik Tren Pengeluaran Bulanan")}</h3> <p class="text-[10px] text-warm-500 mt-0.5">${escape_html(filterType === "daily" ? `Statistik pengeluaran per jam pada ${formatDate(selectedDate)}` : `Statistik pengeluaran harian sepanjang bulan ${formatMonth(selectedMonth)}`)}</p></div></div> <div class="w-full relative min-h-[200px] flex items-center justify-center">`);
		if (activeTrendData.length === 0 || chartMax <= 1e4) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="text-center py-12"><p class="text-xs text-warm-400">Tidak ada data transaksi pengeluaran pada periode ini.</p></div>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="w-full"><svg viewBox="0 0 500 200" class="w-full h-auto select-none" preserveAspectRatio="none"><defs><linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f43f5e" stop-opacity="0.20"></stop><stop offset="100%" stop-color="#f43f5e" stop-opacity="0.00"></stop></linearGradient></defs><!--[-->`);
			const each_array = ensure_array_like([
				0,
				.25,
				.5,
				.75,
				1
			]);
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let ratio = each_array[$$index];
				const y = 170 - ratio * 140;
				$$renderer.push(`<line x1="50"${attr("y1", y)} x2="480"${attr("y2", y)} stroke="#d5d1c8" stroke-dasharray="3" stroke-width="1"></line><text x="42"${attr("y", y + 3)} text-anchor="end" class="fill-warm-400 text-[8px] font-semibold">${escape_html(formatRupiahShort(ratio * chartMax))}</text>`);
			}
			$$renderer.push(`<!--]-->`);
			if (areaPathData) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<polygon${attr("points", areaPathData)} fill="url(#expenseGrad)"></polygon>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]-->`);
			if (pathData) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<polyline${attr("points", pathData)} fill="none" stroke="#e11d48" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></polyline>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--><!--[-->`);
			const each_array_1 = ensure_array_like(chartPoints);
			for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
				let pt = each_array_1[index];
				$$renderer.push(`<circle${attr("cx", pt.x)}${attr("cy", pt.y)} r="4" fill="#e11d48" stroke="#fffef9" stroke-width="1.5"><title>${escape_html(pt.label)}: ${escape_html(formatRupiah(pt.amount))}</title></circle>`);
				if (filterType === "daily" || index === 0 || index === chartPoints.length - 1 || (index + 1) % 5 === 0) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<text${attr("x", pt.x)} y="188" text-anchor="middle" class="fill-warm-500 text-[8.5px] font-bold">${escape_html(pt.label)}</text>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]-->`);
			}
			$$renderer.push(`<!--]--><line x1="50" y1="30" x2="50" y2="170" stroke="#d5d1c8" stroke-width="1"></line><line x1="50" y1="170" x2="480" y2="170" stroke="#d5d1c8" stroke-width="1"></line></svg></div>`);
		}
		$$renderer.push(`<!--]--></div></div> <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start"><div class="bg-white/70 backdrop-blur-sm border border-brand-300/60 rounded-2xl p-6 shadow-sm"><h3 class="text-sm font-semibold text-warm-900 pb-3 border-b border-brand-200/60 mb-5">Pengeluaran per Kategori</h3> `);
		if (categoryBreakdown.length === 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="py-16 text-center text-warm-400"><p class="text-xs">Tidak ada rincian kategori.</p></div>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="space-y-5"><!--[-->`);
			const each_array_2 = ensure_array_like(categoryBreakdown);
			for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
				let item = each_array_2[$$index_2];
				$$renderer.push(`<div class="space-y-2"><div class="flex items-center justify-between text-xs"><span${attr_class(`px-2.5 py-0.5 border rounded text-[10px] tracking-wide uppercase font-bold ${stringify(getCategoryStyle(item.name, store_get($$store_subs ??= {}, "$categories", categories)))}`)}>${escape_html(item.name)}</span> <span class="font-semibold text-warm-700">${escape_html(formatRupiah(item.amount))}</span></div> <div class="w-full h-2 bg-brand-100 border border-brand-200 rounded-full overflow-hidden"><div class="h-full rounded-full transition-all duration-300"${attr_style(`width: ${stringify(item.amount / maxCategoryAmount * 100)}%; background-color: ${stringify(getCategoryHex(item.name, store_get($$store_subs ??= {}, "$categories", categories)))}`)}></div></div></div>`);
			}
			$$renderer.push(`<!--]--></div>`);
		}
		$$renderer.push(`<!--]--></div> <div class="bg-white/70 backdrop-blur-sm border border-brand-300/60 rounded-2xl p-6 shadow-sm"><h3 class="text-sm font-semibold text-warm-900 pb-3 border-b border-brand-200/60 mb-5">Daftar Pengeluaran Terbesar</h3> `);
		if (topExpenses.length === 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="py-16 text-center text-warm-400"><p class="text-xs">Belum ada data pengeluaran.</p></div>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="divide-y divide-brand-200/60"><!--[-->`);
			const each_array_3 = ensure_array_like(topExpenses);
			for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
				let tx = each_array_3[$$index_3];
				$$renderer.push(`<div class="py-3 flex items-center justify-between"><div class="flex flex-col"><span class="text-xs font-bold text-warm-900">${escape_html(tx.description)}</span> <span class="text-[10px] text-warm-400 mt-0.5">${escape_html(formatDate(tx.date))} • ${escape_html(tx.category || "Lainnya")}</span></div> <span class="text-xs font-bold text-rose-600">${escape_html(formatRupiah(tx.amount))}</span></div>`);
			}
			$$renderer.push(`<!--]--></div>`);
		}
		$$renderer.push(`<!--]--></div></div></div>`);
		if ($$store_subs) unsubscribe_stores($$store_subs);
	});
}
//#endregion
//#region src/components/FinancialReport.svelte
function FinancialReport($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let activeReport = "sales";
		$$renderer.push(`<div class="space-y-6"><div class="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-brand-300/60 gap-4 no-print svelte-ull1xl"><div><h1 class="text-2xl font-bold tracking-tight text-warm-900">Laporan Keuangan</h1> <p class="text-sm text-warm-500 mt-1">Kelola dan tinjau performa bisnis Selerasi dalam satu tempat.</p></div> <div class="flex items-center space-x-3 self-end md:self-auto"><button class="px-4 py-2 bg-white border border-brand-300 text-warm-700 text-xs font-bold rounded-xl hover:bg-brand-50 transition flex items-center gap-2 shadow-sm cursor-pointer active:scale-95"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"></path></svg> Export CSV</button> <button class="px-4 py-2 bg-brand-700 text-brand-50 text-xs font-bold rounded-xl hover:bg-brand-800 transition flex items-center gap-2 shadow-sm cursor-pointer active:scale-95"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM9 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M18 12v5.25A2.25 2.25 0 0 1 15.75 19.5H8.25A2.25 2.25 0 0 1 6 17.25V12M16.5 9V5.25A2.25 2.25 0 0 0 14.25 3h-4.5A2.25 2.25 0 0 0 7.5 5.25V9m9 0H7.5m9 0v3.375c0 .621-.504 1.125-1.125 1.125h-6.75A1.125 1.125 0 0 1 7.5 12.375V9"></path></svg> Cetak Laporan</button></div></div> <div class="flex border-b border-brand-200 gap-8 no-print svelte-ull1xl"><button${attr_class(`pb-4 text-sm font-bold transition-all relative ${stringify(activeReport === "sales" ? "text-brand-800" : "text-warm-400 hover:text-warm-600 cursor-pointer")}`)}>Analisis Penjualan `);
		if (activeReport === "sales") {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="absolute bottom-0 left-0 right-0 h-1 bg-brand-700 rounded-t-full"></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></button> <button${attr_class(`pb-4 text-sm font-bold transition-all relative ${stringify(activeReport === "expense" ? "text-rose-600" : "text-warm-400 hover:text-warm-600 cursor-pointer")}`)}>Analisis Pengeluaran `);
		if (activeReport === "expense") {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="absolute bottom-0 left-0 right-0 h-1 bg-rose-500 rounded-t-full"></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></button></div> <div class="pt-4">`);
		if (activeReport === "sales") {
			$$renderer.push("<!--[0-->");
			SalesReport($$renderer, {});
		} else {
			$$renderer.push("<!--[-1-->");
			ExpenseReport($$renderer, {});
		}
		$$renderer.push(`<!--]--></div></div>`);
		if ($$store_subs) unsubscribe_stores($$store_subs);
	});
}
//#endregion
//#region src/components/ProductManagement.svelte
function ProductManagement($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let name = "";
		let price = "";
		let description = "";
		let status = "Tersedia";
		let editingProductId = null;
		function formatRupiah(value) {
			return new Intl.NumberFormat("id-ID", {
				style: "currency",
				currency: "IDR",
				minimumFractionDigits: 0,
				maximumFractionDigits: 0
			}).format(value);
		}
		$$renderer.push(`<div class="space-y-8 animate-fade-in"><div class="pb-6 border-b border-brand-300/60"><h1 class="text-2xl font-bold tracking-tight text-warm-900">Daftar Menu Ricebowl</h1> <p class="text-sm text-warm-500 mt-1">Kelola menu makanan Selerasi, harga jual, deskripsi resep, dan ketersediaan stok.</p></div> <div class="grid grid-cols-1 md:grid-cols-3 gap-8 items-start"><div class="bg-white/70 backdrop-blur-sm border border-brand-300/60 rounded-2xl p-6 md:col-span-1 shadow-sm"><h3 class="text-sm font-semibold text-warm-900 pb-3 border-b border-brand-200/60 mb-5">${escape_html("Tambah Menu Baru")}</h3> <form class="space-y-4"><div class="space-y-1.5"><label for="prod-name" class="text-xs font-medium text-warm-600">Nama Menu Ricebowl</label> <input id="prod-name" type="text" placeholder="Contoh: Ricebowl Sambal Matah"${attr("value", name)} required="" class="w-full px-3 py-2 bg-brand-50 border border-brand-300/60 text-warm-900 placeholder-warm-300 focus:border-brand-700 focus:ring-1 focus:ring-brand-600/30 focus:outline-none transition-colors rounded-xl text-sm"/></div> <div class="space-y-1.5"><label for="prod-price" class="text-xs font-medium text-warm-600">Harga Jual (Rupiah)</label> <div class="relative"><span class="absolute left-3 top-2.5 text-xs text-warm-400 font-semibold select-none">Rp</span> <input id="prod-price" type="number" min="0" placeholder="0"${attr("value", price)} required="" class="w-full pl-9 pr-3 py-2 bg-brand-50 border border-brand-300/60 text-warm-900 placeholder-warm-300 focus:border-brand-700 focus:ring-1 focus:ring-brand-600/30 focus:outline-none transition-colors rounded-xl text-sm"/></div></div> <div class="space-y-1.5"><label for="prod-status" class="text-xs font-medium text-warm-600">Status Menu</label> `);
		$$renderer.select({
			id: "prod-status",
			value: status,
			required: true,
			class: "w-full px-3 py-2 bg-brand-50 border border-brand-300/60 text-warm-900 focus:border-brand-700 focus:ring-1 focus:ring-brand-600/30 focus:outline-none transition-colors rounded-xl text-sm"
		}, ($$renderer) => {
			$$renderer.option({ value: "Tersedia" }, ($$renderer) => {
				$$renderer.push(`Tersedia`);
			});
			$$renderer.option({ value: "Habis" }, ($$renderer) => {
				$$renderer.push(`Habis (Stok Kosong)`);
			});
		});
		$$renderer.push(`</div> <div class="space-y-1.5"><label for="prod-desc" class="text-xs font-medium text-warm-600">Deskripsi / Detail Bahan (Opsional)</label> <textarea id="prod-desc" placeholder="Contoh: Ayam fillet crispy siram sambal bawang dengan irisan timun." rows="3" class="w-full px-3 py-2 bg-brand-50 border border-brand-300/60 text-warm-900 placeholder-warm-300 focus:border-brand-700 focus:ring-1 focus:ring-brand-600/30 focus:outline-none transition-colors rounded-xl text-sm resize-none">`);
		const $$body = escape_html(description);
		if ($$body) $$renderer.push(`${$$body}`);
		$$renderer.push(`</textarea></div> <div class="space-y-2 pt-2"><button type="submit" class="w-full py-2.5 bg-brand-700 hover:bg-brand-800 active:scale-[0.99] text-brand-50 text-xs font-bold rounded-xl transition-all duration-150 cursor-pointer shadow-md">${escape_html("Buat Menu")}</button> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div></form></div> <div class="bg-white/70 backdrop-blur-sm border border-brand-300/60 rounded-2xl p-6 md:col-span-2 shadow-sm"><h3 class="text-sm font-semibold text-warm-900 pb-3 border-b border-brand-200/60 mb-5">Daftar Menu Terdaftar (${escape_html(store_get($$store_subs ??= {}, "$products", products).length)} Menu)</h3> `);
		if (store_get($$store_subs ??= {}, "$products", products).length === 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="flex flex-col items-center justify-center py-20 text-center"><div class="w-12 h-12 border-2 border-dashed border-brand-300 rounded-xl flex items-center justify-center mb-4"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-warm-400"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0H2.36"></path></svg></div> <h3 class="text-sm font-medium text-warm-700">Belum ada menu terdaftar</h3> <p class="text-xs text-warm-400 mt-1">Gunakan form di samping kiri untuk menambahkan menu ricebowl pertama Selerasi.</p></div>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="overflow-x-auto"><table class="w-full text-left text-sm text-warm-700"><thead><tr class="border-b border-brand-200/60 text-[10px] font-bold tracking-wider text-warm-400 uppercase"><th class="py-2.5">Menu</th><th class="py-2.5">Harga</th><th class="py-2.5">Status</th><th class="py-2.5 text-right">Aksi</th></tr></thead><tbody class="divide-y divide-brand-200/60"><!--[-->`);
			const each_array = ensure_array_like(store_get($$store_subs ??= {}, "$products", products));
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let product = each_array[$$index];
				$$renderer.push(`<tr${attr_class(`group hover:bg-brand-100/50 transition-colors ${stringify(editingProductId === product.id ? "bg-brand-100/80" : "")}`)}><td class="py-3.5 pr-4"><div class="flex flex-col"><span class="text-sm font-bold text-warm-800">${escape_html(product.name)}</span> `);
				if (product.description) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<span class="text-xs text-warm-400 mt-1 max-w-sm leading-relaxed">${escape_html(product.description)}</span>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--></div></td><td class="py-3.5 font-semibold text-warm-700">${escape_html(formatRupiah(product.price))}</td><td class="py-3.5"><span${attr_class(`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${stringify(product.status === "Tersedia" ? "bg-brand-100 text-brand-800 border-brand-300" : "bg-rose-50 text-rose-600 border-rose-200")}`)}>${escape_html(product.status)}</span></td><td class="py-3.5 text-right"><div class="flex items-center justify-end space-x-2.5"><button title="Edit Menu" class="text-warm-500 hover:text-warm-900 text-xs font-semibold py-1 px-2.5 border border-brand-300 rounded-lg hover:bg-brand-100 transition-all cursor-pointer active:scale-95">Edit</button> <button title="Hapus Menu" class="text-warm-400 hover:text-rose-500 text-xs font-semibold py-1 px-2.5 border border-brand-300 rounded-lg hover:bg-rose-50 transition-all cursor-pointer active:scale-95">Hapus</button></div></td></tr>`);
			}
			$$renderer.push(`<!--]--></tbody></table></div>`);
		}
		$$renderer.push(`<!--]--></div></div></div>`);
		if ($$store_subs) unsubscribe_stores($$store_subs);
	});
}
//#endregion
//#region src/components/HistoryView.svelte
function HistoryView($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let groupedTransactions, totalFilteredIncome, totalFilteredExpense, totalFilteredBalance, categoryBreakdown;
		let filterMode = "daily";
		let typeFilter = "all";
		function formatRupiah(value) {
			return new Intl.NumberFormat("id-ID", {
				style: "currency",
				currency: "IDR",
				minimumFractionDigits: 0,
				maximumFractionDigits: 0
			}).format(value);
		}
		function formatDate(dateStr) {
			if (!dateStr) return "";
			const date = new Date(dateStr);
			return new Intl.DateTimeFormat("id-ID", {
				day: "numeric",
				month: "short",
				year: "numeric"
			}).format(date);
		}
		function getWeekNumber(date) {
			const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
			const dayNum = d.getUTCDay() || 7;
			d.setUTCDate(d.getUTCDate() + 4 - dayNum);
			const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
			return Math.ceil(((d - yearStart) / 864e5 + 1) / 7);
		}
		function formatGroupLabel(dateStr, mode) {
			const date = new Date(dateStr);
			if (mode === "daily") return new Intl.DateTimeFormat("id-ID", {
				weekday: "long",
				day: "numeric",
				month: "long",
				year: "numeric"
			}).format(date);
			else if (mode === "weekly") return `Minggu ke-${getWeekNumber(date)}, ${date.getFullYear()}`;
			else if (mode === "monthly") return new Intl.DateTimeFormat("id-ID", {
				month: "long",
				year: "numeric"
			}).format(date);
			else if (mode === "yearly") return `Tahun ${date.getFullYear()}`;
			return dateStr;
		}
		$: groupedTransactions = (() => {
			const groups = {};
			(typeFilter === "all" ? [...store_get($$store_subs ??= {}, "$transactions", transactions)] : store_get($$store_subs ??= {}, "$transactions", transactions).filter((t) => t.type === typeFilter)).sort((a, b) => {
				const dateA = a.date || "";
				const dateB = b.date || "";
				if (dateA !== dateB) return dateB.localeCompare(dateA);
				const timeA = a.created_at || "";
				const timeB = b.created_at || "";
				if (timeA !== timeB) return timeB.localeCompare(timeA);
				return String(b.id).localeCompare(String(a.id));
			}).forEach((tx) => {
				const label = formatGroupLabel(tx.date, filterMode);
				if (!groups[label]) groups[label] = {
					label,
					income: 0,
					expense: 0,
					transactions: []
				};
				groups[label].transactions.push(tx);
				if (tx.type === "income") groups[label].income += tx.amount;
				else groups[label].expense += tx.amount;
			});
			return Object.values(groups);
		})();
		$: totalFilteredIncome = groupedTransactions.reduce((sum, g) => sum + g.income, 0);
		$: totalFilteredExpense = groupedTransactions.reduce((sum, g) => sum + g.expense, 0);
		$: totalFilteredBalance = totalFilteredIncome - totalFilteredExpense;
		$: categoryBreakdown = (() => {
			const expenses = store_get($$store_subs ??= {}, "$transactions", transactions).filter((t) => t.type === "expense");
			const totalSum = expenses.reduce((sum, t) => sum + t.amount, 0);
			if (totalSum === 0) return [];
			const map = {};
			expenses.forEach((t) => {
				const name = t.category || "Lainnya";
				if (!map[name]) map[name] = {
					name,
					amount: 0,
					percentage: 0
				};
				map[name].amount += t.amount;
			});
			return Object.values(map).map((item) => ({
				...item,
				percentage: item.amount / totalSum * 100
			})).sort((a, b) => b.amount - a.amount);
		})();
		$$renderer.push(`<div class="space-y-8 animate-fade-in"><div class="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 pb-6 border-b border-brand-300/60"><div><h1 class="text-2xl font-bold tracking-tight text-warm-900">Riwayat &amp; Laporan</h1> <p class="text-sm text-warm-500 mt-1">Kelompokkan dan tinjau performa kas Anda berdasarkan jangka waktu.</p></div> <div class="flex flex-wrap gap-2"><div class="flex bg-brand-100 p-0.5 border border-brand-300/60 rounded-xl shadow-sm"><button${attr_class(`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${stringify(typeFilter === "all" ? "bg-white text-warm-900 shadow-sm border border-brand-300/60" : "text-warm-500 hover:text-warm-900")}`)}>Semua</button> <button${attr_class(`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${stringify(typeFilter === "income" ? "bg-brand-500 text-warm-900 shadow-sm border border-brand-600/30" : "text-warm-500 hover:text-warm-900")}`)}>Pemasukan</button> <button${attr_class(`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${stringify(typeFilter === "expense" ? "bg-rose-500 text-white shadow-sm border border-rose-600/30" : "text-warm-500 hover:text-warm-900")}`)}>Pengeluaran</button></div> <div class="flex bg-brand-100 p-0.5 border border-brand-300/60 rounded-xl shadow-sm"><button${attr_class(`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${stringify(filterMode === "daily" ? "bg-brand-500 text-warm-900 shadow-sm" : "text-warm-500")}`)}>Harian</button> <button${attr_class(`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${stringify(filterMode === "weekly" ? "bg-brand-500 text-warm-900 shadow-sm" : "text-warm-500")}`)}>Mingguan</button> <button${attr_class(`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${stringify(filterMode === "monthly" ? "bg-brand-500 text-warm-900 shadow-sm" : "text-warm-500")}`)}>Bulanan</button> <button${attr_class(`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${stringify(filterMode === "yearly" ? "bg-brand-500 text-warm-900 shadow-sm" : "text-warm-500")}`)}>Tahunan</button></div></div></div> <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-5 grid grid-cols-1 md:grid-cols-3 gap-4 border border-brand-300/60 shadow-sm"><div><span class="text-[10px] uppercase font-bold tracking-wider text-warm-500">Arus Bersih</span> <h4 class="text-xl font-bold mt-1 text-warm-900">${escape_html(formatRupiah(totalFilteredBalance))}</h4></div> <div><span class="text-[10px] uppercase font-bold tracking-wider text-brand-800">Total Pemasukan</span> <h4 class="text-xl font-bold mt-1 text-brand-800">${escape_html(formatRupiah(totalFilteredIncome))}</h4></div> <div><span class="text-[10px] uppercase font-bold tracking-wider text-rose-500">Total Pengeluaran</span> <h4 class="text-xl font-bold mt-1 text-rose-500">${escape_html(formatRupiah(totalFilteredExpense))}</h4></div></div> `);
		if (typeFilter !== "income" && categoryBreakdown.length > 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="bg-white/70 backdrop-blur-sm border border-brand-300/60 rounded-2xl p-6 shadow-sm"><h3 class="text-sm font-semibold text-warm-900 pb-3 border-b border-brand-200/60 mb-5">Analisis Pengeluaran per Kategori</h3> <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5"><!--[-->`);
			const each_array = ensure_array_like(categoryBreakdown);
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let cat = each_array[$$index];
				$$renderer.push(`<div class="space-y-2"><div class="flex items-center justify-between text-xs font-semibold"><span${attr_class(`px-2 py-0.5 border rounded text-[10px] tracking-wide uppercase ${stringify(getCategoryStyle(cat.name, store_get($$store_subs ??= {}, "$categories", categories)))}`)}>${escape_html(cat.name)}</span> <span class="text-warm-700">${escape_html(formatRupiah(cat.amount))} (${escape_html(cat.percentage.toFixed(1))}%)</span></div> <div class="w-full h-1.5 bg-brand-100 rounded-full overflow-hidden border border-brand-200/50"><div class="h-full rounded-full bg-rose-500"${attr_style(`width: ${stringify(cat.percentage)}%`)}></div></div></div>`);
			}
			$$renderer.push(`<!--]--></div></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		if (groupedTransactions.length === 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="bg-white/70 backdrop-blur-sm border border-brand-300/60 rounded-2xl py-20 text-center shadow-sm text-warm-400 text-sm">Tidak ada riwayat transaksi.</div>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="space-y-6"><!--[-->`);
			const each_array_1 = ensure_array_like(groupedTransactions);
			for (let $$index_2 = 0, $$length = each_array_1.length; $$index_2 < $$length; $$index_2++) {
				let group = each_array_1[$$index_2];
				$$renderer.push(`<div class="bg-white/70 backdrop-blur-sm border border-brand-300/60 rounded-2xl overflow-hidden shadow-sm"><div class="bg-brand-100/80 border-b border-brand-200/60 px-6 py-4 flex justify-between items-center"><h3 class="text-sm font-bold text-warm-800">${escape_html(group.label)}</h3> <div class="flex items-center space-x-3 text-xs">`);
				if (group.income > 0) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<span class="font-medium text-brand-800">+${escape_html(formatRupiah(group.income))}</span>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--> `);
				if (group.expense > 0) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<span class="font-medium text-rose-500">-${escape_html(formatRupiah(group.expense))}</span>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--></div></div> <div class="divide-y divide-brand-200/60 px-6"><!--[-->`);
				const each_array_2 = ensure_array_like(group.transactions);
				for (let $$index_1 = 0, $$length = each_array_2.length; $$index_1 < $$length; $$index_1++) {
					let tx = each_array_2[$$index_1];
					$$renderer.push(`<div class="py-3.5 flex items-center justify-between group"><div class="flex flex-col min-w-0 pr-4"><span class="text-sm font-semibold text-warm-900 truncate">${escape_html(tx.description)}</span> <div class="flex items-center gap-2.5 mt-1"><span class="text-xs text-warm-400">${escape_html(formatDate(tx.date))}</span> `);
					if (tx.type === "expense") {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<span${attr_class(`text-[9px] px-2 py-0.2 border rounded font-bold uppercase select-none ${stringify(getCategoryStyle(tx.category, store_get($$store_subs ??= {}, "$categories", categories)))}`)}>${escape_html(tx.category || "Lainnya")}</span>`);
					} else $$renderer.push("<!--[-1-->");
					$$renderer.push(`<!--]--> `);
					if (tx.payment_method) {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<span class="text-[9px] px-2 py-0.2 border border-brand-300/60 bg-brand-100/60 rounded font-bold uppercase text-warm-500">${escape_html(tx.payment_method)}</span>`);
					} else $$renderer.push("<!--[-1-->");
					$$renderer.push(`<!--]--></div></div> <div class="flex items-center space-x-3 text-right"><span${attr_class(`text-sm font-bold ${stringify(tx.type === "income" ? "text-brand-800" : "text-rose-500")}`)}>${escape_html(tx.type === "income" ? "+" : "-")} ${escape_html(formatRupiah(tx.amount))}</span> <button class="text-warm-400 hover:text-rose-500 p-1 rounded-md transition duration-150 cursor-pointer"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.34 12.142m-10.11-12.14 1.1 11.24a2.25 2.25 0 0 0 2.23 2.19h8.56a2.25 2.25 0 0 0 2.23-2.19l1.1-11.24m-12 0h12m-9-3h9m-7.3-3.6H17c.445 0 .833.207 1.085.53l.9 1.25M6.285 5.25c.252-.323.64-.53 1.085-.53h8.56c.445 0 .833.207 1.085.53"></path></svg></button></div></div>`);
				}
				$$renderer.push(`<!--]--></div></div>`);
			}
			$$renderer.push(`<!--]--></div>`);
		}
		$$renderer.push(`<!--]--></div>`);
		if ($$store_subs) unsubscribe_stores($$store_subs);
	});
}
//#endregion
//#region src/components/SettingsView.svelte
function SettingsView($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let expenseCategories;
		let name = "";
		let selectedSwatchName = "Rose";
		let editingCategoryId = null;
		const colorSwatches = [
			{
				name: "Emerald",
				hex: "#f4e9bb",
				bgClass: "bg-brand-50",
				textClass: "text-brand-700",
				borderClass: "border-brand-200"
			},
			{
				name: "Rose",
				hex: "#f43f5e",
				bgClass: "bg-rose-50",
				textClass: "text-rose-700",
				borderClass: "border-rose-200"
			},
			{
				name: "Amber",
				hex: "#f59e0b",
				bgClass: "bg-amber-50",
				textClass: "text-amber-700",
				borderClass: "border-amber-200"
			},
			{
				name: "Blue",
				hex: "#3b82f6",
				bgClass: "bg-blue-50",
				textClass: "text-blue-700",
				borderClass: "border-blue-200"
			},
			{
				name: "Violet",
				hex: "#8b5cf6",
				bgClass: "bg-violet-50",
				textClass: "text-violet-700",
				borderClass: "border-violet-200"
			},
			{
				name: "Indigo",
				hex: "#6366f1",
				bgClass: "bg-indigo-50",
				textClass: "text-indigo-700",
				borderClass: "border-indigo-200"
			},
			{
				name: "Pink",
				hex: "#ec4899",
				bgClass: "bg-pink-50",
				textClass: "text-pink-700",
				borderClass: "border-pink-200"
			},
			{
				name: "Slate",
				hex: "#64748b",
				bgClass: "bg-slate-50",
				textClass: "text-slate-700",
				borderClass: "border-slate-200"
			}
		];
		$: expenseCategories = store_get($$store_subs ??= {}, "$categories", categories).filter((c) => c.type === "expense");
		$$renderer.push(`<div class="space-y-8 animate-fade-in"><div class="pb-6 border-b border-brand-300/60"><h1 class="text-2xl font-bold tracking-tight text-warm-900">Pengaturan Kategori Pengeluaran</h1> <p class="text-sm text-warm-500 mt-1">Kelola daftar kategori untuk merincikan setiap pengeluaran operasional Selerasi.</p></div> <div class="grid grid-cols-1 md:grid-cols-3 gap-8 items-start"><div class="bg-white/70 backdrop-blur-sm border border-brand-300/60 rounded-2xl p-6 md:col-span-1 shadow-sm"><h3 class="text-sm font-semibold text-warm-900 pb-3 border-b border-brand-200/60 mb-5">${escape_html("Buat Kategori Baru")}</h3> <form class="space-y-4"><div class="p-2 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-2"><div class="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div> <span class="text-[10px] font-bold text-rose-700 uppercase tracking-wider text-center">Tipe: Pengeluaran</span></div> <div class="space-y-1.5"><label for="cat-name" class="text-xs font-medium text-warm-600">Nama Kategori</label> <input id="cat-name" type="text" placeholder="Contoh: Bahan Baku, Listrik, Gaji..."${attr("value", name)} required="" class="w-full px-3 py-2 bg-brand-50 border border-brand-300/60 text-warm-900 placeholder-warm-300 focus:border-brand-700 focus:ring-1 focus:ring-brand-600/30 focus:outline-none transition-colors rounded-xl text-sm"/></div> <div class="space-y-1.5"><span class="text-xs font-medium text-zinc-400">Warna Aksen</span> <div class="grid grid-cols-4 gap-3 pt-1.5"><!--[-->`);
		const each_array = ensure_array_like(colorSwatches);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let swatch = each_array[$$index];
			$$renderer.push(`<button type="button"${attr("title", swatch.name)} class="w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-150 active:scale-90 relative cursor-pointer"${attr_style(`background-color: ${stringify(swatch.hex)}; border-color: ${stringify(selectedSwatchName === swatch.name ? "#ffffff" : "transparent")}`)}>`);
			if (selectedSwatchName === swatch.name) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<span class="absolute inset-0.5 border border-zinc-950 rounded-full flex items-center justify-center text-zinc-950 text-[10px] font-bold bg-white/80">✓</span>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></button>`);
		}
		$$renderer.push(`<!--]--></div></div> <div class="space-y-2 pt-2"><button type="submit" class="w-full py-2.5 bg-brand-700 hover:bg-brand-800 active:scale-[0.99] text-brand-50 text-xs font-bold rounded-xl transition-all duration-150 cursor-pointer shadow-md">${escape_html("Buat Kategori")}</button> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div></form></div> <div class="bg-white/70 backdrop-blur-sm border border-brand-300/60 rounded-2xl p-6 md:col-span-2 shadow-sm"><h3 class="text-sm font-semibold text-warm-900 pb-3 border-b border-brand-200/60 mb-5">Daftar Kategori Terdaftar (${escape_html(expenseCategories.length)})</h3> <div class="overflow-x-auto"><table class="w-full text-left text-sm text-warm-700"><thead><tr class="border-b border-brand-200/60 text-[10px] font-bold tracking-wider text-warm-400 uppercase"><th class="py-2.5">Nama Kategori</th><th class="py-2.5 text-right">Aksi</th></tr></thead><tbody class="divide-y divide-brand-200/60"><!--[-->`);
		const each_array_1 = ensure_array_like(expenseCategories);
		for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
			let cat = each_array_1[$$index_1];
			$$renderer.push(`<tr${attr_class(`group hover:bg-brand-100/50 transition-colors ${stringify(editingCategoryId === cat.id ? "bg-brand-100/80" : "")}`)}><td class="py-3"><span${attr_class(`inline-block px-2.5 py-0.5 rounded text-xs font-semibold border ${stringify(getCategoryStyle(cat.name, store_get($$store_subs ??= {}, "$categories", categories)))}`)}>${escape_html(cat.name)}</span></td><td class="py-3 text-right"><div class="flex items-center justify-end space-x-2.5"><button title="Edit Kategori" class="text-warm-500 hover:text-warm-900 text-xs font-semibold py-1 px-2.5 border border-brand-300 rounded-lg hover:bg-brand-100 transition-all cursor-pointer active:scale-95">Edit</button> <button title="Hapus Kategori" class="text-warm-400 hover:text-rose-500 text-xs font-semibold py-1 px-2.5 border border-brand-300 rounded-lg hover:bg-rose-50 transition-all cursor-pointer active:scale-95">Hapus</button></div></td></tr>`);
		}
		$$renderer.push(`<!--]--></tbody></table> `);
		if (expenseCategories.length === 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="py-10 text-center text-warm-400 text-xs">Belum ada kategori pengeluaran.</div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div></div></div> <div class="bg-white/70 backdrop-blur-sm border border-brand-300/60 rounded-2xl p-6 shadow-sm"><h3 class="text-sm font-semibold text-warm-900 pb-3 border-b border-brand-200/60 mb-5 flex items-center justify-between"><span>Utilitas &amp; Cadangan Data</span> <span class="text-[10px] bg-brand-200/70 text-warm-700 border border-brand-300 font-bold px-2 py-0.5 rounded tracking-wide uppercase">Cadangan &amp; Pemulihan</span></h3> <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"><div class="border border-brand-300/60 rounded-xl p-4 flex flex-col justify-between hover:border-brand-500 hover:shadow-sm transition-colors bg-brand-50/60"><div><h4 class="text-xs font-bold text-warm-800 uppercase tracking-wide">Ekspor Data</h4> <p class="text-[11px] text-warm-500 mt-1">Unduh seluruh catatan transaksi dan kategori Anda sebagai file JSON cadangan.</p></div> <button type="button" class="w-full mt-4 py-2 bg-brand-200 hover:bg-brand-300 border border-brand-400/50 text-warm-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer active:scale-95 text-center">Ekspor Cadangan</button></div> <div class="border border-brand-300/60 rounded-xl p-4 flex flex-col justify-between hover:border-brand-500 hover:shadow-sm transition-colors bg-brand-50/60"><div><h4 class="text-xs font-bold text-warm-800 uppercase tracking-wide">Impor Data</h4> <p class="text-[11px] text-warm-500 mt-1">Unggah file JSON cadangan Selerasi untuk memulihkan seluruh riwayat keuangan Anda.</p></div> <div class="mt-4"><input type="file" accept=".json" class="hidden" id="file-import-input"/> <label for="file-import-input" class="block w-full py-2 bg-brand-200 hover:bg-brand-300 border border-brand-400/50 text-warm-800 text-xs font-semibold rounded-lg text-center cursor-pointer active:scale-95 transition-all">Pilih &amp; Impor File</label></div></div> <div class="border border-brand-300/60 rounded-xl p-4 flex flex-col justify-between hover:border-brand-500 hover:shadow-sm transition-colors bg-brand-50/60"><div><h4 class="text-xs font-bold text-warm-800 uppercase tracking-wide">Data Demo</h4> <p class="text-[11px] text-warm-500 mt-1">Kembalikan aplikasi ke konfigurasi simulasi awal dengan data contoh transaksi bawaan.</p></div> <button type="button" class="w-full mt-4 py-2 bg-brand-200 hover:bg-brand-300 border border-brand-400/50 text-warm-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer active:scale-95 text-center">Reset Data Demo</button></div> <div class="border border-rose-200 rounded-xl p-4 flex flex-col justify-between hover:border-rose-300 hover:bg-rose-50/50 transition-colors bg-rose-50/30"><div><h4 class="text-xs font-bold text-rose-600 uppercase tracking-wide">Hapus Semua Data</h4> <p class="text-[11px] text-warm-500 mt-1">Kosongkan seluruh data transaksi dan kategori agar Anda bisa mulai mencatat dari awal.</p></div> <button type="button" class="w-full mt-4 py-2 bg-rose-100 hover:bg-rose-200 border border-rose-300 text-rose-600 text-xs font-bold rounded-lg transition-colors cursor-pointer active:scale-95 text-center">Hapus Permanen</button></div></div></div></div>`);
		if ($$store_subs) unsubscribe_stores($$store_subs);
	});
}
//#endregion
//#region src/components/POSView.svelte
function POSView($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let activeProducts, allocatedSums, filteredProducts, cartTotal, totalPortions;
		let cart = [];
		let paymentMethod = "QRIS";
		let date = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
		let searchQuery = "";
		let customerList = [{
			name: "",
			paymentMethod: "QRIS",
			items: {}
		}];
		function formatRupiah(value) {
			return new Intl.NumberFormat("id-ID", {
				style: "currency",
				currency: "IDR",
				minimumFractionDigits: 0,
				maximumFractionDigits: 0
			}).format(value);
		}
		function getAvatarGradient(index) {
			const gradients = [
				"from-brand-650 to-teal-700 text-brand-100",
				"from-blue-650 to-indigo-700 text-blue-100",
				"from-amber-600 to-orange-700 text-amber-100",
				"from-violet-650 to-purple-700 text-violet-100",
				"from-rose-650 to-pink-700 text-rose-100",
				"from-cyan-600 to-teal-700 text-cyan-100"
			];
			return gradients[index % gradients.length];
		}
		$: activeProducts = store_get($$store_subs ??= {}, "$products", products).filter((p) => p.status === "Tersedia");
		$: allocatedSums = (() => {
			const sums = {};
			cart.forEach((item) => {
				sums[item.id] = customerList.reduce((sum, cust) => sum + (cust.items[item.id] || 0), 0);
			});
			return sums;
		})();
		$: (() => {
			if (cart.length === 0) return false;
			return cart.every((item) => allocatedSums[item.id] === item.quantity);
		})();
		$: filteredProducts = activeProducts.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
		$: cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
		$: totalPortions = cart.reduce((sum, item) => sum + item.quantity, 0);
		$$renderer.push(`<div class="space-y-6"><div class="pb-6 border-b border-brand-300/60"><h1 class="text-2xl font-bold tracking-tight text-warm-900">Mesin Kasir (POS)</h1> <p class="text-sm text-warm-500 mt-1">Kelola transaksi pesanan Ricebowl secara real-time dan terintegrasi otomatis.</p></div> <div class="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start"><div class="md:col-span-2 space-y-4"><div class="relative"><span class="absolute left-3 top-2.5 text-warm-400"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.637 10.637Z"></path></svg></span> <input type="text" placeholder="Cari menu Ricebowl..."${attr("value", searchQuery)} class="w-full pl-9 pr-4 py-2 bg-white/70 border border-brand-300/60 text-warm-900 placeholder-warm-300 focus:border-brand-600 focus:ring-1 focus:ring-brand-500/30 focus:outline-none transition-colors rounded-xl text-sm backdrop-blur-sm"/></div> `);
		if (filteredProducts.length === 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="bg-white/50 border border-brand-300/50 rounded-2xl py-24 text-center px-4"><div class="w-12 h-12 border-2 border-dashed border-brand-300 rounded-xl flex items-center justify-center mb-4 mx-auto"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-warm-400"><path stroke-linecap="round" stroke-linejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0-3-3m3 3 3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"></path></svg></div> <h3 class="text-sm font-medium text-warm-700">Menu tidak ditemukan</h3> <p class="text-xs text-warm-400 mt-1">Coba gunakan kata kunci pencarian lain atau tambahkan menu baru di tab Menu Produk.</p></div>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"><!--[-->`);
			const each_array = ensure_array_like(filteredProducts);
			for (let index = 0, $$length = each_array.length; index < $$length; index++) {
				let product = each_array[index];
				$$renderer.push(`<div class="bg-white/70 border border-brand-300/60 hover:border-brand-500 hover:bg-brand-50/60 rounded-2xl p-4 flex flex-col justify-between transition-all duration-200 cursor-pointer group active:scale-[0.98] shadow-sm select-none backdrop-blur-sm"><div class="flex items-start space-x-3 mb-4"><div${attr_class(`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs bg-gradient-to-br ${stringify(getAvatarGradient(index))} shadow`)}>${escape_html(product.name.split(" ").map((w) => w[0]).join("").substring(0, 2).toUpperCase())}</div> <div class="min-w-0"><h3 class="text-xs font-bold text-warm-900 group-hover:text-brand-800 transition-colors truncate">${escape_html(product.name)}</h3></div></div> <div class="flex items-center justify-between mt-auto border-t border-brand-200/60 pt-3"><span class="text-xs font-bold text-brand-800">${escape_html(formatRupiah(product.price))}</span> <button type="button" class="px-2.5 py-1 bg-brand-100 border border-brand-300 hover:bg-brand-500 hover:text-warm-900 group-hover:border-brand-500 group-hover:bg-brand-200 rounded-lg text-[10px] font-bold text-warm-700 transition duration-150 cursor-pointer">+ Tambah</button></div></div>`);
			}
			$$renderer.push(`<!--]--></div>`);
		}
		$$renderer.push(`<!--]--></div> <div class="md:col-span-1"><form class="bg-white/80 backdrop-blur-sm border border-brand-300/60 rounded-2xl p-5 shadow-md space-y-5 sticky top-24"><h2 class="text-sm font-bold tracking-tight text-warm-900 pb-3 border-b border-brand-200/60 mb-2">Detail Transaksi Kasir</h2> <div class="space-y-3"><span class="text-[10px] font-bold uppercase tracking-wider text-warm-500 block">Daftar Belanja (${escape_html(cart.length)} Item)</span> `);
		if (cart.length === 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="py-10 border border-dashed border-brand-300/60 rounded-xl flex flex-col items-center justify-center text-center px-4 bg-brand-50/50"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-warm-300 mb-2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"></path></svg> <p class="text-xs text-warm-400 font-medium">Kasir masih kosong</p> <p class="text-[9px] text-warm-300 mt-0.5">Klik menu makanan di sebelah kiri untuk menambah ke keranjang belanja.</p></div>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="divide-y divide-brand-200/60 max-h-56 overflow-y-auto pr-1"><!--[-->`);
			const each_array_1 = ensure_array_like(cart);
			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let item = each_array_1[$$index_1];
				$$renderer.push(`<div class="py-2.5 flex items-center justify-between group"><div class="min-w-0 pr-2 flex-grow"><div class="text-xs font-bold text-warm-800 truncate">${escape_html(item.name)}</div> <div class="text-[10px] text-brand-700 font-semibold mt-0.5">${escape_html(formatRupiah(item.price))}</div></div> <div class="flex items-center space-x-3"><div class="flex items-center bg-brand-100 border border-brand-300/60 rounded-lg p-0.5"><button type="button" class="w-5 h-5 flex items-center justify-center text-xs text-warm-500 hover:text-warm-900 hover:bg-brand-200 rounded cursor-pointer transition active:scale-90">-</button> <span class="text-xs font-bold text-warm-800 w-6 text-center select-none">${escape_html(item.quantity)}</span> <button type="button" class="w-5 h-5 flex items-center justify-center text-xs text-warm-500 hover:text-warm-900 hover:bg-brand-200 rounded cursor-pointer transition active:scale-90">+</button></div> <button type="button" aria-label="Hapus dari keranjang" title="Hapus dari keranjang" class="text-warm-400 hover:text-rose-500 p-1 rounded-md transition duration-150 cursor-pointer"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5"><path stroke-linecap="round" stroke-linejoin="round" d="m6 18 12-12M6 6l12 12"></path></svg></button></div></div>`);
			}
			$$renderer.push(`<!--]--></div>`);
		}
		$$renderer.push(`<!--]--></div> <div class="space-y-3.5 pt-3 border-t border-brand-200/60"><span class="text-[10px] font-bold uppercase tracking-wider text-warm-500 block">Setelan Transaksi</span> <div class="space-y-1.5"><label for="pos-pay" class="text-[10px] font-semibold text-warm-500 uppercase tracking-wide">Metode Pembayaran</label> `);
		$$renderer.select({
			id: "pos-pay",
			value: paymentMethod,
			required: true,
			class: "w-full px-3 py-1.5 bg-brand-50 border border-brand-300/60 text-warm-900 focus:border-brand-700 focus:ring-1 focus:outline-none rounded-xl text-xs"
		}, ($$renderer) => {
			$$renderer.option({ value: "QRIS" }, ($$renderer) => {
				$$renderer.push(`QRIS`);
			});
			$$renderer.option({ value: "Tunai" }, ($$renderer) => {
				$$renderer.push(`Tunai`);
			});
			$$renderer.option({ value: "Transfer Bank" }, ($$renderer) => {
				$$renderer.push(`Transfer Bank`);
			});
			$$renderer.option({ value: "Aplikasi Online" }, ($$renderer) => {
				$$renderer.push(`Aplikasi Online`);
			});
		});
		$$renderer.push(`</div> <div class="space-y-1.5"><label for="pos-date" class="text-[10px] font-semibold text-warm-500 uppercase tracking-wide">Tanggal Pembukuan</label> <input id="pos-date" type="date"${attr("value", date)} required="" class="w-full px-3 py-1.5 bg-brand-50 border border-brand-300/60 text-warm-900 focus:border-brand-700 focus:ring-1 focus:outline-none rounded-xl text-xs"/></div></div> <div class="p-3 bg-brand-100/80 border border-brand-300/60 rounded-xl space-y-2 mt-4"><div class="flex items-center justify-between text-xs text-warm-500"><span>Total Kuantitas</span> <span class="font-bold text-warm-800">${escape_html(totalPortions)} porsi</span></div> <div class="flex items-center justify-between pt-2 border-t border-brand-200/60"><span class="text-xs font-bold text-warm-800">Total Tagihan</span> <span class="text-base font-extrabold text-brand-800">${escape_html(formatRupiah(cartTotal))}</span></div></div> <button type="button"${attr("disabled", cart.length === 0, true)} class="w-full py-2.5 bg-brand-700 hover:bg-brand-800 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-brand-50 text-xs font-bold rounded-xl transition-all duration-150 cursor-pointer shadow-md">Proses</button></form></div></div></div> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]-->`);
		if ($$store_subs) unsubscribe_stores($$store_subs);
	});
}
//#endregion
//#region src/routes/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let activeTab = "Dashboard";
		let $$settled = true;
		let $$inner_renderer;
		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="min-h-screen flex flex-col md:flex-row font-sans">`);
			Sidebar($$renderer, {
				get activeTab() {
					return activeTab;
				},
				set activeTab($$value) {
					activeTab = $$value;
					$$settled = false;
				}
			});
			$$renderer.push(`<!----> <main class="flex-grow max-w-6xl w-full mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-10">`);
			if (activeTab === "Dashboard") {
				$$renderer.push("<!--[0-->");
				Dashboard($$renderer, {
					get activeTab() {
						return activeTab;
					},
					set activeTab($$value) {
						activeTab = $$value;
						$$settled = false;
					}
				});
			} else if (activeTab === "POS") {
				$$renderer.push("<!--[1-->");
				$$renderer.push(`<section class="animate-fade-in">`);
				POSView($$renderer, {});
				$$renderer.push(`<!----></section>`);
			} else if (activeTab === "FinancialReport") {
				$$renderer.push("<!--[2-->");
				$$renderer.push(`<section class="animate-fade-in">`);
				FinancialReport($$renderer, {});
				$$renderer.push(`<!----></section>`);
			} else if (activeTab === "Products") {
				$$renderer.push("<!--[3-->");
				$$renderer.push(`<section class="animate-fade-in">`);
				ProductManagement($$renderer, {});
				$$renderer.push(`<!----></section>`);
			} else if (activeTab === "History") {
				$$renderer.push("<!--[4-->");
				$$renderer.push(`<section class="animate-fade-in">`);
				HistoryView($$renderer, {});
				$$renderer.push(`<!----></section>`);
			} else if (activeTab === "Settings") {
				$$renderer.push("<!--[5-->");
				$$renderer.push(`<section class="animate-fade-in">`);
				SettingsView($$renderer, {});
				$$renderer.push(`<!----></section>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></main></div>`);
		}
		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);
		$$renderer.subsume($$inner_renderer);
	});
}
//#endregion
export { _page as default };

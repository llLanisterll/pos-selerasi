import { M as derived, P as writable } from "../../chunks/index-server.js";
import "../../chunks/index-server2.js";
import "../../chunks/pwaStore.js";
writable([]);
var transactions = writable([]);
derived([derived(transactions, ($transactions) => {
	return $transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + Number(t.amount), 0);
}), derived(transactions, ($transactions) => {
	return $transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + Number(t.amount), 0);
})], ([$totalIncome, $totalExpense]) => {
	return $totalIncome - $totalExpense;
});
derived(transactions, ($transactions) => {
	return $transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + (Number(t.quantity) || 0), 0);
});
writable([]);
//#endregion
//#region src/routes/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let $$settled = true;
		let $$inner_renderer;
		function $$render_inner($$renderer) {
			$$renderer.push("<!--[1-->");
			$$renderer.push(`<div class="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-tr from-brand-100 via-warm-50 to-brand-50/50 font-sans"><div class="relative flex items-center justify-center"><div class="absolute w-24 h-24 rounded-full bg-brand-700/10 animate-ping"></div> <div class="w-16 h-16 rounded-full border-4 border-brand-200 border-t-brand-700 animate-spin"></div> <div class="absolute w-8 h-8 text-brand-700 flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><path d="M 85,25 C 75,18 55,18 42,24 C 26,30 22,48 29,62 C 34,71 44,79 47,82 C 51,86 33,88 32,82 C 31,76 43,76 49,83"></path></svg></div></div> <p class="text-sm font-bold text-warm-700 mt-6 tracking-wide animate-pulse">Menghubungkan ke Selerasi Cloud...</p></div>`);
			$$renderer.push(`<!--]-->`);
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

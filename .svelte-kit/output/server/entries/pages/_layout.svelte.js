import { K as attr, f as store_get, m as unsubscribe_stores, o as attr_class, p as stringify, q as escape_html, u as ensure_array_like } from "../../chunks/index-server.js";
import { i as confirmation, o as notifications } from "../../chunks/pwaStore.js";
//#region src/components/NotificationToast.svelte
function NotificationToast($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const typeStyles = {
			success: "bg-emerald-50 border-emerald-200 text-emerald-800 icon-emerald-600",
			error: "bg-rose-50 border-rose-200 text-rose-800 icon-rose-600",
			info: "bg-blue-50 border-blue-200 text-blue-800 icon-blue-600",
			warning: "bg-amber-50 border-amber-200 text-amber-800 icon-amber-600"
		};
		$$renderer.push(`<div class="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none"><!--[-->`);
		const each_array = ensure_array_like(store_get($$store_subs ??= {}, "$notifications", notifications));
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let notification = each_array[$$index];
			$$renderer.push(`<div${attr_class(`pointer-events-auto flex items-start p-4 rounded-2xl border shadow-lg backdrop-blur-md ${stringify(typeStyles[notification.type] || typeStyles.success)} transition-all duration-300`)}><div class="shrink-0 mr-3 mt-0.5">`);
			if (notification.type === "success") {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"></path></svg>`);
			} else if (notification.type === "error") {
				$$renderer.push("<!--[1-->");
				$$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"></path></svg>`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"></path></svg>`);
			}
			$$renderer.push(`<!--]--></div> <div class="flex-grow"><p class="text-xs font-bold leading-relaxed">${escape_html(notification.message)}</p></div> <button class="shrink-0 ml-4 p-0.5 hover:bg-black/5 rounded-lg transition-colors cursor-pointer"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4 opacity-50"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"></path></svg></button></div>`);
		}
		$$renderer.push(`<!--]--></div>`);
		if ($$store_subs) unsubscribe_stores($$store_subs);
	});
}
//#endregion
//#region src/components/ConfirmationModal.svelte
function ConfirmationModal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let style;
		const typeStyles = {
			danger: {
				iconBg: "bg-rose-100",
				iconColor: "text-rose-600",
				confirmBtn: "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200",
				iconPath: "m14.74 9-.34 12.142m-10.11-12.14 1.1 11.24a2.25 2.25 0 0 0 2.23 2.19h8.56a2.25 2.25 0 0 0 2.23-2.19l1.1-11.24m-12 0h12m-9-3h9m-7.3-3.6H17c.445 0 .833.207 1.085.53l.9 1.25M6.285 5.25c.252-.323.64-.53 1.085-.53h8.56c.445 0 .833.207 1.085.53"
			},
			warning: {
				iconBg: "bg-amber-100",
				iconColor: "text-amber-600",
				confirmBtn: "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-200",
				iconPath: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
			},
			info: {
				iconBg: "bg-blue-100",
				iconColor: "text-blue-600",
				confirmBtn: "bg-brand-700 hover:bg-brand-800 text-white shadow-brand-200",
				iconPath: "m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
			}
		};
		$: style = typeStyles[store_get($$store_subs ??= {}, "$confirmation", confirmation).type] || typeStyles.danger;
		if (store_get($$store_subs ??= {}, "$confirmation", confirmation).isOpen) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-warm-900/40 backdrop-blur-sm"><div class="bg-white rounded-3xl shadow-2xl border border-brand-300/50 max-w-sm w-full overflow-hidden"><div class="p-6"><div class="flex items-center gap-4 mb-4"><div${attr_class(`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center ${stringify(style.iconBg)} ${stringify(style.iconColor)} shadow-inner`)}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round"${attr("d", style.iconPath)}></path></svg></div> <div><h3 class="text-base font-extrabold text-warm-900 leading-tight">${escape_html(store_get($$store_subs ??= {}, "$confirmation", confirmation).title)}</h3></div></div> <p class="text-sm text-warm-500 leading-relaxed font-medium">${escape_html(store_get($$store_subs ??= {}, "$confirmation", confirmation).message)}</p></div> <div class="flex items-center gap-3 p-4 bg-brand-50/50 border-t border-brand-100"><button class="flex-1 px-4 py-2.5 bg-white border border-brand-300 text-warm-600 text-xs font-bold rounded-xl hover:bg-brand-50 hover:text-warm-800 transition-all cursor-pointer active:scale-95">${escape_html(store_get($$store_subs ??= {}, "$confirmation", confirmation).cancelText)}</button> <button${attr_class(`flex-1 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer ${stringify(style.confirmBtn)}`)}>${escape_html(store_get($$store_subs ??= {}, "$confirmation", confirmation).confirmText)}</button></div></div></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]-->`);
		if ($$store_subs) unsubscribe_stores($$store_subs);
	});
}
//#endregion
//#region src/routes/+layout.svelte
function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children } = $$props;
		children($$renderer);
		$$renderer.push(`<!----> `);
		NotificationToast($$renderer, {});
		$$renderer.push(`<!----> `);
		ConfirmationModal($$renderer, {});
		$$renderer.push(`<!---->`);
	});
}
//#endregion
export { _layout as default };

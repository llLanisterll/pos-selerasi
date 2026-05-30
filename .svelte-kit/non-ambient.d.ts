
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	type MatcherParam<M> = M extends (param : string) => param is (infer U extends string) ? U : string;

	export interface AppTypes {
		RouteId(): "/" | "/api" | "/api/auth" | "/api/auth/login" | "/api/auth/logout" | "/api/auth/session" | "/api/categories" | "/api/categories/[id]" | "/api/clear-all" | "/api/import" | "/api/products" | "/api/products/[id]" | "/api/reset-demo" | "/api/transactions" | "/api/transactions/[id]" | "/api/users" | "/api/users/[id]";
		RouteParams(): {
			"/api/categories/[id]": { id: string };
			"/api/products/[id]": { id: string };
			"/api/transactions/[id]": { id: string };
			"/api/users/[id]": { id: string }
		};
		LayoutParams(): {
			"/": { id?: string | undefined };
			"/api": { id?: string | undefined };
			"/api/auth": Record<string, never>;
			"/api/auth/login": Record<string, never>;
			"/api/auth/logout": Record<string, never>;
			"/api/auth/session": Record<string, never>;
			"/api/categories": { id?: string | undefined };
			"/api/categories/[id]": { id: string };
			"/api/clear-all": Record<string, never>;
			"/api/import": Record<string, never>;
			"/api/products": { id?: string | undefined };
			"/api/products/[id]": { id: string };
			"/api/reset-demo": Record<string, never>;
			"/api/transactions": { id?: string | undefined };
			"/api/transactions/[id]": { id: string };
			"/api/users": { id?: string | undefined };
			"/api/users/[id]": { id: string }
		};
		Pathname(): "/" | "/api/auth/login" | "/api/auth/logout" | "/api/auth/session" | "/api/categories" | `/api/categories/${string}` & {} | "/api/clear-all" | "/api/import" | "/api/products" | `/api/products/${string}` & {} | "/api/reset-demo" | "/api/transactions" | `/api/transactions/${string}` & {} | "/api/users" | `/api/users/${string}` & {};
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): string & {};
	}
}
export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["favicon.svg","icons.svg"]),
	mimeTypes: {".svg":"image/svg+xml"},
	_: {
		client: {start:"_app/immutable/entry/start.BWWW1vyY.js",app:"_app/immutable/entry/app.BgNt9bIX.js",imports:["_app/immutable/entry/start.BWWW1vyY.js","_app/immutable/chunks/BokSQLcA.js","_app/immutable/chunks/C3P_qD7P.js","_app/immutable/chunks/C_AfetXM.js","_app/immutable/entry/app.BgNt9bIX.js","_app/immutable/chunks/C3P_qD7P.js","_app/immutable/chunks/BcgnSMxp.js","_app/immutable/chunks/DXLwiZ0H.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/api/admin/logs",
				pattern: /^\/api\/admin\/logs\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/admin/logs/_server.js'))
			},
			{
				id: "/api/admin/maintenance",
				pattern: /^\/api\/admin\/maintenance\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/admin/maintenance/_server.js'))
			},
			{
				id: "/api/admin/settings",
				pattern: /^\/api\/admin\/settings\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/admin/settings/_server.js'))
			},
			{
				id: "/api/admin/stats",
				pattern: /^\/api\/admin\/stats\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/admin/stats/_server.js'))
			},
			{
				id: "/api/auth/login",
				pattern: /^\/api\/auth\/login\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/auth/login/_server.js'))
			},
			{
				id: "/api/auth/logout",
				pattern: /^\/api\/auth\/logout\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/auth/logout/_server.js'))
			},
			{
				id: "/api/auth/session",
				pattern: /^\/api\/auth\/session\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/auth/session/_server.js'))
			},
			{
				id: "/api/categories",
				pattern: /^\/api\/categories\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/categories/_server.js'))
			},
			{
				id: "/api/categories/[id]",
				pattern: /^\/api\/categories\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/categories/_id_/_server.js'))
			},
			{
				id: "/api/clear-all",
				pattern: /^\/api\/clear-all\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/clear-all/_server.js'))
			},
			{
				id: "/api/import",
				pattern: /^\/api\/import\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/import/_server.js'))
			},
			{
				id: "/api/products",
				pattern: /^\/api\/products\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/products/_server.js'))
			},
			{
				id: "/api/products/[id]",
				pattern: /^\/api\/products\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/products/_id_/_server.js'))
			},
			{
				id: "/api/reset-demo",
				pattern: /^\/api\/reset-demo\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/reset-demo/_server.js'))
			},
			{
				id: "/api/transactions",
				pattern: /^\/api\/transactions\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/transactions/_server.js'))
			},
			{
				id: "/api/transactions/[id]",
				pattern: /^\/api\/transactions\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/transactions/_id_/_server.js'))
			},
			{
				id: "/api/users",
				pattern: /^\/api\/users\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/users/_server.js'))
			},
			{
				id: "/api/users/[id]",
				pattern: /^\/api\/users\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/users/_id_/_server.js'))
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();

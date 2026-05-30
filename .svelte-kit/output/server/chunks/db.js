import { t as private_env } from "./shared-server.js";
import { createClient } from "@supabase/supabase-js";
//#region \0virtual:env/static/private
/** @type {import('$env/static/private').SUPABASE_ANON_KEY} */
var SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyaHV5cm11YW5idGNsYm1ubGpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxMjQ0OTQsImV4cCI6MjA5NTcwMDQ5NH0.85VpJHF52nXu0GeetwQNJVr2bKK4FQFLAFnbZkXP4mk";
/** @type {import('$env/static/private').SUPABASE_URL} */
var SUPABASE_URL = "https://urhuyrmuanbtclbmnljq.supabase.co";
var supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
var supabaseAdmin = private_env.SUPABASE_SERVICE_ROLE_KEY ? createClient(SUPABASE_URL, private_env.SUPABASE_SERVICE_ROLE_KEY, { auth: {
	autoRefreshToken: false,
	persistSession: false
} }) : null;
//#endregion
export { supabaseAdmin as n, supabase as t };

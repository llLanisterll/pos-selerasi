<script>
  import { createEventDispatcher } from 'svelte';
  
  const dispatch = createEventDispatcher();
  
  let email = '';
  let password = '';
  let showPassword = false;
  let loading = false;
  let errorMessage = '';

  async function handleLogin(e) {
    e.preventDefault();
    if (loading) return;
    
    loading = true;
    errorMessage = '';
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Login gagal. Periksa kembali email dan password Anda.');
      }
      
      // Dispatch sukses login ke parent (+page.svelte)
      dispatch('loginSuccess', { user: data.user });
    } catch (err) {
      errorMessage = err.message;
    } finally {
      loading = false;
    }
  }
</script>

<div class="min-h-screen w-full flex items-center justify-center bg-gradient-to-tr from-brand-100 via-warm-50 to-brand-50/50 px-4 py-12 relative overflow-hidden font-sans">
  <!-- Decorative Background Glows -->
  <div class="absolute w-80 h-80 rounded-full bg-brand-200/40 -top-10 -left-10 blur-3xl"></div>
  <div class="absolute w-96 h-96 rounded-full bg-amber-100/40 -bottom-20 -right-20 blur-3xl"></div>
  
  <!-- Login Card (Glassmorphism) -->
  <div class="relative w-full max-w-md backdrop-blur-md bg-white/80 border border-white/40 shadow-2xl rounded-3xl p-8 sm:p-10 transition-all duration-300">
    
    <!-- Logo & Header -->
    <div class="text-center mb-8">
      <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-700 text-brand-50 shadow-lg shadow-brand-700/20 mb-4 animate-bounce p-3.5">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="7.5" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full">
          <path d="M 85,25 C 75,18 55,18 42,24 C 26,30 22,48 29,62 C 34,71 44,79 47,82 C 51,86 33,88 32,82 C 31,76 43,76 49,83" />
        </svg>
      </div>
      <h2 class="text-2xl font-bold tracking-tight text-warm-900">Selerasi POS</h2>
      <p class="text-sm text-warm-500 mt-1">Sistem POS & Pencatatan Keuangan Pintar</p>
    </div>

    <!-- Error Alert -->
    {#if errorMessage}
      <div class="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 text-xs font-medium flex items-start gap-2.5 animate-shake">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 shrink-0 mt-0.5">
          <path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clip-rule="evenodd" />
        </svg>
        <span>{errorMessage}</span>
      </div>
    {/if}

    <!-- Sign In Form -->
    <form on:submit={handleLogin} class="space-y-5">
      <!-- Email Input -->
      <div>
        <label for="username" class="block text-xs font-bold text-warm-700 uppercase tracking-wider mb-2">Email Admin</label>
        <div class="relative">
          <span class="absolute inset-y-0 left-0 flex items-center pl-3.5 text-warm-400">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
              <path d="M3 4a2 2 0 0 0-2 2v1.161l8.441 4.22a1.25 1.25 0 0 0 1.118 0L19 7.162V6a2 2 0 0 0-2-2H3Z" />
              <path d="m19 8.839-7.903 3.952a2.75 2.75 0 0 1-2.194 0L1 8.839V14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.839Z" />
            </svg>
          </span>
          <input
            type="email"
            id="username"
            name="email"
            autocomplete="username"
            bind:value={email}
            required
            placeholder="admin@selerasi.com"
            class="block w-full pl-10 pr-4 py-3 bg-white/70 border border-brand-200 text-warm-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition duration-200"
          />
        </div>
      </div>

      <!-- Password Input -->
      <div>
        <div class="flex justify-between items-center mb-2">
          <label for="current-password" class="block text-xs font-bold text-warm-700 uppercase tracking-wider">Password</label>
        </div>
        <div class="relative">
          <span class="absolute inset-y-0 left-0 flex items-center pl-3.5 text-warm-400">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
              <path fill-rule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clip-rule="evenodd" />
            </svg>
          </span>
          <input
            type={showPassword ? 'text' : 'password'}
            id="current-password"
            name="password"
            autocomplete="current-password"
            bind:value={password}
            required
            placeholder="••••••••"
            class="block w-full pl-10 pr-12 py-3 bg-white/70 border border-brand-200 text-warm-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition duration-200"
          />
          <!-- Show/Hide Toggle -->
          <button
            type="button"
            on:click={() => showPassword = !showPassword}
            class="absolute inset-y-0 right-0 flex items-center pr-3 text-warm-400 hover:text-warm-600 transition cursor-pointer"
            title={showPassword ? "Sembunyikan sandi" : "Tampilkan sandi"}
          >
            {#if showPassword}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                <path fill-rule="evenodd" d="M3.28 2.22a.75.75 0 0 0-1.06 1.06l14.5 14.5a.75.75 0 1 0 1.06-1.06l-1.745-1.745a10.029 10.029 0 0 0 3.3-4.38.75.75 0 0 0 0-.536C17.64 5.92 14.06 4 10 4a9.962 9.962 0 0 0-4.733 1.18L3.28 2.22ZM10 6c2.81 0 5.48 1.48 6.74 3.739a8.528 8.528 0 0 0-2.316-2.923L12.9 8.34A3.5 3.5 0 0 0 9.5 8.016L6.96 5.476C7.942 5.163 8.956 6 10 6Zm-2.73 4.33 1.54 1.54a1.5 1.5 0 0 1-1.54-1.54ZM2.054 9.473a.75.75 0 0 0 0 .536 9.96 9.96 0 0 0 7.3 6c.215.034.428.053.64.053a9.96 9.96 0 0 0 4.195-.916l-1.545-1.545A8.528 8.528 0 0 1 10 14c-2.81 0-5.48-1.48-6.74-3.739a8.528 8.528 0 0 0 1.346-2.1L2.054 9.473Z" clip-rule="evenodd" />
              </svg>
            {:else}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                <path fill-rule="evenodd" d="M.664 9.736a.75.75 0 0 0 0 .528C2.36 14.08 5.94 16 10 16s7.64-1.92 9.336-5.736a.75.75 0 0 0 0-.528C17.64 5.92 14.06 4 10 4S2.36 5.92.664 9.736ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" clip-rule="evenodd" />
              </svg>
            {/if}
          </button>
        </div>
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        disabled={loading}
        class="w-full py-3 bg-brand-700 hover:bg-brand-800 disabled:bg-brand-400 text-brand-50 text-sm font-bold rounded-xl shadow-lg shadow-brand-700/10 active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer"
      >
        {#if loading}
          <!-- Loading Spinner -->
          <svg class="animate-spin h-5 w-5 text-brand-50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Mengecek kredensial...
        {:else}
          Masuk ke POS
        {/if}
      </button>
    </form>

    <!-- Additional Info (Footer) -->
    <div class="mt-8 text-center text-xs text-warm-400">
      <p>© 2026 Selerasi POS. All rights reserved.</p>
    </div>
  </div>
</div>

<style>
  /* Subtle alert shake animation */
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
    20%, 40%, 60%, 80% { transform: translateX(4px); }
  }
  .animate-shake {
    animation: shake 0.4s ease-in-out;
  }
</style>

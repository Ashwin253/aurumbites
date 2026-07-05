"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const [view, setView] = useState("signin"); // "signin" | "magiclink" | "reset"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Reset Password / Recovery States
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Listen for auth state changes (e.g. clicking magic link or password reset)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        // Set cookies manually for server-side middleware and actions
        const maxAge = session.expires_in || 3600;
        document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=${maxAge}; SameSite=Lax; Secure`;
        if (session.refresh_token) {
          document.cookie = `sb-refresh-token=${session.refresh_token}; path=/; max-age=604800; SameSite=Lax; Secure`;
        }

        if (event === "PASSWORD_RECOVERY") {
          setView("reset");
        } else if (event === "SIGNED_IN") {
          if (view !== "reset") {
            router.push("/data");
            router.refresh();
          }
        }
      }
    });

    // Also check if we landed with recovery parameters in the URL query/hash directly as fallback
    if (typeof window !== "undefined") {
      const hash = window.location.hash || "";
      const search = window.location.search || "";
      if (hash.includes("type=recovery") || search.includes("type=recovery")) {
        setView("reset");
      }
    }

    return () => {
      subscription.unsubscribe();
    };
  }, [router, view]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
      } else if (data?.session) {
        // Set cookies manually for server-side middleware and actions
        const maxAge = data.session.expires_in || 3600;
        document.cookie = `sb-access-token=${data.session.access_token}; path=/; max-age=${maxAge}; SameSite=Lax; Secure`;
        if (data.session.refresh_token) {
          document.cookie = `sb-refresh-token=${data.session.refresh_token}; path=/; max-age=604800; SameSite=Lax; Secure`;
        }
        
        router.push("/data");
        router.refresh();
      }
    } catch (err) {
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMagicLink = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const redirectUrl = typeof window !== "undefined" ? window.location.origin + "/login" : "";
      
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectUrl,
        }
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setSuccessMsg("Magic Link sent! Please check your email inbox to log in.");
      }
    } catch (err) {
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendResetLink = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const redirectUrl = typeof window !== "undefined" ? window.location.origin + "/login" : "";
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setSuccessMsg("Password reset link sent! Check your email inbox to reset your password.");
      }
    } catch (err) {
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setSuccessMsg("Password updated successfully! Redirecting you...");
        setTimeout(() => {
          router.push("/data");
          router.refresh();
        }, 1500);
      }
    } catch (err) {
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-[#0a0a0a] flex items-center justify-center overflow-hidden font-sans">
      {/* Decorative background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md px-6 z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-white bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">
            Aurum Bites
          </h1>
          <p className="mt-2 text-sm text-neutral-400">
            Dashboard Administration Portal
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          
          {/* VIEW: SIGN IN WITH PASSWORD */}
          {view === "signin" && (
            <>
              <h2 className="text-xl font-semibold text-white mb-6">
                Sign In
              </h2>

              {errorMsg && (
                <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-transparent transition"
                    placeholder="admin@aurumbites.com"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor="password" className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMsg("");
                        setSuccessMsg("");
                        setView("magiclink");
                      }}
                      className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition focus:outline-none"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-transparent transition"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 w-full rounded-xl bg-amber-500 py-3 text-sm font-semibold text-neutral-950 hover:bg-amber-400 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-amber-500/20"
                >
                  {loading ? "Authenticating..." : "Sign In"}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => {
                    setErrorMsg("");
                    setSuccessMsg("");
                    setView("magiclink");
                  }}
                  className="text-xs text-neutral-400 hover:text-white transition"
                >
                  Sign in with passwordless Magic Link
                </button>
              </div>
            </>
          )}

          {/* VIEW: MAGIC LINK / RESET REQUEST */}
          {view === "magiclink" && (
            <>
              <h2 className="text-xl font-semibold text-white mb-2">
                Password Recovery & Magic Link
              </h2>
              <p className="text-xs text-neutral-400 mb-6">
                Enter your email address to sign in instantly or request a password reset.
              </p>

              {errorMsg && (
                <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
                  {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-sm text-emerald-400">
                  {successMsg}
                </div>
              )}

              <form className="space-y-5">
                <div>
                  <label htmlFor="recoveryEmail" className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <input
                    id="recoveryEmail"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-transparent transition"
                    placeholder="admin@aurumbites.com"
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pt-2">
                  <button
                    type="button"
                    onClick={handleSendMagicLink}
                    disabled={loading || !email}
                    className="w-full rounded-xl border border-white/15 bg-white/5 py-3 text-xs font-semibold text-white hover:bg-white/10 active:scale-[0.98] transition disabled:opacity-40 disabled:pointer-events-none"
                  >
                    Send Magic Login Link
                  </button>
                  <button
                    type="button"
                    onClick={handleSendResetLink}
                    disabled={loading || !email}
                    className="w-full rounded-xl bg-amber-500 py-3 text-xs font-semibold text-neutral-950 hover:bg-amber-400 active:scale-[0.98] transition disabled:opacity-40 disabled:pointer-events-none shadow-lg shadow-amber-500/10"
                  >
                    Send Reset Link
                  </button>
                </div>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => {
                    setErrorMsg("");
                    setSuccessMsg("");
                    setView("signin");
                  }}
                  className="text-xs text-amber-400 hover:text-amber-300 font-semibold transition"
                >
                  ← Back to standard Sign In
                </button>
              </div>
            </>
          )}

          {/* VIEW: PASSWORD RESET (RECOVERY ACTION) */}
          {view === "reset" && (
            <>
              <h2 className="text-xl font-semibold text-white mb-2">
                Set New Password
              </h2>
              <p className="text-xs text-neutral-400 mb-6">
                Choose a new secure password for your account.
              </p>

              {errorMsg && (
                <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
                  {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-sm text-emerald-400">
                  {successMsg}
                </div>
              )}

              <form onSubmit={handleUpdatePassword} className="space-y-5">
                <div>
                  <label htmlFor="newPassword" className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                    New Password
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-transparent transition"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label htmlFor="confirmNewPassword" className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                    Confirm New Password
                  </label>
                  <input
                    id="confirmNewPassword"
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-transparent transition"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 w-full rounded-xl bg-amber-500 py-3 text-sm font-semibold text-neutral-950 hover:bg-amber-400 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-amber-500/20"
                >
                  {loading ? "Updating..." : "Update & Sign In"}
                </button>
              </form>
            </>
          )}

        </div>

        <div className="text-center mt-6">
          <Link href="/shop" className="text-xs text-neutral-500 hover:text-neutral-300 transition">
            ← Back to Shop Catalog
          </Link>
        </div>
      </div>
    </main>
  );
}

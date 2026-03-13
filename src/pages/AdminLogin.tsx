import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Shield, Loader2, AlertCircle } from "lucide-react";
import { auth, googleProvider, signInWithPopup } from "../firebase";
import { doc, getDoc, db } from "../firebase";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Check if user is an admin
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const isAdmin = (userDoc.exists() && userDoc.data().role === "admin") || 
                      user.email === "mdnahidulislamnahid404@gmail.com";

      if (isAdmin) {
        localStorage.setItem("admin_access", "true");
        window.dispatchEvent(new Event("admin_login"));
        navigate("/admin/dashboard");
      } else {
        // Sign out if not an admin
        await auth.signOut();
        setError("Access denied. You do not have administrator privileges.");
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError("Failed to sign in. Please try again.");
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 font-sans selection:bg-emerald-500/30">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-6 shadow-[0_0_30px_rgba(16,185,129,0.1)]"
          >
            <Shield className="w-8 h-8 text-emerald-500" />
          </motion.div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase mb-2">
            NextGen <span className="text-emerald-500">Admin</span> Access
          </h1>
          <p className="text-zinc-500 text-sm font-medium tracking-widest uppercase">Secure Authentication Gateway</p>
        </div>

        <motion.div
          animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
          className="bg-zinc-900/40 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 shadow-2xl shadow-black/50 text-center"
        >
          <div className="mb-8">
            <p className="text-zinc-400">
              Administrator access requires verification via Google Workspace.
            </p>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign In with Google
              </>
            )}
          </button>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-6 flex items-center gap-2 text-red-400 text-sm font-medium bg-red-400/10 p-3 rounded-xl border border-red-400/20"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p className="text-left">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-8 pt-6 border-t border-white/5 flex flex-col items-center gap-4">
            <div className="flex gap-4">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse [animation-delay:0.2s]"></div>
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse [animation-delay:0.4s]"></div>
            </div>
            <p className="text-[10px] text-zinc-600 font-bold tracking-[0.2em] uppercase">System Integrity: Optimal</p>
          </div>
        </motion.div>

        <div className="mt-8 text-center">
          <button
            onClick={() => navigate("/login")}
            className="text-zinc-500 hover:text-emerald-500 text-xs font-bold tracking-widest uppercase transition-colors"
          >
            ← Return to Public Portal
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { auth, googleProvider, signInWithPopup } from "../firebase";
import { LogIn, Github, Chrome, Loader2 } from "lucide-react";
import { motion } from "motion/react";

const Login = () => {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-emerald-600 tracking-tighter mb-2">NEXTGEN</h1>
          <p className="text-zinc-500">The next generation of social interaction.</p>
        </div>

        <div className="card p-8 shadow-xl shadow-zinc-200/50">
          <h2 className="text-2xl font-bold text-zinc-900 mb-6 text-center">Welcome Back</h2>
          
          <div className="space-y-4">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-semibold py-3 px-4 rounded-2xl transition-all disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Chrome className="w-5 h-5 text-emerald-600" />
              )}
              Continue with Google
            </button>

            <button
              disabled
              className="w-full flex items-center justify-center gap-3 bg-zinc-900 hover:bg-black text-white font-semibold py-3 px-4 rounded-2xl transition-all opacity-50 cursor-not-allowed"
            >
              <Github className="w-5 h-5" />
              Continue with GitHub
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-zinc-100 text-center">
            <p className="text-sm text-zinc-500 mb-4">
              By continuing, you agree to NextGen's <br />
              <a href="#" className="text-emerald-600 hover:underline font-medium">Terms of Service</a> and <a href="#" className="text-emerald-600 hover:underline font-medium">Privacy Policy</a>.
            </p>
            <Link 
              to="/admin/login" 
              className="text-xs text-zinc-400 hover:text-emerald-600 font-medium transition-colors"
            >
              Admin Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

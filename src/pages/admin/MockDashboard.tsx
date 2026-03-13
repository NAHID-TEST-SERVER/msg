import React from "react";
import { ShieldAlert, Users, MessageSquare, Activity, AlertTriangle } from "lucide-react";
import { motion } from "motion/react";

const MockDashboard = () => {
  return (
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 flex items-start gap-4"
      >
        <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-1" />
        <div>
          <h2 className="text-lg font-bold text-amber-500 mb-2">Preview Mode Active</h2>
          <p className="text-amber-500/80 text-sm leading-relaxed">
            You are currently logged in using the local bypass credentials. Because Firebase Firestore is secured, 
            real data cannot be fetched or modified without proper authentication. The data shown below is simulated.
            <br /><br />
            <strong>To manage real users and content, please log out and sign in using the "Sign In with Google" button.</strong>
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
            <span className="text-emerald-500 text-sm font-bold">+12%</span>
          </div>
          <p className="text-zinc-500 text-sm font-medium uppercase tracking-wider mb-1">Total Users</p>
          <h3 className="text-3xl font-black text-white">1,248</h3>
        </div>

        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-purple-500" />
            </div>
            <span className="text-emerald-500 text-sm font-bold">+5%</span>
          </div>
          <p className="text-zinc-500 text-sm font-medium uppercase tracking-wider mb-1">Total Posts</p>
          <h3 className="text-3xl font-black text-white">8,432</h3>
        </div>

        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6 text-red-500" />
            </div>
            <span className="text-red-500 text-sm font-bold">+2</span>
          </div>
          <p className="text-zinc-500 text-sm font-medium uppercase tracking-wider mb-1">Active Reports</p>
          <h3 className="text-3xl font-black text-white">14</h3>
        </div>

        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Activity className="w-6 h-6 text-emerald-500" />
            </div>
            <span className="text-emerald-500 text-sm font-bold">Stable</span>
          </div>
          <p className="text-zinc-500 text-sm font-medium uppercase tracking-wider mb-1">System Status</p>
          <h3 className="text-3xl font-black text-white">Optimal</h3>
        </div>
      </div>

      <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-8 text-center">
        <ShieldAlert className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Detailed Analytics Unavailable</h3>
        <p className="text-zinc-500 max-w-md mx-auto">
          Detailed user management, post moderation, and platform settings are disabled in preview mode. 
          Please authenticate with Google to access these features.
        </p>
      </div>
    </div>
  );
};

export default MockDashboard;

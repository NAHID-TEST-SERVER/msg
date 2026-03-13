import React from "react";
import { useNavigate, useLocation, Routes, Route, Navigate } from "react-router-dom";
import { motion } from "motion/react";
import { LayoutDashboard, Users, ShieldAlert, BarChart3, Settings as SettingsIcon, LogOut, Search, Bell, Ticket } from "lucide-react";

import Overview from "./admin/Overview";
import UsersPage from "./admin/Users";
import PostsPage from "./admin/Posts";
import AnalyticsPage from "./admin/Analytics";
import SettingsPage from "./admin/Settings";
import ReportsPage from "./admin/Reports";
import MockDashboard from "./admin/MockDashboard";

const AdminDashboard = ({ user, isFirebaseAdmin }: { user: any, isFirebaseAdmin: boolean }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: "Overview", path: "/admin/dashboard" },
    { icon: Users, label: "User Management", path: "/admin/users" },
    { icon: ShieldAlert, label: "Posts & Moderation", path: "/admin/posts" },
    { icon: Ticket, label: "Reports & Tickets", path: "/admin/reports" },
    { icon: BarChart3, label: "Analytics", path: "/admin/analytics" },
    { icon: SettingsIcon, label: "Platform Settings", path: "/admin/settings" },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-zinc-900 border-r border-white/5 p-6 flex flex-col z-20">
        <div className="mb-10">
          <h1 className="text-xl font-black text-emerald-500 tracking-tighter uppercase">NextGen Admin</h1>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path === "/admin/dashboard" && location.pathname === "/admin");
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" : "text-zinc-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <button
          onClick={() => {
            localStorage.removeItem("admin_access");
            window.dispatchEvent(new Event("admin_logout"));
            navigate("/login");
          }}
          className="mt-auto flex items-center gap-3 px-4 py-3 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Exit Admin</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8 min-h-screen">
        {/* Header */}
        <header className="flex items-center justify-end mb-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search analytics..."
                className="bg-zinc-900 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-emerald-500/50 transition-all text-white"
              />
            </div>
            <button className="p-2 bg-zinc-900 border border-white/10 rounded-xl text-zinc-400 hover:text-white transition-all relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-white/10">
              <div className="text-right">
                <p className="text-sm font-bold text-white">Admin</p>
                <p className="text-xs text-zinc-500">{isFirebaseAdmin ? "Super Admin" : "Preview Mode"}</p>
              </div>
              <img
                src={user?.photoURL || "https://picsum.photos/seed/admin/100"}
                alt="Admin"
                className="w-10 h-10 rounded-xl object-cover border border-white/10"
              />
            </div>
          </div>
        </header>

        {!isFirebaseAdmin ? (
          <MockDashboard />
        ) : (
          <Routes>
            <Route path="/" element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Overview adminId={user.uid} />} />
            <Route path="users" element={<UsersPage adminId={user.uid} />} />
            <Route path="posts" element={<PostsPage adminId={user.uid} />} />
            <Route path="reports" element={<ReportsPage adminId={user.uid} />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="settings" element={<SettingsPage adminId={user.uid} />} />
          </Routes>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;

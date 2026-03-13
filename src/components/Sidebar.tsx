import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, MessageCircle, Users, Bell, Bookmark, Settings, ShoppingBag, Compass } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Sidebar = ({ className }: { className?: string }) => {
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: MessageCircle, label: "Messenger", path: "/messenger" },
    { icon: Compass, label: "Explore", path: "/explore" },
    { icon: Users, label: "Groups", path: "/groups" },
    { icon: ShoppingBag, label: "Marketplace", path: "/marketplace" },
    { icon: Bell, label: "Notifications", path: "/notifications" },
    { icon: Bookmark, label: "Saved", path: "/saved" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  return (
    <aside className={cn("flex flex-col gap-2", className)}>
      {menuItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200",
              isActive 
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" 
                : "text-zinc-600 hover:bg-zinc-100"
            )}
          >
            <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-zinc-500")} />
            <span className="font-medium">{item.label}</span>
          </Link>
        );
      })}
      
      <div className="mt-auto p-4 card bg-emerald-50 border-emerald-100">
        <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-2">Pro Feature</p>
        <p className="text-sm text-emerald-700 mb-3">Upgrade to NextGen+ for exclusive AI features.</p>
        <button className="w-full btn-primary text-xs py-2">Learn More</button>
      </div>
    </aside>
  );
};

export default Sidebar;

import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, signOut } from "../firebase";
import { Search, MessageCircle, Bell, User, LogOut, LayoutGrid } from "lucide-react";

const Navbar = ({ user }: { user: any }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 glass z-50 flex items-center px-6 justify-between">
      <div className="flex items-center gap-8">
        <Link to="/" className="text-2xl font-bold text-emerald-600 tracking-tighter">
          NEXTGEN
        </Link>
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search NextGen..."
            className="input pl-10 w-64 h-10 text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Link to="/" className="p-2 hover:bg-zinc-100 rounded-xl transition-colors text-zinc-600">
          <LayoutGrid className="w-6 h-6" />
        </Link>
        <Link to="/messenger" className="p-2 hover:bg-zinc-100 rounded-xl transition-colors text-zinc-600">
          <MessageCircle className="w-6 h-6" />
        </Link>
        <button className="p-2 hover:bg-zinc-100 rounded-xl transition-colors text-zinc-600 relative">
          <Bell className="w-6 h-6" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="h-8 w-[1px] bg-zinc-200 mx-2"></div>

        <div className="flex items-center gap-3">
          <Link to={`/profile/${user?.uid}`} className="flex items-center gap-2 hover:bg-zinc-100 p-1 pr-3 rounded-xl transition-colors">
            <img
              src={user?.photoURL || `https://picsum.photos/seed/${user?.uid}/100`}
              alt="Profile"
              className="w-8 h-8 rounded-lg object-cover"
              referrerPolicy="no-referrer"
            />
            <span className="text-sm font-medium hidden sm:block">{user?.displayName?.split(" ")[0]}</span>
          </Link>
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-red-50 text-red-600 rounded-xl transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

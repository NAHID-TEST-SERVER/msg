import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db, collection, query, where, onSnapshot } from "../firebase";
import { UserPlus, MessageCircle, MoreHorizontal } from "lucide-react";

const RightSidebar = ({ className }: { className?: string }) => {
  const [bots, setBots] = useState<any[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, "users"), where("isBot", "==", true));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const botList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBots(botList);
    });
    return () => unsubscribe();
  }, []);

  return (
    <aside className={className}>
      <div className="flex flex-col gap-6">
        {/* AI Bots Section */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-zinc-900">AI Companions</h3>
            <button className="text-emerald-600 hover:bg-emerald-50 p-1 rounded-lg transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
          <div className="flex flex-col gap-4">
            {bots.map((bot) => (
              <div key={bot.id} className="flex items-center justify-between group">
                <Link to={`/profile/${bot.id}`} className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={bot.profilePhoto}
                      alt={bot.displayName}
                      className="w-10 h-10 rounded-xl object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-900 group-hover:text-emerald-600 transition-colors">{bot.displayName}</p>
                    <p className="text-xs text-zinc-500 truncate w-32">AI Assistant</p>
                  </div>
                </Link>
                <Link
                  to={`/messenger/${bot.id}`}
                  className="p-2 bg-zinc-50 hover:bg-emerald-50 text-zinc-400 hover:text-emerald-600 rounded-xl transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Friend Suggestions */}
        <div className="card p-5">
          <h3 className="font-bold text-zinc-900 mb-4">Suggested for you</h3>
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={`https://picsum.photos/seed/suggest_${i}/100`}
                    alt="User"
                    className="w-10 h-10 rounded-xl object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">User {i}</p>
                    <p className="text-xs text-zinc-500">Suggested</p>
                  </div>
                </div>
                <button className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl transition-colors">
                  <UserPlus className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 text-sm text-emerald-600 font-medium hover:underline">See all suggestions</button>
        </div>

        {/* Footer Links */}
        <div className="px-4 text-xs text-zinc-400 flex flex-wrap gap-x-3 gap-y-1">
          <a href="#" className="hover:underline">Privacy</a>
          <a href="#" className="hover:underline">Terms</a>
          <a href="#" className="hover:underline">Advertising</a>
          <a href="#" className="hover:underline">Cookies</a>
          <p>© 2026 NextGen Social</p>
        </div>
      </div>
    </aside>
  );
};

export default RightSidebar;

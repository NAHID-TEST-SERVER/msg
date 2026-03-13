import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from "../../firebase";
import { db } from "../../firebase";
import { banUser, deleteUser, updateUserRole } from "../../services/adminService";
import { Search, ShieldAlert, Trash2, UserCog, UserX, Shield, Activity } from "lucide-react";
import { handleFirestoreError, OperationType } from "../../utils/firestoreErrorHandler";

const Users = ({ adminId }: { adminId: string }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"users" | "spam">("users");

  useEffect(() => {
    const unsubscribeUsers = onSnapshot(
      collection(db, "users"), 
      (snapshot) => {
        const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsers(usersData);
      },
      (error) => handleFirestoreError(error, OperationType.GET, "users")
    );

    const unsubscribeRequests = onSnapshot(
      collection(db, "friend_requests"), 
      (snapshot) => {
        const requestsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setFriendRequests(requestsData);
      },
      (error) => handleFirestoreError(error, OperationType.GET, "friend_requests")
    );

    return () => {
      unsubscribeUsers();
      unsubscribeRequests();
    };
  }, []);

  const filteredUsers = users.filter(u => 
    u.username?.toLowerCase().includes(search.toLowerCase()) || 
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  // Calculate requests sent per user to detect spam
  const requestCounts = friendRequests.reduce((acc, req) => {
    if (req.senderId) {
      acc[req.senderId] = (acc[req.senderId] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const spamSuspects = Object.entries(requestCounts)
    .filter(([_, count]) => (count as number) > 10) // Arbitrary threshold for "excessive"
    .map(([senderId, count]) => {
      const user = users.find(u => u.id === senderId);
      return {
        userId: senderId,
        username: user?.username || "Unknown",
        email: user?.email || "Unknown",
        count: count as number
      };
    })
    .sort((a, b) => b.count - a.count);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">User Management</h2>
          <p className="text-zinc-500">Manage platform users, roles, and monitor for spam.</p>
        </div>
        <div className="flex bg-zinc-900 border border-white/10 rounded-xl p-1">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === "users" ? "bg-emerald-600 text-white" : "text-zinc-400 hover:text-white"
            }`}
          >
            All Users
          </button>
          <button
            onClick={() => setActiveTab("spam")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === "spam" ? "bg-red-600 text-white" : "text-zinc-400 hover:text-white"
            }`}
          >
            <Activity className="w-4 h-4" />
            Spam Monitor
          </button>
        </div>
      </div>

      {activeTab === "users" && (
        <>
          <div className="flex justify-end mb-6">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-emerald-500/50 transition-all text-white"
              />
            </div>
          </div>

          <div className="bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-zinc-800/50 border-b border-white/5">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} alt="" className="w-10 h-10 rounded-full bg-zinc-800" />
                        <div>
                          <p className="text-sm font-bold text-white">{user.username || "Unknown"}</p>
                          <p className="text-xs text-zinc-500">{user.email || "No email"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={user.role || "user"}
                        onChange={(e) => updateUserRole(adminId, user.id, e.target.value)}
                        className="bg-zinc-800 border border-white/10 rounded-lg px-3 py-1 text-sm text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="user">User</option>
                        <option value="moderator">Moderator</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                        user.status === "banned" ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500"
                      }`}>
                        {user.status === "banned" ? "BANNED" : "ACTIVE"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {user.status !== "banned" && (
                          <button
                            onClick={() => banUser(adminId, user.id)}
                            className="p-2 text-zinc-400 hover:text-orange-500 hover:bg-orange-500/10 rounded-lg transition-all"
                            title="Ban User"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (window.confirm("Are you sure you want to delete this user?")) {
                              deleteUser(adminId, user.id);
                            }
                          }}
                          className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === "spam" && (
        <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Spam Suspects</h3>
              <p className="text-sm text-zinc-500">Users sending excessive friend requests (&gt;10).</p>
            </div>
          </div>

          {spamSuspects.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              <Shield className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No spam suspects detected at this time.</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-zinc-800/50 border-b border-white/5">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Requests Sent</th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {spamSuspects.map(suspect => (
                  <tr key={suspect.userId} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-bold text-white">{suspect.username}</p>
                        <p className="text-xs text-zinc-500">{suspect.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-red-500 font-bold">{suspect.count}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          if (window.confirm(`Ban user ${suspect.username} for spamming?`)) {
                            banUser(adminId, suspect.userId);
                          }
                        }}
                        className="px-3 py-1 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg text-xs font-bold transition-all"
                      >
                        Ban User
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default Users;

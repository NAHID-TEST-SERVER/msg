import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Users, ShieldAlert, BarChart3, MessageSquare, CheckCircle } from "lucide-react";
import { db, rtdb, collection, onSnapshot, ref, onValue } from "../../firebase";
import { resolveReport } from "../../services/adminService";
import { handleFirestoreError, OperationType } from "../../utils/firestoreErrorHandler";

const Overview = ({ adminId }: { adminId?: string }) => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    reports: 0,
    totalMessages: 0,
    activeChats: 0
  });

  const [reportsList, setReportsList] = useState<any[]>([]);

  useEffect(() => {
    // Fetch Firestore stats
    const unsubscribeUsers = onSnapshot(
      collection(db, "users"), 
      (snapshot) => {
        setStats(prev => ({ ...prev, totalUsers: snapshot.size }));
      },
      (error) => handleFirestoreError(error, OperationType.GET, "users")
    );

    const unsubscribePosts = onSnapshot(
      collection(db, "posts"), 
      (snapshot) => {
        setStats(prev => ({ ...prev, totalPosts: snapshot.size }));
      },
      (error) => handleFirestoreError(error, OperationType.GET, "posts")
    );

    const unsubscribeReports = onSnapshot(
      collection(db, "reports"), 
      (snapshot) => {
        let unresolved = 0;
        const rList: any[] = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          if (data.status !== "resolved") {
            unresolved++;
            rList.push({ id: doc.id, ...data });
          }
        });
        setStats(prev => ({ ...prev, reports: unresolved }));
        setReportsList(rList);
      },
      (error) => handleFirestoreError(error, OperationType.GET, "reports")
    );

    // Fetch RTDB stats
    const chatsRef = ref(rtdb, "chats");
    const unsubscribeChats = onValue(
      chatsRef, 
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          let msgCount = 0;
          let chatCount = 0;
          Object.keys(data).forEach(chatId => {
            chatCount++;
            if (data[chatId].messages) {
              msgCount += Object.keys(data[chatId].messages).length;
            }
          });
          setStats(prev => ({ ...prev, totalMessages: msgCount, activeChats: chatCount }));
        }
      },
      (error) => console.error("RTDB Error:", error)
    );

    return () => {
      unsubscribeUsers();
      unsubscribePosts();
      unsubscribeReports();
      unsubscribeChats();
    };
  }, []);

  const statCards = [
    { label: "Total Users", value: stats.totalUsers, change: "+12%", icon: Users, color: "text-blue-500" },
    { label: "Total Posts", value: stats.totalPosts, change: "+5%", icon: BarChart3, color: "text-purple-500" },
    { label: "Total Messages", value: stats.totalMessages, change: "+20%", icon: MessageSquare, color: "text-emerald-500" },
    { label: "Unresolved Reports", value: stats.reports, change: "-2", icon: ShieldAlert, color: "text-red-500" },
  ];

  return (
    <div>
      <h2 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h2>
      <p className="text-zinc-500 mb-10">Welcome back, Super Admin.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-zinc-900 border border-white/5 p-6 rounded-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-zinc-800 ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                stat.change.startsWith("+") ? "bg-emerald-500/10 text-emerald-500" : 
                stat.change.startsWith("-") ? "bg-red-500/10 text-red-500" : "bg-zinc-800 text-zinc-400"
              }`}>
                {stat.change}
              </span>
            </div>
            <p className="text-zinc-500 text-sm font-medium">{stat.label}</p>
            <h3 className="text-2xl font-bold text-white mt-1">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-zinc-900 border border-white/5 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-6">Platform Activity</h3>
          <div className="h-64 flex items-end gap-2 px-2">
            {[40, 70, 45, 90, 65, 80, 55, 95, 75, 60, 85, 50].map((h, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ delay: i * 0.05, duration: 1 }}
                className="flex-1 bg-emerald-500/20 border-t-2 border-emerald-500 rounded-t-sm"
              />
            ))}
          </div>
          <div className="flex justify-between mt-4 text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
            <span>Jan</span>
            <span>Mar</span>
            <span>May</span>
            <span>Jul</span>
            <span>Sep</span>
            <span>Nov</span>
          </div>
        </div>

        <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6 flex flex-col">
          <h3 className="text-lg font-bold text-white mb-6">Recent Reports</h3>
          <div className="space-y-4 flex-1 overflow-y-auto pr-2">
            {reportsList.length === 0 ? (
              <p className="text-zinc-500 text-sm text-center py-10">No unresolved reports.</p>
            ) : (
              reportsList.slice(0, 5).map((report) => (
                <div key={report.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{report.reason || "Spam Content"}</p>
                    <p className="text-xs text-zinc-500">Reported by {report.reporterName || "User"}</p>
                  </div>
                  <button 
                    onClick={() => resolveReport(adminId || "admin", report.id)}
                    className="p-2 text-zinc-400 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all"
                    title="Mark Resolved"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
          <button className="w-full mt-6 py-2 text-sm font-bold text-zinc-500 hover:text-white transition-all">
            View All Reports
          </button>
        </div>
      </div>
    </div>
  );
};

export default Overview;

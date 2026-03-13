import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy, limit, rtdb, ref, onValue } from "../../firebase";
import { db } from "../../firebase";
import { BarChart3, TrendingUp, Users, MessageSquare, Users2 } from "lucide-react";
import { motion } from "motion/react";
import { handleFirestoreError, OperationType } from "../../utils/firestoreErrorHandler";

const Analytics = () => {
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [todayMessages, setTodayMessages] = useState(0);

  useEffect(() => {
    const q = query(collection(db, "analytics"), orderBy("timestamp", "desc"), limit(30));
    const unsubscribe = onSnapshot(
      q, 
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAnalytics(data);
      },
      (error) => handleFirestoreError(error, OperationType.GET, "analytics")
    );

    // Fetch RTDB stats for today's messages
    const chatsRef = ref(rtdb, "chats");
    const unsubscribeChats = onValue(
      chatsRef, 
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          let msgCount = 0;
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          Object.keys(data).forEach(chatId => {
            if (data[chatId].messages) {
              Object.values(data[chatId].messages).forEach((msg: any) => {
                if (msg.timestamp && new Date(msg.timestamp) >= today) {
                  msgCount++;
                }
              });
            }
          });
          setTodayMessages(msgCount);
        }
      },
      (error) => console.error("RTDB Error:", error)
    );

    return () => {
      unsubscribe();
      unsubscribeChats();
    };
  }, []);

  // Mock data for charts if analytics collection is empty
  const chartData = analytics.length > 0 ? analytics : [
    { date: "Mon", users: 120, posts: 45, messages: 300, communities: 10 },
    { date: "Tue", users: 135, posts: 52, messages: 350, communities: 12 },
    { date: "Wed", users: 150, posts: 60, messages: 400, communities: 15 },
    { date: "Thu", users: 145, posts: 48, messages: 380, communities: 14 },
    { date: "Fri", users: 180, posts: 75, messages: 500, communities: 18 },
    { date: "Sat", users: 210, posts: 90, messages: 650, communities: 22 },
    { date: "Sun", users: 250, posts: 110, messages: 800, communities: 25 },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Platform Analytics</h2>
          <p className="text-zinc-500">Monitor growth, engagement, and activity trends.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-emerald-500" />
            <div>
              <p className="text-xs text-emerald-500/70 font-bold uppercase tracking-wider">Messages Today</p>
              <p className="text-lg font-black text-emerald-500">{todayMessages}</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-zinc-900 border border-white/10 rounded-xl text-sm font-bold text-zinc-400 hover:text-white transition-all">
            Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">User Growth</h3>
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <div className="h-64 flex items-end gap-2 px-2">
            {chartData.map((d, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${(d.users / 300) * 100}%` }}
                transition={{ delay: i * 0.05, duration: 1 }}
                className="flex-1 bg-blue-500/20 border-t-2 border-blue-500 rounded-t-sm relative group"
              >
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-800 text-white text-xs py-1 px-2 rounded pointer-events-none">
                  {d.users}
                </div>
              </motion.div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
            {chartData.map((d, i) => <span key={i}>{d.date}</span>)}
          </div>
        </div>

        <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">Post Engagement</h3>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="h-64 flex items-end gap-2 px-2">
            {chartData.map((d, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${(d.posts / 150) * 100}%` }}
                transition={{ delay: i * 0.05, duration: 1 }}
                className="flex-1 bg-emerald-500/20 border-t-2 border-emerald-500 rounded-t-sm relative group"
              >
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-800 text-white text-xs py-1 px-2 rounded pointer-events-none">
                  {d.posts}
                </div>
              </motion.div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
            {chartData.map((d, i) => <span key={i}>{d.date}</span>)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">Message Volume</h3>
            <MessageSquare className="w-5 h-5 text-purple-500" />
          </div>
          <div className="h-48 flex items-end gap-2 px-2">
            {chartData.map((d, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${(d.messages / 1000) * 100}%` }}
                transition={{ delay: i * 0.05, duration: 1 }}
                className="flex-1 bg-purple-500/20 border-t-2 border-purple-500 rounded-t-sm relative group"
              >
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-800 text-white text-xs py-1 px-2 rounded pointer-events-none">
                  {d.messages}
                </div>
              </motion.div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
            {chartData.map((d, i) => <span key={i}>{d.date}</span>)}
          </div>
        </div>

        <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">Active Communities</h3>
            <Users2 className="w-5 h-5 text-orange-500" />
          </div>
          <div className="h-48 flex items-end gap-2 px-2">
            {chartData.map((d, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${(d.communities / 30) * 100}%` }}
                transition={{ delay: i * 0.05, duration: 1 }}
                className="flex-1 bg-orange-500/20 border-t-2 border-orange-500 rounded-t-sm relative group"
              >
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-800 text-white text-xs py-1 px-2 rounded pointer-events-none">
                  {d.communities}
                </div>
              </motion.div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
            {chartData.map((d, i) => <span key={i}>{d.date}</span>)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;

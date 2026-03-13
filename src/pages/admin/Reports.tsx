import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "../../firebase";
import { db } from "../../firebase";
import { resolveReport } from "../../services/adminService";
import { ShieldAlert, CheckCircle, Ticket, User, FileText, XCircle } from "lucide-react";
import { handleFirestoreError, OperationType } from "../../utils/firestoreErrorHandler";

const Reports = ({ adminId }: { adminId: string }) => {
  const [reports, setReports] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"pending" | "resolved">("pending");

  useEffect(() => {
    const q = query(collection(db, "reports"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(
      q, 
      (snapshot) => {
        const reportsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setReports(reportsData);
      },
      (error) => handleFirestoreError(error, OperationType.GET, "reports")
    );

    return () => unsubscribe();
  }, []);

  const pendingReports = reports.filter(r => r.status !== "resolved");
  const resolvedReports = reports.filter(r => r.status === "resolved");

  const displayReports = activeTab === "pending" ? pendingReports : resolvedReports;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Reports & Tickets</h2>
          <p className="text-zinc-500">Manage user reports and support tickets.</p>
        </div>
        <div className="flex bg-zinc-900 border border-white/10 rounded-xl p-1">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === "pending" ? "bg-red-600 text-white" : "text-zinc-400 hover:text-white"
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            Pending ({pendingReports.length})
          </button>
          <button
            onClick={() => setActiveTab("resolved")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === "resolved" ? "bg-emerald-600 text-white" : "text-zinc-400 hover:text-white"
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            Resolved ({resolvedReports.length})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {displayReports.map(report => (
          <div key={report.id} className="bg-zinc-900 border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4 flex-1">
              <div className={`p-3 rounded-xl ${report.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                {report.status === 'resolved' ? <CheckCircle className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-lg font-bold text-white">{report.reason || "Report"}</h3>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    report.type === 'user' ? 'bg-blue-500/10 text-blue-500' : 
                    report.type === 'post' ? 'bg-purple-500/10 text-purple-500' : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {report.type || "General"}
                  </span>
                </div>
                <p className="text-zinc-400 text-sm mb-3">{report.description || "No description provided."}</p>
                <div className="flex items-center gap-4 text-xs text-zinc-500">
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>Reported by: {report.reporterName || report.reporterId || "Unknown"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    <span>Target ID: {report.targetId || "Unknown"}</span>
                  </div>
                  <span>{report.timestamp?.toDate ? new Date(report.timestamp.toDate()).toLocaleString() : "Unknown date"}</span>
                </div>
              </div>
            </div>
            
            {report.status !== "resolved" && (
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => {
                    if (window.confirm("Dismiss this report?")) {
                      resolveReport(adminId, report.id); // Assuming dismiss is same as resolve for now, or could add dismiss logic
                    }
                  }}
                  className="px-4 py-2 bg-zinc-800 text-zinc-400 hover:text-white rounded-xl text-sm font-bold transition-all flex items-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Dismiss
                </button>
                <button
                  onClick={() => resolveReport(adminId, report.id)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold transition-all flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Resolve
                </button>
              </div>
            )}
          </div>
        ))}

        {displayReports.length === 0 && (
          <div className="bg-zinc-900 border border-white/5 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-500 mb-4">
              <Ticket className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No {activeTab} reports</h3>
            <p className="text-zinc-500">You're all caught up! There are no {activeTab} reports to show.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;

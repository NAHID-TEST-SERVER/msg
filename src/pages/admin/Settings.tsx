import React, { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy, limit } from "../../firebase";
import { db } from "../../firebase";
import { sendGlobalNotification, removeMediaFile } from "../../services/adminService";
import { Bell, Shield, Database, Settings as SettingsIcon, AlertTriangle, Lock, Activity, HardDrive, Trash2 } from "lucide-react";
import { handleFirestoreError, OperationType } from "../../utils/firestoreErrorHandler";

const Settings = ({ adminId }: { adminId: string }) => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [loginLogs, setLoginLogs] = useState<any[]>([]);
  const [mediaFiles, setMediaFiles] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"general" | "security" | "storage">("general");

  useEffect(() => {
    const qLogs = query(collection(db, "admin_logs"), orderBy("timestamp", "desc"), limit(20));
    const unsubscribeLogs = onSnapshot(
      qLogs, 
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setLogs(data);
      },
      (error) => handleFirestoreError(error, OperationType.GET, "admin_logs")
    );

    const qLoginLogs = query(collection(db, "login_logs"), orderBy("timestamp", "desc"), limit(20));
    const unsubscribeLoginLogs = onSnapshot(
      qLoginLogs, 
      (snapshot) => {
        const loginLogsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setLoginLogs(loginLogsData);
      },
      (error) => handleFirestoreError(error, OperationType.GET, "login_logs")
    );

    const qMediaFiles = query(collection(db, "media_files"), orderBy("timestamp", "desc"), limit(50));
    const unsubscribeMediaFiles = onSnapshot(
      qMediaFiles, 
      (snapshot) => {
        const mediaData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMediaFiles(mediaData);
      },
      (error) => handleFirestoreError(error, OperationType.GET, "media_files")
    );

    return () => {
      unsubscribeLogs();
      unsubscribeLoginLogs();
      unsubscribeMediaFiles();
    };
  }, []);

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;
    setLoading(true);
    await sendGlobalNotification(adminId, title, message, ["all"]);
    setTitle("");
    setMessage("");
    setLoading(false);
    alert("Global notification sent successfully!");
  };

  const handleDeleteFile = async (fileId: string) => {
    if (window.confirm("Are you sure you want to delete this file? This action cannot be undone.")) {
      await removeMediaFile(adminId, fileId);
    }
  };

  const totalStorage = mediaFiles.reduce((acc, file) => acc + (file.size || 0), 0);
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Platform Settings</h2>
          <p className="text-zinc-500">Configure global settings, notifications, and view logs.</p>
        </div>
        <div className="flex bg-zinc-900 border border-white/10 rounded-xl p-1">
          <button
            onClick={() => setActiveTab("general")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === "general" ? "bg-emerald-600 text-white" : "text-zinc-400 hover:text-white"
            }`}
          >
            General & Logs
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === "security" ? "bg-red-600 text-white" : "text-zinc-400 hover:text-white"
            }`}
          >
            <Lock className="w-4 h-4" />
            Security Monitor
          </button>
          <button
            onClick={() => setActiveTab("storage")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === "storage" ? "bg-blue-600 text-white" : "text-zinc-400 hover:text-white"
            }`}
          >
            <HardDrive className="w-4 h-4" />
            Storage
          </button>
        </div>
      </div>

      {activeTab === "general" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                  <Bell className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Global Notifications</h3>
              </div>
              <form onSubmit={handleSendNotification} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Notification Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-zinc-800 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                    placeholder="e.g., Scheduled Maintenance"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Message Body</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-zinc-800 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all min-h-[100px] resize-none"
                    placeholder="Enter notification message..."
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send Global Notification"}
                </button>
              </form>
            </div>

            <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Security Controls</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl border border-white/5">
                  <div>
                    <p className="text-sm font-bold text-white">Maintenance Mode</p>
                    <p className="text-xs text-zinc-500">Temporarily disable user access</p>
                  </div>
                  <button className="px-4 py-2 bg-zinc-800 border border-white/10 rounded-lg text-sm font-bold text-zinc-400 hover:text-white transition-all">
                    Enable
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl border border-white/5">
                  <div>
                    <p className="text-sm font-bold text-white">New Registrations</p>
                    <p className="text-xs text-zinc-500">Allow new users to sign up</p>
                  </div>
                  <button className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-sm font-bold text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all">
                    Active
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Admin Activity Log</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
              {logs.length === 0 ? (
                <p className="text-zinc-500 text-sm text-center py-10">No recent admin activity.</p>
              ) : (
                logs.map(log => (
                  <div key={log.id} className="p-3 bg-zinc-800/50 rounded-xl border border-white/5 flex items-start gap-3">
                    <div className="mt-1 p-1.5 bg-zinc-800 rounded-lg text-zinc-400">
                      <SettingsIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{log.actionType}</p>
                      <p className="text-xs text-zinc-400">Target: {log.targetId}</p>
                      <p className="text-[10px] text-zinc-500 mt-1">
                        {log.timestamp?.toDate ? new Date(log.timestamp.toDate()).toLocaleString() : "Just now"}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "security" && (
        <div className="bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <div>
              <h3 className="text-xl font-bold text-white">Security Monitor</h3>
              <p className="text-sm text-zinc-500">Monitor platform logins and suspicious activity.</p>
            </div>
          </div>
          <table className="w-full text-left">
            <thead className="bg-zinc-800/50 border-b border-white/5">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Time</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">User ID</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">IP Address</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loginLogs.map(log => (
                <tr key={log.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-sm text-zinc-400">
                    {log.timestamp?.toDate ? new Date(log.timestamp.toDate()).toLocaleString() : "Just now"}
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-zinc-300">
                    {log.userId || "Unknown"}
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-zinc-500">
                    {log.ipAddress || "Unknown"}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                      log.status === "failed" ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500"
                    }`}>
                      {log.status === "failed" ? "FAILED" : "SUCCESS"}
                    </span>
                  </td>
                </tr>
              ))}
              {loginLogs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">
                    No login logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "storage" && (
        <div className="bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <HardDrive className="w-5 h-5 text-blue-500" />
              <div>
                <h3 className="text-xl font-bold text-white">File Storage Management</h3>
                <p className="text-sm text-zinc-500">Monitor and manage user uploads.</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-white">Total Storage Used</p>
              <p className="text-2xl font-black text-blue-500">{formatBytes(totalStorage)}</p>
            </div>
          </div>
          <table className="w-full text-left">
            <thead className="bg-zinc-800/50 border-b border-white/5">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">File</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Size</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Uploaded By</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {mediaFiles.map(file => (
                <tr key={file.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {file.type?.startsWith('image/') ? (
                        <img src={file.url} alt="Preview" className="w-10 h-10 rounded object-cover border border-white/10" />
                      ) : (
                        <div className="w-10 h-10 rounded bg-zinc-800 flex items-center justify-center border border-white/10">
                          <span className="text-xs text-zinc-500 font-bold">FILE</span>
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-bold text-white truncate max-w-[200px]">{file.name || "Unnamed File"}</p>
                        <p className="text-xs text-zinc-500">{file.timestamp?.toDate ? new Date(file.timestamp.toDate()).toLocaleString() : "Unknown date"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-400">
                    {file.type || "Unknown"}
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-zinc-300">
                    {formatBytes(file.size || 0)}
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-400">
                    {file.uploaderId || "Unknown"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDeleteFile(file.id)}
                      className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all"
                      title="Delete File"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {mediaFiles.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                    No media files found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Settings;


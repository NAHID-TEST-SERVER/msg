import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { onAuthStateChanged, auth, db, doc, getDoc } from "./firebase";
import { createUserProfile, initBots, updateUserPresence } from "./services/socialService";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import RightSidebar from "./components/RightSidebar";
import Home from "./pages/Home";
import Messenger from "./pages/Messenger";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import { Loader2 } from "lucide-react";

const Layout = ({ children, user }: { children: React.ReactNode; user: any }) => {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <Navbar user={user} />
      <div className="flex-1 flex max-w-7xl mx-auto w-full pt-16 px-4 gap-6">
        <Sidebar className="hidden lg:block w-64 sticky top-20 h-[calc(100vh-5rem)]" />
        <main className="flex-1 py-6 overflow-y-auto">
          {children}
        </main>
        <RightSidebar className="hidden xl:block w-80 sticky top-20 h-[calc(100vh-5rem)]" />
      </div>
    </div>
  );
};

const App = () => {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem("admin_access") === "true");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleAdminLogin = () => {
      setIsAdmin(localStorage.getItem("admin_access") === "true");
    };
    window.addEventListener("admin_login", handleAdminLogin);
    window.addEventListener("admin_logout", handleAdminLogin);

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        await createUserProfile(currentUser);
        await initBots();
        updateUserPresence(currentUser.uid, true);
        setUser(currentUser);
        
        // Check if user is admin in Firestore
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (
          (userDoc.exists() && userDoc.data().role === "admin") ||
          currentUser.email === "mdnahidulislamnahid404@gmail.com"
        ) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } else {
        if (user) updateUserPresence(user.uid, false);
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
      window.removeEventListener("admin_login", handleAdminLogin);
      window.removeEventListener("admin_logout", handleAdminLogin);
    };
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-zinc-50">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/*"
          element={isAdmin ? <AdminDashboard user={user} /> : <Navigate to="/admin/login" />}
        />
        <Route
          path="/*"
          element={
            user ? (
              <Layout user={user}>
                <Routes>
                  <Route path="/" element={<Home user={user} />} />
                  <Route path="/messenger" element={<Messenger user={user} />} />
                  <Route path="/messenger/:chatId" element={<Messenger user={user} />} />
                  <Route path="/profile/:username" element={<Profile user={user} />} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
};

export default App;

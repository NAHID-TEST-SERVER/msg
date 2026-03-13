import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db, storage, auth } from '../firebase';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updatePassword, signOut } from 'firebase/auth';
import { Button, Input, Avatar } from '../components/UI';
import { 
  Camera, User, Mail, Phone, ArrowLeft, 
  Save, LogOut, Lock, Trash2, CheckCircle2, AlertCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

export const SettingsPage = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    bio: ''
  });
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        username: profile.username || '',
        email: profile.email || '',
        phone: profile.phone || '',
        bio: profile.bio || ''
      });
    }
  }, [profile]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = async () => {
    if (!profile) return;
    if (!window.confirm('Are you sure you want to remove your profile picture?')) return;
    
    setLoading(true);
    try {
      // If there's an existing image in storage, we could delete it, 
      // but for simplicity we'll just clear the URL in Firestore
      await updateDoc(doc(db, 'users', profile.id), {
        profileImage: ''
      });
      setPreview(null);
      setImage(null);
      showSuccess('Profile picture removed');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${profile.id}`);
      showError('Failed to remove profile picture');
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const showError = (msg: string) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(''), 3000);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setLoading(true);

    try {
      let profileImageUrl = profile.profileImage;
      
      if (image) {
        const storageRef = ref(storage, `profiles/${profile.id}`);
        await uploadBytes(storageRef, image);
        profileImageUrl = await getDownloadURL(storageRef);
      }

      await updateDoc(doc(db, 'users', profile.id), {
        ...formData,
        profileImage: profileImageUrl,
        lastSeen: Timestamp.now()
      });

      showSuccess('Settings saved successfully!');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${profile.id}`);
      showError('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) return;
    if (newPassword !== confirmPassword) {
      showError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, newPassword);
        setNewPassword('');
        setConfirmPassword('');
        showSuccess('Password updated successfully!');
      }
    } catch (err: any) {
      console.error(err);
      showError(err.message || 'Failed to update password. You may need to re-login.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (err) {
      console.error(err);
    }
  };

  if (!profile) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 font-medium">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/')}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-black text-slate-900">Settings</h1>
          </div>
          <div className="flex items-center gap-2">
            <AnimatePresence>
              {successMessage && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-2 text-green-600 text-sm font-bold bg-green-50 px-3 py-1.5 rounded-lg border border-green-100"
                >
                  <CheckCircle2 size={16} />
                  {successMessage}
                </motion.div>
              )}
              {errorMessage && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-2 text-red-600 text-sm font-bold bg-red-50 px-3 py-1.5 rounded-lg border border-red-100"
                >
                  <AlertCircle size={16} />
                  {errorMessage}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-6 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Picture */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-6 sticky top-24">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Profile Picture</h2>
              <div className="flex flex-col items-center space-y-4">
                <div className="relative group">
                  <Avatar 
                    name={profile.name} 
                    src={preview || profile.profileImage} 
                    size="xl" 
                  />
                  <label className="absolute bottom-0 right-0 bg-primary text-white p-2.5 rounded-full cursor-pointer shadow-lg hover:scale-110 transition-transform border-4 border-white">
                    <Camera size={18} />
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                  </label>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-500">Allowed JPG, GIF or PNG. Max size of 2MB</p>
                </div>
                <div className="flex flex-col w-full gap-2">
                  <Button 
                    variant="outline" 
                    className="w-full text-xs" 
                    onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
                  >
                    Replace Image
                  </Button>
                  {profile.profileImage && (
                    <Button 
                      variant="ghost" 
                      className="w-full text-xs text-red-500 hover:bg-red-50"
                      onClick={handleRemoveImage}
                    >
                      <Trash2 size={14} className="mr-2" />
                      Remove Image
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Forms */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Info */}
            <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
              <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                <User size={20} className="text-primary" />
                Profile Information
              </h2>
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Display Name"
                    placeholder="Your full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  <Input
                    label="Username"
                    placeholder="unique_username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Email Address"
                    type="email"
                    icon={<Mail size={18} />}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                  <Input
                    label="Phone Number"
                    type="tel"
                    icon={<Phone size={18} />}
                    placeholder="+1 234 567 890"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Bio / About</label>
                  <textarea
                    placeholder="Tell us about yourself..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all min-h-[100px] text-sm"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  />
                </div>

                <div className="pt-4">
                  <Button type="submit" className="w-full md:w-auto px-8 py-3 shadow-lg colorful-shadow" loading={loading}>
                    <Save size={18} className="mr-2" />
                    Save Changes
                  </Button>
                </div>
              </form>
            </section>

            {/* Account Settings */}
            <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
              <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                <Lock size={20} className="text-primary" />
                Account Security
              </h2>
              <form onSubmit={handleChangePassword} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="New Password"
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <Input
                    label="Confirm New Password"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <div className="pt-2">
                  <Button type="submit" variant="outline" className="w-full md:w-auto px-8" loading={loading} disabled={!newPassword}>
                    Update Password
                  </Button>
                </div>
              </form>

              <div className="mt-10 pt-8 border-t border-slate-100">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-slate-900">Logout from Account</h3>
                    <p className="text-sm text-slate-500">You will be redirected to the login page.</p>
                  </div>
                  <Button variant="ghost" className="text-red-500 hover:bg-red-50 font-bold" onClick={handleLogout}>
                    <LogOut size={18} className="mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

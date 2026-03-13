import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db, doc, getDoc, collection, query, where, orderBy, onSnapshot } from "../firebase";
import PostCard from "../components/PostCard";
import { UserPlus, MessageCircle, MoreHorizontal, MapPin, Link as LinkIcon, Calendar, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { motion } from "motion/react";

const Profile = ({ user: currentUser }: { user: any }) => {
  const { username: profileId } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profileId) return;

    const fetchProfile = async () => {
      setLoading(true);
      const userDoc = await getDoc(doc(db, "users", profileId));
      if (userDoc.exists()) {
        setProfile(userDoc.data());
      }
      setLoading(false);
    };

    fetchProfile();

    // Fetch user's posts
    const q = query(
      collection(db, "posts"),
      where("authorId", "==", profileId),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPosts(postList);
    });

    return () => unsubscribe();
  }, [profileId]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-zinc-900">User not found</h2>
        <p className="text-zinc-500">The profile you're looking for doesn't exist.</p>
      </div>
    );
  }

  const isOwnProfile = currentUser.uid === profileId;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="card overflow-hidden mb-6">
        <div className="h-48 sm:h-64 relative">
          <img
            src={profile.coverPhoto || "https://picsum.photos/seed/cover/1200/400"}
            alt="Cover"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <button className="absolute bottom-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-xl backdrop-blur-md transition-colors">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 pb-6 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-12 sm:-mt-16 mb-6 gap-4">
            <div className="relative">
              <img
                src={profile.profilePhoto}
                alt={profile.displayName}
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl border-4 border-white object-cover shadow-lg"
                referrerPolicy="no-referrer"
              />
              {profile.isBot && (
                <span className="absolute bottom-1 right-1 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-white">AI</span>
              )}
            </div>
            <div className="flex gap-2">
              {isOwnProfile ? (
                <button className="btn-secondary">Edit Profile</button>
              ) : (
                <>
                  <button className="btn-primary flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    Follow
                  </button>
                  <button className="btn-secondary flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Message
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900">{profile.displayName}</h1>
              <p className="text-zinc-500">@{profile.username}</p>
            </div>
            
            <p className="text-zinc-700 max-w-2xl">{profile.bio}</p>

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-zinc-500">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                <span>San Francisco, CA</span>
              </div>
              <div className="flex items-center gap-1.5">
                <LinkIcon className="w-4 h-4" />
                <a href="#" className="text-emerald-600 hover:underline">nextgen.social/{profile.username}</a>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>Joined {profile.createdAt?.toDate ? format(profile.createdAt.toDate(), "MMMM yyyy") : "Recently"}</span>
              </div>
            </div>

            <div className="flex gap-6 pt-2">
              <div className="flex gap-1 items-baseline">
                <span className="font-bold text-zinc-900">{profile.followingCount || 0}</span>
                <span className="text-sm text-zinc-500">Following</span>
              </div>
              <div className="flex gap-1 items-baseline">
                <span className="font-bold text-zinc-900">{profile.followersCount || 0}</span>
                <span className="text-sm text-zinc-500">Followers</span>
              </div>
              <div className="flex gap-1 items-baseline">
                <span className="font-bold text-zinc-900">{profile.friendsCount || 0}</span>
                <span className="text-sm text-zinc-500">Friends</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 mb-6 overflow-x-auto scrollbar-hide">
        {["Posts", "About", "Friends", "Photos", "Videos"].map((tab, i) => (
          <button
            key={tab}
            className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
              i === 0 ? "border-emerald-600 text-emerald-600" : "border-transparent text-zinc-500 hover:text-zinc-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Posts Feed */}
      <div className="space-y-6 max-w-2xl">
        {posts.length > 0 ? (
          posts.map((post) => (
            <div key={post.id}>
              <PostCard post={post} currentUser={currentUser} />
            </div>
          ))
        ) : (
          <div className="card p-10 text-center">
            <p className="text-zinc-500">No posts yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;

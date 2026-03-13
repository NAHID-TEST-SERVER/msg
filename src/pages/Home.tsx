import React, { useEffect, useState } from "react";
import { db, collection, query, orderBy, onSnapshot, limit } from "../firebase";
import { createPost } from "../services/socialService";
import PostCard from "../components/PostCard";
import StoryBar from "../components/StoryBar";
import { Image, Video, BarChart2, Send, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const Home = ({ user }: { user: any }) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPosts(postList);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim() || isPosting) return;

    setIsPosting(true);
    try {
      await createPost(user.uid, user.displayName, user.photoURL, newPost);
      setNewPost("");
    } catch (error) {
      console.error("Failed to create post:", error);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <StoryBar user={user} />

      {/* Create Post Card */}
      <div className="card p-4">
        <div className="flex gap-4">
          <img
            src={user?.photoURL || `https://picsum.photos/seed/${user?.uid}/100`}
            alt="User"
            className="w-12 h-12 rounded-xl object-cover"
            referrerPolicy="no-referrer"
          />
          <form onSubmit={handleCreatePost} className="flex-1">
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder={`What's on your mind, ${user?.displayName?.split(" ")[0]}?`}
              className="w-full bg-zinc-100 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-2xl px-4 py-3 outline-none transition-all resize-none min-h-[100px]"
            />
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-100">
              <div className="flex gap-2">
                <button type="button" className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-xl transition-colors flex items-center gap-2 text-sm font-medium">
                  <Image className="w-5 h-5" />
                  <span className="hidden sm:inline">Photo</span>
                </button>
                <button type="button" className="p-2 hover:bg-blue-50 text-blue-600 rounded-xl transition-colors flex items-center gap-2 text-sm font-medium">
                  <Video className="w-5 h-5" />
                  <span className="hidden sm:inline">Video</span>
                </button>
                <button type="button" className="p-2 hover:bg-orange-50 text-orange-600 rounded-xl transition-colors flex items-center gap-2 text-sm font-medium">
                  <BarChart2 className="w-5 h-5" />
                  <span className="hidden sm:inline">Poll</span>
                </button>
              </div>
              <button
                type="submit"
                disabled={!newPost.trim() || isPosting}
                className="btn-primary flex items-center gap-2"
              >
                {isPosting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Post
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Feed */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        ) : (
          <AnimatePresence>
            {posts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <PostCard post={post} currentUser={user} />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default Home;

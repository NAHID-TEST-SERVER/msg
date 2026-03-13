import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle, Share2, MoreHorizontal, Send } from "lucide-react";
import { db, doc, updateDoc, increment, arrayUnion, arrayRemove } from "../firebase";

const PostCard = ({ post, currentUser }: { post: any; currentUser: any }) => {
  const [comment, setComment] = useState("");
  const isLiked = post.reactions?.[currentUser.uid] === "like";

  const handleLike = async () => {
    const postRef = doc(db, "posts", post.id);
    await updateDoc(postRef, {
      likesCount: isLiked ? increment(-1) : increment(1),
      [`reactions.${currentUser.uid}`]: isLiked ? null : "like"
    });
  };

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={post.authorPhoto}
            alt={post.authorName}
            className="w-10 h-10 rounded-xl object-cover"
            referrerPolicy="no-referrer"
          />
          <div>
            <p className="font-bold text-zinc-900 hover:underline cursor-pointer">{post.authorName}</p>
            <p className="text-xs text-zinc-500">
              {post.createdAt?.toDate ? formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true }) : "Just now"}
            </p>
          </div>
        </div>
        <button className="p-2 hover:bg-zinc-100 rounded-xl transition-colors text-zinc-400">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 pb-4">
        <p className="text-zinc-800 whitespace-pre-wrap leading-relaxed">{post.content}</p>
        {post.media && post.media.length > 0 && (
          <div className="mt-4 rounded-2xl overflow-hidden border border-zinc-100">
            <img src={post.media[0]} alt="Post media" className="w-full h-auto max-h-[500px] object-cover" referrerPolicy="no-referrer" />
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="px-4 py-2 flex items-center justify-between border-y border-zinc-50 text-sm text-zinc-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="flex -space-x-1">
              <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-white">
                <Heart className="w-3 h-3 text-white fill-white" />
              </div>
            </div>
            <span>{post.likesCount || 0}</span>
          </div>
          <div className="hover:underline cursor-pointer">{post.commentsCount || 0} comments</div>
        </div>
        <div className="hover:underline cursor-pointer">12 shares</div>
      </div>

      {/* Actions */}
      <div className="px-2 py-1 flex items-center gap-1">
        <button
          onClick={handleLike}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl transition-colors ${
            isLiked ? "text-emerald-600 bg-emerald-50" : "text-zinc-600 hover:bg-zinc-100"
          }`}
        >
          <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
          <span className="font-medium">Like</span>
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl transition-colors text-zinc-600 hover:bg-zinc-100">
          <MessageCircle className="w-5 h-5" />
          <span className="font-medium">Comment</span>
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl transition-colors text-zinc-600 hover:bg-zinc-100">
          <Share2 className="w-5 h-5" />
          <span className="font-medium">Share</span>
        </button>
      </div>

      {/* Comment Input */}
      <div className="p-4 bg-zinc-50/50 flex gap-3">
        <img
          src={currentUser?.photoURL}
          alt="User"
          className="w-8 h-8 rounded-lg object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="flex-1 relative">
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write a comment..."
            className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-1.5 pr-10 text-sm outline-none focus:border-emerald-500 transition-all"
          />
          <button className="absolute right-2 top-1/2 -translate-y-1/2 text-emerald-600 hover:text-emerald-700 disabled:opacity-50">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostCard;

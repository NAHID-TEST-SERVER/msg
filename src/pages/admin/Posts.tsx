import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from "../../firebase";
import { db } from "../../firebase";
import { deletePost, flagPost, removeComment, markCommentModerated, deleteGroup, removeGroupOwner, removeStory, removeMarketplaceListing } from "../../services/adminService";
import { MessageSquare, ShieldAlert, Trash2, Flag, Users, Image as ImageIcon, ShoppingBag } from "lucide-react";
import { handleFirestoreError, OperationType } from "../../utils/firestoreErrorHandler";

const Posts = ({ adminId }: { adminId: string }) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [stories, setStories] = useState<any[]>([]);
  const [marketplace, setMarketplace] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"posts" | "comments" | "groups" | "stories" | "marketplace">("posts");

  useEffect(() => {
    const unsubscribePosts = onSnapshot(
      collection(db, "posts"), 
      (snapshot) => {
        const postsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPosts(postsData);
      },
      (error) => handleFirestoreError(error, OperationType.GET, "posts")
    );

    const unsubscribeComments = onSnapshot(
      collection(db, "comments"), 
      (snapshot) => {
        const commentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setComments(commentsData);
      },
      (error) => handleFirestoreError(error, OperationType.GET, "comments")
    );

    const unsubscribeGroups = onSnapshot(
      collection(db, "groups"), 
      (snapshot) => {
        const groupsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setGroups(groupsData);
      },
      (error) => handleFirestoreError(error, OperationType.GET, "groups")
    );

    const unsubscribeStories = onSnapshot(
      collection(db, "stories"), 
      (snapshot) => {
        const storiesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setStories(storiesData);
      },
      (error) => handleFirestoreError(error, OperationType.GET, "stories")
    );

    const unsubscribeMarketplace = onSnapshot(
      collection(db, "marketplace"), 
      (snapshot) => {
        const marketplaceData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMarketplace(marketplaceData);
      },
      (error) => handleFirestoreError(error, OperationType.GET, "marketplace")
    );

    return () => {
      unsubscribePosts();
      unsubscribeComments();
      unsubscribeGroups();
      unsubscribeStories();
      unsubscribeMarketplace();
    };
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Content Moderation</h2>
          <p className="text-zinc-500">Manage posts, comments, groups, stories, and marketplace listings.</p>
        </div>
        <div className="flex bg-zinc-900 border border-white/10 rounded-xl p-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab("posts")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === "posts" ? "bg-emerald-600 text-white" : "text-zinc-400 hover:text-white"
            }`}
          >
            Posts
          </button>
          <button
            onClick={() => setActiveTab("comments")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === "comments" ? "bg-emerald-600 text-white" : "text-zinc-400 hover:text-white"
            }`}
          >
            Comments
          </button>
          <button
            onClick={() => setActiveTab("groups")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === "groups" ? "bg-emerald-600 text-white" : "text-zinc-400 hover:text-white"
            }`}
          >
            Groups
          </button>
          <button
            onClick={() => setActiveTab("stories")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === "stories" ? "bg-emerald-600 text-white" : "text-zinc-400 hover:text-white"
            }`}
          >
            Stories
          </button>
          <button
            onClick={() => setActiveTab("marketplace")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === "marketplace" ? "bg-emerald-600 text-white" : "text-zinc-400 hover:text-white"
            }`}
          >
            Marketplace
          </button>
        </div>
      </div>

      {activeTab === "posts" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map(post => (
            <div key={post.id} className="bg-zinc-900 border border-white/5 rounded-2xl p-6 relative">
              {post.flagged && (
                <div className="absolute top-4 right-4 bg-red-500/10 text-red-500 p-2 rounded-lg">
                  <Flag className="w-4 h-4" />
                </div>
              )}
              <div className="flex items-center gap-3 mb-4">
                <img src={post.authorPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.authorId}`} alt="" className="w-10 h-10 rounded-full bg-zinc-800" />
                <div>
                  <p className="text-sm font-bold text-white">{post.authorName || "Unknown"}</p>
                  <p className="text-xs text-zinc-500">{post.createdAt?.toDate ? new Date(post.createdAt.toDate()).toLocaleDateString() : "Just now"}</p>
                </div>
              </div>
              <p className="text-zinc-300 text-sm mb-4 line-clamp-3">{post.content}</p>
              {post.imageUrl && (
                <img src={post.imageUrl} alt="Post media" className="w-full h-32 object-cover rounded-xl mb-4" />
              )}
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex items-center gap-4 text-zinc-500 text-xs font-bold">
                  <span>{post.likesCount || 0} LIKES</span>
                  <span>{post.commentsCount || 0} COMMENTS</span>
                </div>
                <div className="flex gap-2">
                  {!post.flagged && (
                    <button
                      onClick={() => flagPost(adminId, post.id)}
                      className="p-2 text-zinc-400 hover:text-orange-500 hover:bg-orange-500/10 rounded-lg transition-all"
                      title="Flag Post"
                    >
                      <ShieldAlert className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (window.confirm("Delete this post?")) {
                        deletePost(adminId, post.id);
                      }
                    }}
                    className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                    title="Delete Post"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "comments" && (
        <div className="bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-zinc-800/50 border-b border-white/5">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Comment</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {comments.map(comment => (
                <tr key={comment.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={comment.authorPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.authorId}`} alt="" className="w-8 h-8 rounded-full bg-zinc-800" />
                      <div>
                        <p className="text-sm font-bold text-white">{comment.authorName || "Unknown"}</p>
                        <p className="text-xs text-zinc-400 line-clamp-1">{comment.content}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                      comment.moderated ? "bg-emerald-500/10 text-emerald-500" : "bg-zinc-800 text-zinc-400"
                    }`}>
                      {comment.moderated ? "MODERATED" : "PENDING"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {!comment.moderated && (
                        <button
                          onClick={() => markCommentModerated(adminId, comment.id)}
                          className="p-2 text-zinc-400 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all"
                          title="Mark Moderated"
                        >
                          <ShieldAlert className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (window.confirm("Remove this comment?")) {
                            removeComment(adminId, comment.id);
                          }
                        }}
                        className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                        title="Remove Comment"
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
      )}

      {activeTab === "groups" && (
        <div className="bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-zinc-800/50 border-b border-white/5">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Group</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Members</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {groups.map(group => (
                <tr key={group.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-500">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{group.name || "Unnamed Group"}</p>
                        <p className="text-xs text-zinc-400 line-clamp-1">{group.description || "No description"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-zinc-300">{group.membersCount || 0}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {group.ownerId && (
                        <button
                          onClick={() => {
                            if (window.confirm("Remove owner from this group?")) {
                              removeGroupOwner(adminId, group.id, group.ownerId);
                            }
                          }}
                          className="p-2 text-zinc-400 hover:text-orange-500 hover:bg-orange-500/10 rounded-lg transition-all"
                          title="Remove Owner"
                        >
                          <ShieldAlert className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (window.confirm("Delete this group?")) {
                            deleteGroup(adminId, group.id);
                          }
                        }}
                        className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                        title="Delete Group"
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
      )}

      {activeTab === "stories" && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {stories.map(story => (
            <div key={story.id} className="bg-zinc-900 border border-white/5 rounded-2xl p-4 relative group">
              <div className="aspect-[9/16] bg-zinc-800 rounded-xl mb-3 overflow-hidden relative">
                {story.imageUrl ? (
                  <img src={story.imageUrl} alt="Story" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-600">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => {
                      if (window.confirm("Remove this story?")) {
                        removeStory(adminId, story.id);
                      }
                    }}
                    className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    title="Remove Story"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <img src={story.authorPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${story.authorId}`} alt="" className="w-6 h-6 rounded-full bg-zinc-800" />
                <p className="text-xs font-bold text-white truncate">{story.authorName || "Unknown"}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "marketplace" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {marketplace.map(item => (
            <div key={item.id} className="bg-zinc-900 border border-white/5 rounded-2xl p-6 relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-500">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{item.title || "Untitled Item"}</p>
                  <p className="text-xs text-emerald-500 font-bold">${item.price || 0}</p>
                </div>
              </div>
              <p className="text-zinc-300 text-sm mb-4 line-clamp-2">{item.description}</p>
              {item.imageUrl && (
                <img src={item.imageUrl} alt="Item media" className="w-full h-32 object-cover rounded-xl mb-4" />
              )}
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <img src={item.sellerPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.sellerId}`} alt="" className="w-6 h-6 rounded-full bg-zinc-800" />
                  <p className="text-xs text-zinc-500">{item.sellerName || "Unknown Seller"}</p>
                </div>
                <button
                  onClick={() => {
                    if (window.confirm("Remove this marketplace listing?")) {
                      removeMarketplaceListing(adminId, item.id);
                    }
                  }}
                  className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                  title="Remove Item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Posts;

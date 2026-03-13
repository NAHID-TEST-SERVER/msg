import { db, rtdb, collection, doc, getDocs, updateDoc, deleteDoc, addDoc, serverTimestamp, query, orderBy, limit, onSnapshot, ref, onValue } from "../firebase";
import { handleFirestoreError, OperationType } from "../utils/firestoreErrorHandler";

export const logAdminAction = async (adminId: string, actionType: string, targetId: string) => {
  try {
    await addDoc(collection(db, "admin_logs"), {
      adminId,
      actionType,
      targetId,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, "admin_logs");
  }
};

export const banUser = async (adminId: string, userId: string) => {
  try {
    await updateDoc(doc(db, "users", userId), { status: "banned" });
    await logAdminAction(adminId, "BAN_USER", userId);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
  }
};

export const deleteUser = async (adminId: string, userId: string) => {
  try {
    await deleteDoc(doc(db, "users", userId));
    await logAdminAction(adminId, "DELETE_USER", userId);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${userId}`);
  }
};

export const updateUserRole = async (adminId: string, userId: string, role: string) => {
  try {
    await updateDoc(doc(db, "users", userId), { role });
    await logAdminAction(adminId, "UPDATE_USER_ROLE", userId);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
  }
};

export const deletePost = async (adminId: string, postId: string) => {
  try {
    await deleteDoc(doc(db, "posts", postId));
    await logAdminAction(adminId, "DELETE_POST", postId);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `posts/${postId}`);
  }
};

export const flagPost = async (adminId: string, postId: string) => {
  try {
    await updateDoc(doc(db, "posts", postId), { flagged: true });
    await logAdminAction(adminId, "FLAG_POST", postId);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `posts/${postId}`);
  }
};

export const removeComment = async (adminId: string, commentId: string) => {
  try {
    await deleteDoc(doc(db, "comments", commentId));
    await logAdminAction(adminId, "REMOVE_COMMENT", commentId);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `comments/${commentId}`);
  }
};

export const markCommentModerated = async (adminId: string, commentId: string) => {
  try {
    await updateDoc(doc(db, "comments", commentId), { moderated: true });
    await logAdminAction(adminId, "MARK_COMMENT_MODERATED", commentId);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `comments/${commentId}`);
  }
};

export const sendGlobalNotification = async (adminId: string, title: string, message: string, targetUsers: string[]) => {
  try {
    await addDoc(collection(db, "notifications"), {
      title,
      message,
      targetUsers,
      timestamp: serverTimestamp()
    });
    await logAdminAction(adminId, "SEND_GLOBAL_NOTIFICATION", "all");
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, "notifications");
  }
};

export const deleteGroup = async (adminId: string, groupId: string) => {
  try {
    await deleteDoc(doc(db, "groups", groupId));
    await logAdminAction(adminId, "DELETE_GROUP", groupId);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `groups/${groupId}`);
  }
};

export const removeGroupOwner = async (adminId: string, groupId: string, ownerId: string) => {
  try {
    await updateDoc(doc(db, "groups", groupId), { ownerId: null });
    await logAdminAction(adminId, "REMOVE_GROUP_OWNER", groupId);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `groups/${groupId}`);
  }
};

export const resolveReport = async (adminId: string, reportId: string) => {
  try {
    await updateDoc(doc(db, "reports", reportId), { status: "resolved" });
    await logAdminAction(adminId, "RESOLVE_REPORT", reportId);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `reports/${reportId}`);
  }
};

export const removeStory = async (adminId: string, storyId: string) => {
  try {
    await deleteDoc(doc(db, "stories", storyId));
    await logAdminAction(adminId, "REMOVE_STORY", storyId);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `stories/${storyId}`);
  }
};

export const removeMarketplaceListing = async (adminId: string, listingId: string) => {
  try {
    await deleteDoc(doc(db, "marketplace", listingId));
    await logAdminAction(adminId, "REMOVE_MARKETPLACE_LISTING", listingId);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `marketplace/${listingId}`);
  }
};

export const removeMediaFile = async (adminId: string, mediaId: string) => {
  try {
    await deleteDoc(doc(db, "media_files", mediaId));
    await logAdminAction(adminId, "REMOVE_MEDIA_FILE", mediaId);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `media_files/${mediaId}`);
  }
};

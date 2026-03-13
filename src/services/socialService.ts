import { 
  db, rtdb, auth, 
  collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, limit, onSnapshot, addDoc, updateDoc, deleteDoc, serverTimestamp, Timestamp, increment, arrayUnion, arrayRemove,
  ref, set, push, onValue, off, onChildAdded, rtdbTimestamp
} from "../firebase";

// User Services
export const createUserProfile = async (user: any) => {
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    const username = user.email.split("@")[0] + Math.floor(Math.random() * 1000);
    await setDoc(userRef, {
      uid: user.uid,
      username,
      displayName: user.displayName || username,
      email: user.email,
      profilePhoto: user.photoURL || `https://picsum.photos/seed/${user.uid}/200`,
      coverPhoto: `https://picsum.photos/seed/${user.uid}_cover/800/300`,
      bio: "New to NextGen Social!",
      isBot: false,
      createdAt: serverTimestamp(),
      followersCount: 0,
      followingCount: 0,
      friendsCount: 0,
      role: "user"
    });
  }
};

// Post Services
export const createPost = async (userId: string, displayName: string, photoURL: string, content: string, type: string = "text", media: string[] = []) => {
  await addDoc(collection(db, "posts"), {
    authorId: userId,
    authorName: displayName,
    authorPhoto: photoURL,
    content,
    media,
    type,
    createdAt: serverTimestamp(),
    likesCount: 0,
    commentsCount: 0,
    reactions: {}
  });
};

// Messaging Services (RTDB)
export const sendMessage = async (chatId: string, senderId: string, text: string) => {
  const messagesRef = ref(rtdb, `chats/${chatId}/messages`);
  const newMessageRef = push(messagesRef);
  await set(newMessageRef, {
    senderId,
    text,
    timestamp: rtdbTimestamp(),
    read: false
  });
  
  // Update last message in chat metadata
  await set(ref(rtdb, `chats/${chatId}/lastMessage`), {
    text,
    senderId,
    timestamp: rtdbTimestamp()
  });
};

// Presence Services
export const updateUserPresence = (userId: string, isOnline: boolean) => {
  const presenceRef = ref(rtdb, `presence/${userId}`);
  set(presenceRef, {
    online: isOnline,
    lastSeen: rtdbTimestamp()
  });
};

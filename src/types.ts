import { Timestamp } from "firebase/firestore";

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  phone?: string;
  profileImage: string;
  bio: string;
  location: string;
  onlineStatus: 'online' | 'offline';
  lastSeen: Timestamp;
  pinnedUsers: string[];
  blockedUsers: string[];
  createdAt: Timestamp;
  role: 'user' | 'moderator' | 'admin';
  isBanned?: boolean;
  isSuspended?: boolean;
  isBot?: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  messageText: string;
  timestamp: Timestamp;
  readStatus: boolean;
  type?: 'text' | 'image' | 'file';
  fileUrl?: string;
}

export interface ChatSession {
  id: string;
  participants: string[];
  lastMessage?: string;
  lastTimestamp?: Timestamp;
  unreadCount: { [userId: string]: number };
}

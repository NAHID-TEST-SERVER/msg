import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  db, rtdb, collection, doc, getDoc, onSnapshot, query, where, 
  ref, set, push, onValue, off, onChildAdded, rtdbTimestamp 
} from "../firebase";
import { sendMessage, updateUserPresence } from "../services/socialService";
import { Send, Phone, Video, Info, Search, MoreVertical, Smile, Paperclip, Image as ImageIcon, Loader2, MessageCircle } from "lucide-react";
import { format } from "date-fns";

const Messenger = ({ user }: { user: any }) => {
  const { chatId: paramChatId } = useParams();
  const navigate = useNavigate();
  const [chats, setChats] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch all users to start chats with
  useEffect(() => {
    const q = query(collection(db, "users"), where("uid", "!=", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setChats(userList);
    });
    return () => unsubscribe();
  }, [user.uid]);

  // Handle active chat selection
  useEffect(() => {
    if (paramChatId) {
      const fetchChatUser = async () => {
        const userDoc = await getDoc(doc(db, "users", paramChatId));
        if (userDoc.exists()) {
          setActiveChat({ id: userDoc.id, ...userDoc.data() });
        }
      };
      fetchChatUser();
    } else {
      setActiveChat(null);
    }
  }, [paramChatId]);

  // Listen for messages in active chat
  useEffect(() => {
    if (!activeChat) return;

    const chatId = [user.uid, activeChat.id].sort().join("_");
    const messagesRef = ref(rtdb, `chats/${chatId}/messages`);
    
    const handleNewMessage = (snapshot: any) => {
      const data = snapshot.val();
      if (data) {
        const msgList = Object.entries(data).map(([id, val]: [string, any]) => ({ id, ...val }));
        setMessages(msgList.sort((a, b) => a.timestamp - b.timestamp));
      } else {
        setMessages([]);
      }
    };

    onValue(messagesRef, handleNewMessage);
    return () => off(messagesRef, "value", handleNewMessage);
  }, [activeChat, user.uid]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChat) return;

    const text = inputText;
    setInputText("");
    const chatId = [user.uid, activeChat.id].sort().join("_");
    
    await sendMessage(chatId, user.uid, text);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex card overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 border-r border-zinc-100 flex flex-col">
        <div className="p-4 border-b border-zinc-100">
          <h2 className="text-xl font-bold text-zinc-900 mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search chats..."
              className="input pl-10 w-full h-10 text-sm"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => navigate(`/messenger/${chat.id}`)}
              className={`flex items-center gap-3 p-4 cursor-pointer transition-colors ${
                activeChat?.id === chat.id ? "bg-emerald-50" : "hover:bg-zinc-50"
              }`}
            >
              <div className="relative">
                <img
                  src={chat.profilePhoto}
                  alt={chat.displayName}
                  className="w-12 h-12 rounded-xl object-cover"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <p className="font-bold text-zinc-900 truncate">{chat.displayName}</p>
                  <span className="text-[10px] text-zinc-400">12:45 PM</span>
                </div>
                <p className="text-xs text-zinc-500 truncate">
                  Click to chat
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="h-16 border-b border-zinc-100 px-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={activeChat.profilePhoto}
                  alt={activeChat.displayName}
                  className="w-10 h-10 rounded-xl object-cover"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <p className="font-bold text-zinc-900 leading-none mb-1">{activeChat.displayName}</p>
                  <p className="text-[10px] text-emerald-500 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                    Active Now
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-zinc-100 rounded-xl transition-colors text-zinc-500">
                  <Phone className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-zinc-100 rounded-xl transition-colors text-zinc-500">
                  <Video className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-zinc-100 rounded-xl transition-colors text-zinc-500">
                  <Info className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-zinc-50/30">
              {messages.map((msg) => {
                const isMe = msg.senderId === user.uid;
                return (
                  <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${
                      isMe 
                        ? "bg-emerald-600 text-white rounded-tr-none" 
                        : "bg-white border border-zinc-100 text-zinc-800 rounded-tl-none shadow-sm"
                    }`}>
                      <p>{msg.text}</p>
                      <p className={`text-[10px] mt-1 ${isMe ? "text-emerald-100" : "text-zinc-400"}`}>
                        {msg.timestamp ? format(new Date(msg.timestamp), "h:mm a") : ""}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-zinc-100">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <button type="button" className="p-2 hover:bg-zinc-100 rounded-xl transition-colors text-zinc-400">
                  <Paperclip className="w-5 h-5" />
                </button>
                <button type="button" className="p-2 hover:bg-zinc-100 rounded-xl transition-colors text-zinc-400">
                  <ImageIcon className="w-5 h-5" />
                </button>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type a message..."
                    className="w-full bg-zinc-100 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-4 py-2.5 outline-none transition-all pr-10"
                  />
                  <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                    <Smile className="w-5 h-5" />
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
            <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-600 mb-6">
              <MessageCircle className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-zinc-900 mb-2">Your Messenger</h3>
            <p className="text-zinc-500 max-w-xs">Send private photos and messages to a friend or AI companion.</p>
            <button className="mt-6 btn-primary">Send Message</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messenger;

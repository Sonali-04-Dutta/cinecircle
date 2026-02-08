import { useContext, useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { SocketContext } from "../context/SocketContext";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import { toast } from "react-hot-toast";

const Chat = () => {
  const { id } = useParams();
  const socket = useContext(SocketContext);
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [friend, setFriend] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [text, setText] = useState("");
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editText, setEditText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    setLoading(true);
    setIsTyping(false);
    
    api.get(`/api/users/${id}`).then(res => setFriend(res.data)).catch(console.error);

    api.get(`/api/chat/${id}`)
      .then((res) => {
        setMessages(res.data);
        scrollToBottom();
        // Mark messages as seen when chat opens
        if (socket && socket.connected) {
          socket.emit("markMessagesSeen", { senderId: id, receiverId: user._id });
        }
      })
      .catch(() => setError("Failed to load messages."))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (!socket) return;

    // Check initial status
    socket.emit("checkOnlineStatus", id, (status) => {
      setIsOnline(status);
    });

    const handleUserOnline = (userId) => {
      if (userId === id) setIsOnline(true);
    };

    const handleUserOffline = (userId) => {
      if (userId === id) setIsOnline(false);
    };

    const handleMessage = (msg) => {
      if (msg.sender === id || msg.receiver === id) {
        setMessages((prev) => [...prev, msg]);
        
        // Play sound if message is from the other person
        if (msg.sender === id) {
          const audio = new Audio("/chat.mp3");
          audio.play().catch(e => console.error("Audio play failed", e));
          // Mark as seen immediately if we are in this chat
          socket.emit("markMessagesSeen", { senderId: id, receiverId: user._id });
        }
      }
    };

    const handleMessagesSeen = ({ senderId }) => {
      if (senderId === id) {
        setMessages((prev) =>
          prev.map((msg) => (msg.sender === user._id ? { ...msg, seen: true } : msg))
        );
      }
    };

    const handleMessageUpdated = (updatedMsg) => {
      setMessages((prev) =>
        prev.map((msg) => (msg._id === updatedMsg._id ? updatedMsg : msg))
      );
    };

    const handleTyping = ({ senderId }) => {
      if (senderId === id) setIsTyping(true);
    };

    const handleStopTyping = ({ senderId }) => {
      if (senderId === id) setIsTyping(false);
    };

    socket.on("receiveMessage", handleMessage);
    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);
    socket.on("messagesSeen", handleMessagesSeen);
    socket.on("messageUpdated", handleMessageUpdated);
    socket.on("userOnline", handleUserOnline);
    socket.on("userOffline", handleUserOffline);

    return () => {
      socket.off("receiveMessage", handleMessage);
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
      socket.off("messagesSeen", handleMessagesSeen);
      socket.off("messageUpdated", handleMessageUpdated);
      socket.off("userOnline", handleUserOnline);
      socket.off("userOffline", handleUserOffline);
    };
  }, [socket, id]);

  const handleInputChange = (e) => {
    setText(e.target.value);

    if (socket && socket.connected) {
      socket.emit("typing", { senderId: user._id, receiverId: id });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("stopTyping", { senderId: user._id, receiverId: id });
      }, 2000);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const sendMessage = async () => {
    if (!text.trim() && !image) return;

    let imagePath = null;

    if (image) {
      const formData = new FormData();
      formData.append("image", image);
      try {
        const res = await api.post("/api/chat/upload", formData);
        imagePath = res.data.filePath;
      } catch (err) {
        console.error("Image upload failed", err);
        return;
      }
    }
    
    if (socket && socket.connected) {
      socket.emit("sendMessage", {
        senderId: user._id,
        receiverId: id,
        text,
        image: imagePath,
        replyTo: replyingTo?._id,
      });
      
      // Stop typing immediately when sending
      socket.emit("stopTyping", { senderId: user._id, receiverId: id });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      
      const audio = new Audio("/chat.mp3");
      audio.play().catch(e => console.error("Audio play failed", e));
      setText("");
      setImage(null);
      setPreview(null);
      setReplyingTo(null);
    }
  };

  const getAvatarUrl = (avatar) => {
    if (!avatar) return null;
    if (avatar.startsWith("http") || avatar.startsWith("data:")) return avatar;
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "";
    return `${baseUrl}${avatar.startsWith("/") ? "" : "/"}${avatar}`;
  };

  const handleDeleteChat = async () => {
    if (!window.confirm("Are you sure you want to delete this conversation? This cannot be undone.")) return;

    try {
      await api.delete(`/api/chat/${id}`);
      setMessages([]);
      toast.success("Chat deleted successfully");
    } catch (err) {
      console.error("Failed to delete chat", err);
      toast.error("Failed to delete chat");
    }
  };

  const startEditing = (msg) => {
    setEditingMessageId(msg._id);
    setEditText(msg.text || "");
  };

  const cancelEditing = () => {
    setEditingMessageId(null);
    setEditText("");
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };

  const saveEdit = () => {
    if (!editText.trim() && !editingMessageId) return;
    
    if (socket && socket.connected) {
      socket.emit("editMessage", { messageId: editingMessageId, newText: editText });
      cancelEditing();
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-100 p-4 md:p-8 flex flex-col transition-all duration-500 ease-in-out">
      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-500">
        
        {/* Header */}
        <div className="p-4 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
          {friend ? (
            <>
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold overflow-hidden">
                  {friend.avatar ? (
                    <img src={getAvatarUrl(friend.avatar)} alt={friend.name} className="w-full h-full object-cover" />
                  ) : (
                    friend.name.charAt(0).toUpperCase()
                  )}
                </div>
                {isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full shadow-sm"></div>
                )}
              </div>
              <div>
                <h2 className="font-bold text-lg leading-none">{friend.name}</h2>
                <p className={`text-xs font-medium mt-0.5 ${isOnline ? "text-green-500" : "text-gray-500 dark:text-gray-400"}`}>
                  {isOnline ? "Online" : "Offline"}
                </p>
              </div>
              <button
                onClick={handleDeleteChat}
                className="ml-auto text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800"
                title="Delete Chat"
              >
                🗑️
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700"></div>
              <div className="h-5 w-32 bg-gray-300 dark:bg-gray-700 rounded"></div>
            </div>
          )}
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-950/50 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-400 my-4 bg-red-500/10 p-2 rounded-lg">{error}</div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 opacity-60">
              <span className="text-4xl mb-2">👋</span>
              <p>No messages yet. Say hi!</p>
            </div>
          ) : (
            messages.map((m, i) => (
              <div key={i} className={`flex ${m.sender === user._id ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] md:max-w-md py-3 rounded-2xl shadow-md transition-all relative group ${
                  m.sender === user._id 
                    ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-br-none pl-5 pr-16" 
                    : "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-bl-none pl-5 pr-10"
                }`}>
                  {editingMessageId === m._id ? (
                    <div className="flex flex-col gap-2 min-w-[200px]">
                      <input
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full px-2 py-1 rounded text-slate-900 text-sm"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEdit();
                          if (e.key === "Escape") cancelEditing();
                        }}
                      />
                      <div className="flex justify-end gap-2 text-xs font-bold">
                        <button onClick={saveEdit} className="hover:underline">Save</button>
                        <button onClick={cancelEditing} className="opacity-80 hover:underline">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {m.replyTo && (
                        <div className="mb-2 p-2 rounded bg-black/5 dark:bg-white/10 border-l-4 border-indigo-500 text-xs opacity-80">
                          <p className="font-bold mb-0.5">{m.replyTo.sender === user._id ? "You" : friend?.name}</p>
                          <p className="truncate max-w-[150px]">{m.replyTo.text || "📷 Image"}</p>
                        </div>
                      )}

                      {m.sender === user._id && (
                        <button 
                          onClick={() => startEditing(m)}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-white/70 hover:text-white transition-opacity p-1"
                          title="Edit"
                        >
                          ✎
                        </button>
                      )}
                      <button 
                        onClick={() => setReplyingTo(m)}
                        className={`absolute top-2 ${m.sender === user._id ? "right-8 text-white/70 hover:text-white" : "right-2 text-gray-400 hover:text-indigo-500"} opacity-0 group-hover:opacity-100 transition-opacity p-1`}
                        title="Reply"
                      >
                        ↩️
                      </button>

                      {m.image && (
                        <img src={getAvatarUrl(m.image)} alt="attachment" className="rounded-lg mb-2 max-w-full max-h-60 object-cover" />
                      )}
                      {m.text && (
                        <p className="leading-relaxed">
                          {m.text}
                          {m.isEdited && <span className="text-[10px] opacity-70 ml-1 italic">(edited)</span>}
                        </p>
                      )}
                      <p className={`text-[10px] mt-1 text-right ${m.sender === user._id ? "text-blue-200" : "text-gray-400"}`}>
                        {m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                        {m.sender === user._id && m.seen && <span className="ml-1 font-bold text-xs">✓✓</span>}
                      </p>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-4 py-2 rounded-2xl rounded-bl-none text-sm italic animate-pulse">
                Typing...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
          {replyingTo && (
            <div className="mb-2 flex items-center justify-between bg-white dark:bg-slate-800 p-2 rounded-lg border-l-4 border-indigo-500 shadow-sm">
              <div className="text-sm">
                <p className="font-bold text-indigo-500">Replying to {replyingTo.sender === user._id ? "yourself" : friend?.name}</p>
                <p className="text-gray-500 dark:text-gray-400 truncate max-w-xs">{replyingTo.text || "📷 Image"}</p>
              </div>
              <button onClick={cancelReply} className="text-gray-400 hover:text-red-500 p-1">✕</button>
            </div>
          )}
          {preview && (
            <div className="mb-2 relative w-fit">
              <img src={preview} alt="Preview" className="h-20 rounded-lg border border-gray-300 dark:border-gray-600" />
              <button 
                onClick={() => { setImage(null); setPreview(null); }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>
          )}
          <div className="flex gap-3">
            <label className="cursor-pointer flex items-center justify-center text-gray-500 hover:text-indigo-500 transition-colors p-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
            <input
              value={text}
              onChange={handleInputChange}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 rounded-full px-5 py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-slate-400 dark:placeholder-slate-500"
            />
            <button 
              onClick={sendMessage} 
              disabled={!text.trim() && !image}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-full font-bold shadow-lg transition-all transform active:scale-95 flex items-center"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;

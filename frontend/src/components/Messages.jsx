import React, { useEffect, useState } from "react";
import { messageAPI, authAPI } from "../services/api";
import { MessageSquare, Send, User, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Messages() {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null); // For conversation view
    const [replyText, setReplyText] = useState("");

    useEffect(() => {
        const init = async () => {
            try {
                const userRes = await authAPI.getMe();
                setCurrentUser(userRes.data);
                fetchMessages();
            } catch (err) {
                console.error("Failed to load user", err);
            }
        };
        init();
    }, []);

    const fetchMessages = async () => {
        try {
            const res = await messageAPI.getMessages();
            setMessages(res.data);
        } catch (err) {
            console.error("Failed to load messages", err);
        } finally {
            setLoading(false);
        }
    };

    // Group messages by other user (conversation)
    const getConversations = () => {
        if (!currentUser) return [];
        const conversations = {};

        messages.forEach(msg => {
            const isSender = msg.sender.username === currentUser.username;
            const otherUser = isSender ? msg.recipient : msg.sender;
            const key = otherUser.username;

            if (!conversations[key]) {
                conversations[key] = {
                    user: otherUser,
                    messages: [],
                    lastMessage: msg
                };
            }
            conversations[key].messages.push(msg);
            // Update last message if this one is newer (assuming list is sorted desc, but let's compare dates if needed)
            // Backend sorts by -created_at, so first one found is latest? 
            // Actually I sort by created_at in backend. Let's rely on backend sort or sort manually.
            // My backend sorts by -created_at, so first item is latest.
            if (new Date(msg.created_at) > new Date(conversations[key].lastMessage.created_at)) {
                conversations[key].lastMessage = msg;
            }
        });

        // Convert to array and sort by last message date
        return Object.values(conversations).sort((a, b) =>
            new Date(b.lastMessage.created_at) - new Date(a.lastMessage.created_at)
        );
    };

    const handleReply = async (e) => {
        e.preventDefault();
        if (!replyText.trim() || !selectedUser) return;

        try {
            const res = await messageAPI.sendMessage(selectedUser.user.id, replyText);
            // Add new message to list
            setMessages([res.data, ...messages]);
            setReplyText("");
        } catch (err) {
            console.error("Failed to send reply", err);
            alert("Failed to send message");
        }
    };

    if (loading) return <div className="min-h-screen bg-black text-white p-8">Loading...</div>;

    const conversations = getConversations();
    const activeConversation = selectedUser ?
        messages.filter(m =>
            (m.sender.username === currentUser.username && m.recipient.username === selectedUser.user.username) ||
            (m.sender.username === selectedUser.user.username && m.recipient.username === currentUser.username)
        ).sort((a, b) => new Date(a.created_at) - new Date(b.created_at)) // Sort oldest to newest for chat view
        : [];

    return (
        <div className="min-h-screen bg-black text-white p-4 lg:p-8">
            <div className="max-w-6xl mx-auto h-[600px] bg-gray-900 border border-gray-800 rounded-xl overflow-hidden flex flex-col md:flex-row">

                {/* Apps Sidebar (Left) - Users List */}
                <div className={`w-full md:w-1/3 border-r border-gray-800 flex flex-col ${selectedUser ? 'hidden md:flex' : 'flex'}`}>
                    <div className="p-4 border-b border-gray-800 bg-gray-900">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-purple-500" />
                            Messages
                        </h2>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {conversations.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                No messages yet.
                            </div>
                        ) : (
                            conversations.map(conv => (
                                <button
                                    key={conv.user.username}
                                    onClick={() => setSelectedUser(conv)}
                                    className={`w-full p-4 flex items-center gap-3 hover:bg-gray-800 transition border-b border-gray-800 ${selectedUser?.user.username === conv.user.username ? 'bg-gray-800' : ''}`}
                                >
                                    <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center font-bold">
                                        {conv.user.username[0].toUpperCase()}
                                    </div>
                                    <div className="text-left flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <span className="font-semibold truncate">{conv.user.username}</span>
                                            <span className="text-xs text-gray-500">{new Date(conv.lastMessage.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-sm text-gray-400 truncate">{conv.lastMessage.text}</p>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                    <div className="p-4 border-t border-gray-800">
                        <button onClick={() => navigate("/user/dashboard")} className="text-sm text-gray-400 hover:text-white flex items-center gap-1">
                            <ChevronLeft className="w-4 h-4" /> Back to Dashboard
                        </button>
                    </div>
                </div>

                {/* Chat Area (Right) */}
                <div className={`w-full md:w-2/3 flex flex-col ${!selectedUser ? 'hidden md:flex' : 'flex'}`}>
                    {selectedUser ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 border-b border-gray-800 flex items-center gap-3 bg-gray-900">
                                <button onClick={() => setSelectedUser(null)} className="md:hidden text-gray-400">
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center font-bold">
                                    {selectedUser.user.username[0].toUpperCase()}
                                </div>
                                <span className="font-bold">{selectedUser.user.username}</span>
                            </div>

                            {/* Messages List */}
                            <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-4 bg-black bg-opacity-50">
                                {activeConversation.map(msg => {
                                    const isMe = msg.sender.username === currentUser.username;
                                    return (
                                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] rounded-xl p-3 ${isMe ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-200'}`}>
                                                <p className="text-sm">{msg.text}</p>
                                                <p className={`text-[10px] mt-1 ${isMe ? 'text-purple-200' : 'text-gray-500'} text-right`}>
                                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Reply Input */}
                            <form onSubmit={handleReply} className="p-4 border-t border-gray-800 bg-gray-900 flex gap-2">
                                <input
                                    type="text"
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
                                />
                                <button
                                    type="submit"
                                    disabled={!replyText.trim()}
                                    className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-500 flex-col gap-4">
                            <MessageSquare className="w-16 h-16 opacity-20" />
                            <p>Select a conversation to start messaging</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

import React, { useEffect, useState } from "react";
import { adminAPI } from "../services/api";
import { MessageSquare, User, Clock, ChevronLeft, Shield, Home, LogOut, Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function FeedbackManagement() {
    const navigate = useNavigate();
    const [feedback, setFeedback] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        const fetchFeedback = async () => {
            try {
                const res = await adminAPI.getFeedback();
                setFeedback(res.data);
            } catch (err) {
                console.error("Failed to load feedback", err);
                setError("Failed to load feedback messages.");
            } finally {
                setLoading(false);
            }
        };
        fetchFeedback();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("role");
        localStorage.removeItem("user");
        navigate("/login");
    };

    const navigationItems = [
        { name: "Pending Requests", icon: Clock, path: "/admin/pending" },
        { name: "Accepted Courses", icon: Clock, path: "/admin/accepted" }, // Assuming icon is similar
        { name: "Declined Courses", icon: X, path: "/admin/declined" },
        { name: "Popular Courses", icon: Clock, path: "/admin/popular" },
        { name: "All Users", icon: User, path: "/admin/users" },
        { name: "All Courses", icon: MessageSquare, path: "/admin/courses" },
        { name: "Feedback", icon: MessageSquare, path: "/admin/feedback" },
    ];

    if (loading) return <div className="min-h-screen bg-black text-white p-8 flex items-center justify-center">Loading feedback...</div>;

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Top Navigation Bar */}
            <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className="lg:hidden text-gray-400 hover:text-white"
                            >
                                {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                            <div className="flex items-center">
                                <Shield className="w-8 h-8 text-purple-500" />
                                <h1 className="ml-2 text-xl font-bold text-white">SkillConnect Admin</h1>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate("/")}
                                className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white transition"
                            >
                                <Home className="w-5 h-5" />
                                <span className="hidden sm:inline">Home</span>
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                            >
                                <LogOut className="w-5 h-5" />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="flex">
                {/* Sidebar Navigation */}
                <aside
                    className={`${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-64 bg-gray-900 border-r border-gray-800 transition-transform duration-300 ease-in-out h-[calc(100vh-64px)]`}
                >
                    <div className="p-4 space-y-2">
                        {navigationItems.map((item) => (
                            <button
                                key={item.name}
                                onClick={() => {
                                    navigate(item.path);
                                    setIsSidebarOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition group ${item.name === "Feedback" ? "bg-purple-600/20 text-purple-400" : "text-gray-300 hover:bg-gray-800 hover:text-white"
                                    }`}
                            >
                                <item.icon className="w-5 h-5" />
                                <span>{item.name}</span>
                            </button>
                        ))}
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-6 lg:p-8 overflow-y-auto h-[calc(100vh-64px)]">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-3xl font-bold flex items-center gap-3">
                                    <MessageSquare className="text-purple-500" />
                                    User Feedback
                                </h2>
                                <p className="text-gray-400 mt-2">View thoughts and suggestions from your users</p>
                            </div>
                            <button
                                onClick={() => navigate("/admin/dashboard")}
                                className="flex items-center gap-2 text-gray-400 hover:text-white transition"
                            >
                                <ChevronLeft className="w-5 h-5" />
                                Back to Dashboard
                            </button>
                        </div>

                        {error && (
                            <div className="bg-red-900/20 border border-red-800 text-red-400 p-4 rounded-xl mb-6">
                                {error}
                            </div>
                        )}

                        {feedback.length === 0 ? (
                            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center">
                                <MessageSquare className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                                <p className="text-xl text-gray-500">No feedback received yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {feedback.map((item) => (
                                    <div key={item.id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-purple-500/30 transition shadow-xl">
                                        <div className="p-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center font-bold text-xl">
                                                        {item.name[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-lg">{item.name}</h3>
                                                        <p className="text-purple-400 text-sm">{item.email}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center text-gray-500 text-sm gap-2">
                                                    <Clock className="w-4 h-4" />
                                                    {new Date(item.created_at).toLocaleString()}
                                                </div>
                                            </div>
                                            <div className="bg-black/40 rounded-xl p-4 border border-gray-800">
                                                <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">
                                                    {item.message}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>
            {/* Overlay for mobile sidebar */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}
        </div>
    );
}

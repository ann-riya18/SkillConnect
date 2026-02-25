import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminAPI, getMediaUrl } from "../services/api";
import {
    Shield,
    Home,
    LogOut,
    Clock,
    TrendingUp,
    CheckCircle,
    XCircle,
    Users,
    BookOpen,
    FileText,
    Menu,
    X,
    Heart
} from "lucide-react";

export default function PopularCourses() {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPopular = async () => {
            try {
                const res = await adminAPI.getPopularSkills();
                setSkills(res.data?.skills || []);
            } catch (err) {
                console.error(err);
                if (err.response?.status === 401) navigate("/login");
            } finally {
                setLoading(false);
            }
        };
        fetchPopular();
    }, [navigate]);

    const navigationItems = [
        { name: "Pending Requests", icon: Clock, path: "/admin/pending" },
        { name: "Accepted Courses", icon: CheckCircle, path: "/admin/accepted" },
        { name: "Declined Courses", icon: XCircle, path: "/admin/declined" },
        { name: "Popular Courses", icon: TrendingUp, path: "/admin/popular", active: true },
        { name: "All Users", icon: Users, path: "/admin/users" },
        { name: "All Courses", icon: BookOpen, path: "/admin/courses" },
        { name: "Feedback", icon: FileText, path: "/admin/feedback" },
    ];

    return (
        <div className="min-h-screen bg-black text-white">
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
                            <div className="flex items-center cursor-pointer" onClick={() => navigate("/admin/dashboard")}>
                                <Shield className="w-8 h-8 text-purple-500" />
                                <h1 className="ml-2 text-xl font-bold text-white">Admin</h1>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <button onClick={() => navigate("/")} className="text-gray-300 hover:text-white">Home</button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="flex">
                <aside className={`${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-64 bg-gray-900 border-r border-gray-800 transition-transform duration-300 ease-in-out mt-16 lg:mt-0`}>
                    <div className="p-4 space-y-2">
                        {navigationItems.map((item) => (
                            <button
                                key={item.name}
                                onClick={() => { navigate(item.path); setIsSidebarOpen(false); }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition group ${item.active ? "bg-purple-900 bg-opacity-20 text-purple-400 border border-purple-800" : "text-gray-300 hover:bg-gray-800 hover:text-white"}`}
                            >
                                <item.icon className="w-5 h-5" />
                                <span>{item.name}</span>
                            </button>
                        ))}
                    </div>
                </aside>

                <main className="flex-1 p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold">Popular Courses</h2>
                            <p className="text-gray-400">Top rated content by community engagement</p>
                        </div>

                        {loading ? (
                            <div className="text-center py-12 text-gray-400">Loading popular skills...</div>
                        ) : (
                            <div className="grid gap-6">
                                {skills.map((skill, index) => (
                                    <div
                                        key={skill.id}
                                        onClick={() => navigate(`/course/${skill.id}`)}
                                        className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col md:flex-row gap-6 items-center hover:border-purple-500/50 transition cursor-pointer group"
                                    >
                                        <div className="text-4xl font-bold text-gray-700 w-12 text-center h-12 flex items-center justify-center flex-shrink-0">
                                            #{index + 1}
                                        </div>
                                        <div className="w-full md:w-48 h-32 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                                            {skill.thumbnail ? (
                                                <img src={getMediaUrl(skill.thumbnail)} alt={skill.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <BookOpen className="w-full h-full p-8 text-gray-600" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-semibold mb-1">{skill.title}</h3>
                                            <p className="text-sm text-gray-400 mb-2">by {skill.username}</p>
                                            <div className="flex items-center gap-6">
                                                <div className="flex items-center gap-2 text-red-500">
                                                    <Heart className="w-5 h-5 fill-current" />
                                                    <span className="font-bold">{skill.total_likes || 0} Likes</span>
                                                </div>
                                                <span className="text-gray-500 text-sm">{new Date(skill.created_at).toLocaleDateString()}</span>
                                                <span className={`px-2 py-0.5 text-xs rounded border ${skill.status === 'accepted' ? 'border-green-800 bg-green-900/30 text-green-400' : 'border-yellow-800 bg-yellow-900/30 text-yellow-400'}`}>
                                                    {skill.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

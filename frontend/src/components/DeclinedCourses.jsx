import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminAPI } from "../services/api";
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
    Bell,
    Menu,
    X,
    AlertCircle
} from "lucide-react";

export default function DeclinedCourses() {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchDeclined();
    }, []);

    const fetchDeclined = async () => {
        try {
            setLoading(true);
            const res = await adminAPI.getDeclinedSkills();
            setSkills(res.data?.skills || []);
        } catch (err) {
            setError("Failed to load declined courses.");
            if (err.response?.status === 401) navigate("/login");
        } finally {
            setLoading(false);
        }
    };

    const updateSkillStatus = async (skillId, status) => {
        if (!window.confirm(`Restore this skill to ${status}?`)) return;
        try {
            await adminAPI.updateSkillStatus(skillId, status);
            setSkills(prev => prev.filter(s => s.id !== skillId));
            alert("Status updated successfully!");
        } catch (err) {
            alert("Failed to update status.");
        }
    };

    const navigationItems = [
        { name: "Pending Requests", icon: Clock, path: "/admin/pending" },
        { name: "Accepted Courses", icon: CheckCircle, path: "/admin/accepted" },
        { name: "Declined Courses", icon: XCircle, path: "/admin/declined", active: true },
        { name: "Popular Courses", icon: TrendingUp, path: "/admin/popular" },
        { name: "All Users", icon: Users, path: "/admin/users" },
        { name: "All Courses", icon: BookOpen, path: "/admin/courses" },
        { name: "Feedback", icon: FileText, path: "/admin/feedback" },
    ];

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Nav */}
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
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition group ${item.active ? "bg-red-900 bg-opacity-20 text-red-400 border border-red-800" : "text-gray-300 hover:bg-gray-800 hover:text-white"}`}
                            >
                                <item.icon className="w-5 h-5" />
                                <span>{item.name}</span>
                            </button>
                        ))}
                    </div>
                </aside>

                <main className="flex-1 p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-8 flex items-center justify-between">
                            <div>
                                <h2 className="text-3xl font-bold">Declined Courses</h2>
                                <p className="text-gray-400">Manage rejected submissions</p>
                            </div>
                            <button onClick={fetchDeclined} className="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700">Refresh</button>
                        </div>

                        {loading ? (
                            <div className="text-center py-12 text-gray-400">Loading declined courses...</div>
                        ) : skills.length === 0 ? (
                            <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center text-gray-400">
                                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                                <p className="text-xl">No declined courses found</p>
                            </div>
                        ) : (
                            <div className="grid gap-6">
                                {skills.map((skill) => (
                                    <div key={skill.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col md:flex-row gap-6 hover:border-red-500/30 transition">
                                        <div className="w-full md:w-64 h-40 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0 opacity-75">
                                            {skill.thumbnail ? (
                                                <img src={skill.thumbnail} alt={skill.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-600"><BookOpen className="w-12 h-12" /></div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <span className="px-2 py-1 bg-red-900/30 text-red-400 text-xs rounded border border-red-800 mb-2 inline-block">Declined</span>
                                                    <h3 className="text-xl font-bold text-gray-300 line-through decoration-red-500/50">{skill.title}</h3>
                                                    <p className="text-sm text-gray-400 mb-2">by {skill.username}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => updateSkillStatus(skill.id, "pending")}
                                                        className="px-3 py-1.5 border border-yellow-600 text-yellow-500 text-sm rounded hover:bg-yellow-900/20"
                                                    >
                                                        Restore to Pending
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-gray-500 mb-4 line-clamp-2">{skill.description}</p>
                                            <div className="text-sm text-gray-500">
                                                Submitted on: {new Date(skill.created_at).toLocaleDateString()}
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

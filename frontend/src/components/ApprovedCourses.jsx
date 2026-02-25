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
    Settings,
    Bell,
    Menu,
    X,
    AlertCircle
} from "lucide-react";

export default function ApprovedCourses() {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const [acceptedSkills, setAcceptedSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("role");
        localStorage.removeItem("user");
        alert("Logged out successfully!");
        navigate("/login");
    };

    useEffect(() => {
        fetchAccepted();
    }, []);

    const fetchAccepted = async () => {
        try {
            setLoading(true);
            setError("");
            const res = await adminAPI.getAcceptedSkills();
            setAcceptedSkills(res.data?.skills || []);
        } catch (err) {
            const msg = err?.response?.data?.detail || "Failed to load accepted courses.";
            setError(msg);
            if (err?.response?.status === 401 || err?.response?.status === 403) {
                handleLogout();
            }
        } finally {
            setLoading(false);
        }
    };

    const updateSkillStatus = async (skillId, status) => {
        try {
            if (!window.confirm(`Are you sure you want to ${status} this skill?`)) return;

            await adminAPI.updateSkillStatus(skillId, status);
            setAcceptedSkills((prev) => prev.filter((s) => s.id !== skillId));
            alert(`Skill ${status} successfully!`);
        } catch (err) {
            console.error(err);
            alert("Failed to update skill status");
        }
    };

    const navigationItems = [
        { name: "Pending Requests", icon: Clock, path: "/admin/pending" },
        { name: "Accepted Courses", icon: CheckCircle, path: "/admin/accepted", active: true },
        { name: "Declined Courses", icon: XCircle, path: "/admin/declined" },
        { name: "Popular Courses", icon: TrendingUp, path: "/admin/popular" },
        { name: "All Users", icon: Users, path: "/admin/users" },
        { name: "All Courses", icon: BookOpen, path: "/admin/courses" },
        { name: "Feedback", icon: FileText, path: "/admin/feedback" },
    ];

    return (
        <div className="min-h-screen bg-black">
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
                            <div className="flex items-center" onClick={() => navigate("/admin/dashboard")}>
                                <Shield className="w-8 h-8 text-purple-500 cursor-pointer" />
                                <h1 className="ml-2 text-xl font-bold text-white cursor-pointer">
                                    SkillConnect Admin
                                </h1>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <button className="relative text-gray-400 hover:text-white transition">
                                <Bell className="w-6 h-6" />
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    3
                                </span>
                            </button>
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
                {/* Sidebar */}
                <aside
                    className={`${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                        } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-64 bg-gray-900 border-r border-gray-800 transition-transform duration-300 ease-in-out mt-16 lg:mt-0`}
                >
                    <div className="p-4 space-y-2">
                        {navigationItems.map((item) => (
                            <button
                                key={item.name}
                                onClick={() => {
                                    navigate(item.path);
                                    setIsSidebarOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition group ${item.active
                                    ? "bg-green-900 bg-opacity-20 text-green-400 border border-green-800"
                                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                                    }`}
                            >
                                <item.icon className="w-5 h-5 group-hover:text-green-400" />
                                <span>{item.name}</span>
                            </button>
                        ))}
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-8 flex items-center justify-between">
                            <div>
                                <h2 className="text-3xl font-bold text-white mb-2">
                                    Accepted Courses
                                </h2>
                                <p className="text-gray-400">
                                    Manage visible courses on the platform
                                </p>
                            </div>
                            <button
                                onClick={fetchAccepted}
                                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition"
                            >
                                Refresh
                            </button>
                        </div>

                        {loading ? (
                            <div className="text-gray-400 text-center py-12">Loading accepted courses...</div>
                        ) : error ? (
                            <div className="bg-red-900 bg-opacity-20 border border-red-700 text-red-300 rounded-xl p-4">
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5" />
                                    {error}
                                </div>
                            </div>
                        ) : acceptedSkills.length === 0 ? (
                            <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center text-gray-400">
                                <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                                <p className="text-xl">No accepted courses yet</p>
                                <p className="text-sm mt-2">Approve skills from the pending list to see them here.</p>
                            </div>
                        ) : (
                            <div className="grid gap-6">
                                {acceptedSkills.map((skill) => (
                                    <div key={skill.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition">
                                        <div className="flex flex-col md:flex-row gap-6">
                                            {/* Thumbnail */}
                                            <div className="w-full md:w-64 h-40 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                                                {skill.thumbnail ? (
                                                    <img
                                                        src={skill.thumbnail}
                                                        alt={skill.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                                                        <BookOpen className="w-12 h-12" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <span className="px-2 py-1 bg-green-900 bg-opacity-30 text-green-400 text-xs rounded-full border border-green-800 mb-2 inline-block">
                                                            Live on Platform
                                                        </span>
                                                        <h3 className="text-xl font-bold text-white mb-2">{skill.title}</h3>
                                                        <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                                                            <span className="flex items-center gap-1">
                                                                <Users className="w-4 h-4" />
                                                                {skill.username || "Unknown User"}
                                                            </span>
                                                            <span>•</span>
                                                            <span>{skill.category || "Uncategorized"}</span>
                                                            <span>•</span>
                                                            <span>{new Date(skill.created_at).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>

                                                    <div className="text-right">
                                                    </div>
                                                </div>

                                                <p className="text-gray-300 mb-6 line-clamp-2">
                                                    {skill.description}
                                                </p>

                                                <div className="flex items-center gap-3">
                                                    <a
                                                        href={skill.course_link}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition text-sm"
                                                    >
                                                        View Content
                                                    </a>
                                                    <div className="flex-1"></div>
                                                    <button
                                                        onClick={() => updateSkillStatus(skill.id, "pending")}
                                                        className="px-4 py-2 border border-yellow-600 text-yellow-500 rounded-lg hover:bg-yellow-900 hover:bg-opacity-20 transition"
                                                    >
                                                        Revert to Pending
                                                    </button>
                                                    <button
                                                        onClick={() => updateSkillStatus(skill.id, "declined")}
                                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}
        </div>
    );
}

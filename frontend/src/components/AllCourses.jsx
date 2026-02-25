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
    Search,
    ExternalLink
} from "lucide-react";

export default function AllCourses() {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        try {
            const res = await adminAPI.getAllAdminCourses();
            setSkills(res.data?.skills || []);
        } catch (err) {
            if (err.response?.status === 401) navigate("/login");
        } finally {
            setLoading(false);
        }
    };

    const filteredSkills = skills.filter(s =>
        s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const navigationItems = [
        { name: "Pending Requests", icon: Clock, path: "/admin/pending" },
        { name: "Accepted Courses", icon: CheckCircle, path: "/admin/accepted" },
        { name: "Declined Courses", icon: XCircle, path: "/admin/declined" },
        { name: "Popular Courses", icon: TrendingUp, path: "/admin/popular" },
        { name: "All Users", icon: Users, path: "/admin/users" },
        { name: "All Courses", icon: BookOpen, path: "/admin/courses", active: true },
        { name: "Feedback", icon: FileText, path: "/admin/feedback" },
    ];

    const getStatusBadge = (status) => {
        switch (status) {
            case 'accepted': return <span className="px-2 py-1 rounded text-xs bg-green-900/30 text-green-400 border border-green-800">Live</span>;
            case 'pending': return <span className="px-2 py-1 rounded text-xs bg-yellow-900/30 text-yellow-400 border border-yellow-800">Pending</span>;
            case 'declined': return <span className="px-2 py-1 rounded text-xs bg-red-900/30 text-red-400 border border-red-800">Declined</span>;
            default: return null;
        }
    };

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
                        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                            <div>
                                <h2 className="text-3xl font-bold">All Courses</h2>
                                <p className="text-gray-400">Master list of all submissions</p>
                            </div>
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search title, user..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-purple-500 text-white"
                                />
                            </div>
                        </div>

                        {loading ? (
                            <div className="text-center py-12 text-gray-400">Loading database...</div>
                        ) : (
                            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-800 text-gray-400 text-sm uppercase">
                                            <tr>
                                                <th className="px-6 py-4 font-medium">Course</th>
                                                <th className="px-6 py-4 font-medium">User</th>
                                                <th className="px-6 py-4 font-medium">Status</th>
                                                <th className="px-6 py-4 font-medium">Date</th>
                                                <th className="px-6 py-4 font-medium">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-800">
                                            {filteredSkills.map((skill) => (
                                                <tr key={skill.id} className="hover:bg-gray-800/50 transition">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            {skill.thumbnail ? (
                                                                <img src={getMediaUrl(skill.thumbnail)} alt="" className="w-10 h-10 rounded object-cover" />
                                                            ) : (
                                                                <div className="w-10 h-10 bg-gray-700 rounded flex items-center justify-center"><BookOpen className="w-4 h-4" /></div>
                                                            )}
                                                            <span className="font-medium text-white">{skill.title}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-400">{skill.username}</td>
                                                    <td className="px-6 py-4 text-sm">{getStatusBadge(skill.status)}</td>
                                                    <td className="px-6 py-4 text-gray-500 text-sm">{new Date(skill.created_at).toLocaleDateString()}</td>
                                                    <td className="px-6 py-4">
                                                        <button
                                                            onClick={() => navigate(`/course/${skill.id}`)}
                                                            className="text-purple-400 hover:text-purple-300 flex items-center gap-1 text-sm transition"
                                                        >
                                                            View <ExternalLink className="w-3 h-3" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

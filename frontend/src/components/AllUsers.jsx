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
    Search
} from "lucide-react";

export default function AllUsers() {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        navigate("/login");
    };

    const fetchUsers = async () => {
        try {
            const res = await adminAPI.getAllUsers();
            setUsers(res.data?.users || []);
        } catch (err) {
            console.error(err);
            if (err.response?.status === 401) navigate("/login");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [navigate]);

    const handleDeleteUser = async (userId, username) => {
        if (!window.confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
            return;
        }

        try {
            await adminAPI.deleteUser(userId);
            alert("User deleted successfully.");
            fetchUsers(); // Refresh list
        } catch (err) {
            console.error(err);
            alert("Failed to delete user. " + (err.response?.data?.detail || ""));
        }
    };

    const filteredUsers = users.filter(u =>
        u.username.toLowerCase() !== "admin" && (
            u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const navigationItems = [
        { name: "Pending Requests", icon: Clock, path: "/admin/pending" },
        { name: "Accepted Courses", icon: CheckCircle, path: "/admin/accepted" },
        { name: "Declined Courses", icon: XCircle, path: "/admin/declined" },
        { name: "Popular Courses", icon: TrendingUp, path: "/admin/popular" },
        { name: "All Users", icon: Users, path: "/admin/users", active: true },
        { name: "All Courses", icon: BookOpen, path: "/admin/courses" },
        { name: "Feedback", icon: FileText, path: "/admin/feedback" },
    ];

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Nav & Sidebar Wrapper */}
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
                            <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700">
                                <LogOut className="w-4 h-4" /> Logout
                            </button>
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
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition group ${item.active ? "bg-blue-900 bg-opacity-20 text-blue-400 border border-blue-800" : "text-gray-300 hover:bg-gray-800 hover:text-white"}`}
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
                                <h2 className="text-3xl font-bold">All Users</h2>
                                <p className="text-gray-400">Manage registered users and view their contributions</p>
                            </div>
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-purple-500 text-white"
                                />
                            </div>
                        </div>

                        {loading ? (
                            <div className="text-center py-12 text-gray-400">Loading users...</div>
                        ) : (
                            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-800 text-gray-400 text-sm uppercase">
                                            <tr>
                                                <th className="px-6 py-4 font-medium">User</th>
                                                <th className="px-6 py-4 font-medium">Email</th>
                                                <th className="px-6 py-4 font-medium">Skills Uploaded</th>
                                                <th className="px-6 py-4 font-medium">Joined</th>
                                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-800">
                                            {filteredUsers.map((user) => (
                                                <tr key={user.id} className="hover:bg-gray-800/50 transition">
                                                    <td className="px-6 py-4 flex items-center gap-3 cursor-pointer group/user" onClick={() => navigate(`/profile/${user.username}`)}>
                                                        <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-sm font-bold group-hover/user:scale-110 transition">
                                                            {user.name[0].toUpperCase()}
                                                        </div>
                                                        <span className="font-medium text-white group-hover/user:text-purple-400 transition">{user.name}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-300">{user.email}</td>
                                                    <td className="px-6 py-4">
                                                        <span className="px-2 py-1 bg-green-900/30 text-green-400 rounded text-xs border border-green-800">
                                                            {user.skill_count} Uploads
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-500 text-sm">
                                                        {new Date(user.date_joined).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button
                                                            onClick={() => handleDeleteUser(user.id, user.name)}
                                                            className="text-red-400 hover:text-red-300 font-medium text-sm transition"
                                                        >
                                                            Delete
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

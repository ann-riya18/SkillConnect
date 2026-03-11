import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI, skillsAPI, getMediaUrl } from "../services/api";
import {
  BookOpen,
  Home,
  LogOut,
  User,
  Upload,
  Search,
  Library,
  Award,
  MessageSquare,
  Bell,
  Menu,
  X,
  TrendingUp,
  Clock,
  Star,
  Users,
  AlertCircle,
  Settings,
} from "lucide-react";

export default function UserDashboard() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [mySkills, setMySkills] = useState([]);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          navigate("/login");
          return;
        }

        const res = await authAPI.getMe();
        // if someone logs in as admin, send them to admin dashboard
        if (res.data.role === "admin") {
          navigate("/admin/dashboard");
          return;
        }
        setUser(res.data);

        // Fetch my skills count
        const skillsRes = await skillsAPI.getAll(); // This endpoint returns user's skills
        setMySkills(skillsRes.data || []);

      } catch (err) {
        console.log("ME ERROR:", err?.response?.data || err.message);
        alert("Session expired. Please login again.");

        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    alert("Logged out successfully!");
    navigate("/login");
  };

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        Loading dashboard...
      </div>
    );
  }

  if (!user) return null;

  // Calculate real stats
  const approvedCount = mySkills.filter(s => s.status === 'accepted').length;
  const pendingCount = mySkills.filter(s => s.status === 'pending').length;
  const declinedCount = mySkills.filter(s => s.status === 'declined').length;
  const totalCount = mySkills.length;

  const stats = [
    {
      title: "Active Courses",
      count: approvedCount, // User requested approved courses to show here
      icon: Library,
      color: "bg-purple-500",
      textColor: "text-purple-500",
    },
    {
      title: "Total Uploads",
      count: totalCount,
      icon: Upload,
      color: "bg-blue-500", // Changed color to distinguish
      textColor: "text-blue-500",
    },
    {
      title: "Pending Review",
      count: pendingCount,
      icon: Clock,
      color: "bg-yellow-500",
      textColor: "text-yellow-500",
    },
    /* "Needs Attention" removed as per request */
  ];

  const navigationItems = [
    { name: "Edit Profile", icon: User, path: "/user/profile" },
    { name: "Upload Skills", icon: Upload, path: "/user/upload-skills" },
    { name: "Search Courses", icon: Search, path: "/user/search" },
    { name: "Your Courses", icon: Library, path: "/user/skills" },
    { name: "Messages", icon: MessageSquare, path: "/user/messages" },
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Top Navigation Bar */}
      <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden text-gray-400 hover:text-white"
              >
                {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              <div className="flex items-center">
                <BookOpen className="w-8 h-8 text-purple-500" />
                <h1 className="ml-2 text-xl font-bold text-white">SkillConnect</h1>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">

              {/* User Profile */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded-lg">
                {user.profile_pic ? (
                  <img
                    src={getMediaUrl(user.profile_pic)}
                    alt="profile"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold">
                    {user.name?.charAt(0)}
                  </div>
                )}

                <div className="flex flex-col leading-tight">
                  <span className="text-white text-sm">{user.name}</span>
                  <span className="text-gray-400 text-xs">{user.email}</span>
                </div>
              </div>

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
                className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition group"
              >
                <item.icon className="w-5 h-5 group-hover:text-purple-400" />
                <span>{item.name}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Welcome */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">
                Welcome back, {user.name}!
              </h2>
              <p className="text-gray-400">Continue your learning journey</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat) => (
                <div
                  key={stat.title}
                  onClick={() => {
                    if (stat.title === "Active Courses") navigate("/user/skills", { state: { status: "accepted" } });
                    else if (stat.title === "Pending Review") navigate("/user/skills", { state: { status: "pending" } });
                    else navigate("/user/skills");
                  }}
                  className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-purple-500/50 transition cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 ${stat.color} bg-opacity-20 rounded-lg`}>
                      <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                    </div>
                  </div>
                  <h3 className="text-gray-400 text-sm mb-1">{stat.title}</h3>
                  <p className="text-3xl font-bold text-white">{stat.count}</p>
                </div>
              ))}
            </div>

            {/* Dashboard Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Recent Activity - Removed dummy data */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-6">
                  Recent Activity
                </h3>
                <div className="text-gray-400 text-center py-8">
                  No recent activity to show.
                </div>
              </div>

              {/* Recommended Courses - Removed dummy data */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-6">
                  Recommended for You
                </h3>
                <div className="text-gray-400 text-center py-8">
                  Check out the Search page to find new courses!
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
              <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => navigate("/user/search")}
                  className="px-6 py-4 bg-purple-600 bg-opacity-20 border border-purple-600 text-purple-400 rounded-lg hover:bg-opacity-30 transition font-medium"
                >
                  Search Courses
                </button>
                <button
                  onClick={() => navigate("/user/upload-skills")}
                  className="px-6 py-4 bg-green-600 bg-opacity-20 border border-green-600 text-green-400 rounded-lg hover:bg-opacity-30 transition font-medium"
                >
                  Upload Skills
                </button>
                <button
                  onClick={() => navigate("/user/skills")}
                  className="px-6 py-4 bg-blue-600 bg-opacity-20 border border-blue-600 text-blue-400 rounded-lg hover:bg-opacity-30 transition font-medium"
                >
                  My Courses
                </button>
                <button
                  onClick={() => navigate("/user/profile")}
                  className="px-6 py-4 bg-yellow-600 bg-opacity-20 border border-yellow-600 text-yellow-400 rounded-lg hover:bg-opacity-30 transition font-medium"
                >
                  Edit Profile
                </button>
              </div>

            </div>
          </div>
        </main>
      </div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}

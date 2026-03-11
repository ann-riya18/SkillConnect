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
} from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Stats state
  const [statsData, setStatsData] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState("");

  // Recent Activity state
  const [activity, setActivity] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [activityError, setActivityError] = useState("");

  // Pending skills state
  const [pendingSkills, setPendingSkills] = useState([]);
  const [loadingPending, setLoadingPending] = useState(true);
  const [pendingError, setPendingError] = useState("");

  // Optional: show admin name
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    alert("Logged out successfully!");
    navigate("/login");
  };

  // Fetch Stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoadingStats(true);
        setStatsError("");

        const access = localStorage.getItem("access_token");
        if (!access) {
          setStatsError("No access token found. Please login again.");
          navigate("/login");
          return;
        }

        const res = await adminAPI.getStats();

        setStatsData(res.data);
      } catch (err) {
        const msg =
          err?.response?.data?.detail ||
          err?.response?.data?.error ||
          "Failed to load admin stats.";
        setStatsError(msg);

        if (err?.response?.status === 401 || err?.response?.status === 403) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("role");
          localStorage.removeItem("user");
          navigate("/login");
        }
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, [navigate]);

  // Fetch Recent Activity (real signups)
  useEffect(() => {
    const fetchActivity = async () => {
      try {
        setLoadingActivity(true);
        setActivityError("");

        const access = localStorage.getItem("access_token");
        if (!access) {
          setActivityError("No access token found. Please login again.");
          navigate("/login");
          return;
        }

        const res = await adminAPI.getActivity();

        setActivity(res.data?.activities || []);
      } catch (err) {
        const msg =
          err?.response?.data?.detail ||
          err?.response?.data?.error ||
          "Failed to load recent activity.";
        setActivityError(msg);

        if (err?.response?.status === 401 || err?.response?.status === 403) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("role");
          localStorage.removeItem("user");
          navigate("/login");
        }
      } finally {
        setLoadingActivity(false);
      }
    };

    fetchActivity();
  }, [navigate]);

  // Fetch pending skills for admin review
  useEffect(() => {
    const fetchPending = async () => {
      try {
        setLoadingPending(true);
        setPendingError("");

        const access = localStorage.getItem("access_token");
        if (!access) {
          setPendingError("No access token found. Please login again.");
          navigate("/login");
          return;
        }

        const res = await adminAPI.getPendingSkills();
        setPendingSkills(res.data?.skills || []);
      } catch (err) {
        const msg = err?.response?.data?.detail || err?.response?.data || "Failed to load pending skills.";
        setPendingError(typeof msg === "string" ? msg : JSON.stringify(msg));

        if (err?.response?.status === 401 || err?.response?.status === 403) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("role");
          localStorage.removeItem("user");
          navigate("/login");
        }
      } finally {
        setLoadingPending(false);
      }
    };

    fetchPending();
  }, [navigate]);

  const updateSkillStatus = async (skillId, status) => {
    try {
      await adminAPI.updateSkillStatus(skillId, status);
      setPendingSkills((prev) => prev.filter((s) => s.id !== skillId));
      alert(`Skill ${status}`);
    } catch (err) {
      console.error(err);
      alert("Failed to update skill status");
    }
  };

  // Build stats UI from backend data
  const stats = [
    {
      title: "Pending Requests",
      count: statsData?.pending_requests ?? 0,
      icon: Clock,
      color: "bg-yellow-500",
      textColor: "text-yellow-500",
      path: "/admin/pending",
    },
    {
      title: "Accepted Courses",
      count: statsData?.accepted_courses ?? 0,
      icon: CheckCircle,
      color: "bg-green-500",
      textColor: "text-green-500",
      path: "/admin/accepted",
    },
    {
      title: "Declined Courses",
      count: statsData?.declined_courses ?? 0,
      icon: XCircle,
      color: "bg-red-500",
      textColor: "text-red-500",
      path: "/admin/declined",
    },
    {
      title: "Most Popular",
      count: statsData?.most_popular_count ?? 0,
      icon: TrendingUp,
      color: "bg-purple-500",
      textColor: "text-purple-500",
      path: "/admin/popular",
    },
    {
      title: "Total Users",
      count: statsData?.total_users ?? 0,
      icon: Users,
      color: "bg-blue-500",
      textColor: "text-blue-500",
      path: "/admin/users",
    },
    {
      title: "Total Courses",
      count: statsData?.total_courses ?? 0,
      icon: BookOpen,
      color: "bg-indigo-500",
      textColor: "text-indigo-500",
      path: "/admin/courses",
    },
  ];

  const navigationItems = [
    { name: "Pending Requests", icon: Clock, path: "/admin/pending" },
    { name: "Accepted Courses", icon: CheckCircle, path: "/admin/accepted" },
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
            {/* Left side - Logo and Title */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden text-gray-400 hover:text-white"
              >
                {isSidebarOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
              <div className="flex items-center">
                <Shield className="w-8 h-8 text-purple-500" />
                <h1 className="ml-2 text-xl font-bold text-white">
                  SkillConnect Admin
                </h1>
              </div>
            </div>

            {/* Right side - Actions */}
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

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Welcome Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">
                Welcome back, {storedUser?.name || "Admin"}
              </h2>
              <p className="text-gray-400">
                Here's what's happening with your platform today
              </p>
            </div>

            {/* Stats */}
            {loadingStats ? (
              <div className="text-gray-400 mb-8">Loading stats...</div>
            ) : statsError ? (
              <div className="bg-red-900 bg-opacity-20 border border-red-700 text-red-300 rounded-xl p-4 mb-8">
                {statsError}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {stats.map((stat) => (
                  <div
                    key={stat.title}
                    onClick={() => {
                      if (stat.title === "Pending Requests") navigate("/admin/pending");
                      else if (stat.title === "Accepted Courses") navigate("/admin/accepted");
                      else if (stat.title === "Declined Courses") navigate("/admin/declined");
                      else if (stat.title === "Total Users") navigate("/admin/users");
                      else if (stat.title === "Total Courses") navigate("/admin/courses");
                      else if (stat.title === "Most Popular") navigate("/admin/popular");
                    }}
                    className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-purple-500/50 hover:bg-gray-800 transition cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 ${stat.color} bg-opacity-20 rounded-lg group-hover:scale-110 transition`}>
                        <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                      </div>
                    </div>
                    <h3 className="text-gray-400 text-sm mb-1">{stat.title}</h3>
                    <p className="text-3xl font-bold text-white">{stat.count}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
              <h3 className="text-xl font-semibold text-white mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => navigate("/admin/pending")}
                  className="px-6 py-4 bg-yellow-600 bg-opacity-20 border border-yellow-600 text-yellow-400 rounded-lg hover:bg-opacity-30 transition font-medium"
                >
                  Review Pending
                </button>
                <button
                  onClick={() => navigate("/admin/users")}
                  className="px-6 py-4 bg-blue-600 bg-opacity-20 border border-blue-600 text-blue-400 rounded-lg hover:bg-opacity-30 transition font-medium"
                >
                  Manage Users
                </button>
                <button
                  onClick={() => navigate("/admin/courses")}
                  className="px-6 py-4 bg-purple-600 bg-opacity-20 border border-purple-600 text-purple-400 rounded-lg hover:bg-opacity-30 transition font-medium"
                >
                  View All Courses
                </button>
                <button
                  onClick={() => navigate("/admin/feedback")}
                  className="px-6 py-4 bg-green-600 bg-opacity-20 border border-green-600 text-green-400 rounded-lg hover:bg-opacity-30 transition font-medium"
                >
                  View Feedback
                </button>
              </div>
            </div>

            {/* ✅ Recent Activity (REAL) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>

                {loadingActivity ? (
                  <p className="text-gray-400">Loading recent activity...</p>
                ) : activityError ? (
                  <div className="bg-red-900 bg-opacity-20 border border-red-700 text-red-300 rounded-lg p-4">
                    {activityError}
                  </div>
                ) : activity.length === 0 ? (
                  <p className="text-gray-400">No recent activity yet.</p>
                ) : (
                  <div className="space-y-4">
                    {activity.map((a, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-4 bg-gray-800 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          <div>
                            <p className="text-white font-medium">{a.title}</p>
                            <p className="text-gray-400 text-sm">
                              {a.name} ({a.email})
                            </p>
                          </div>
                        </div>

                        <span className="text-gray-500 text-sm">
                          {a.time ? new Date(a.time).toLocaleString() : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Pending Skills</h3>

                {loadingPending ? (
                  <p className="text-gray-400">Loading pending skills...</p>
                ) : pendingError ? (
                  <div className="bg-red-900 bg-opacity-20 border border-red-700 text-red-300 rounded-lg p-4">
                    {pendingError}
                  </div>
                ) : pendingSkills.length === 0 ? (
                  <p className="text-gray-400">No pending skills.</p>
                ) : (
                  <div className="space-y-4">
                    {pendingSkills.map((s) => (
                      <div key={s.id} className="p-4 bg-gray-800 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-white font-medium">{s.title}</p>
                            <p className="text-gray-400 text-sm">by {s.user ? s.user.username : "-"}</p>
                            <p className="text-gray-400 text-sm mt-2">{s.description?.slice(0, 120)}{s.description?.length > 120 ? "..." : ""}</p>
                          </div>

                          <div className="flex flex-col gap-2 ml-4">
                            <button
                              onClick={() => updateSkillStatus(s.id, "accepted")}
                              className="px-3 py-2 bg-green-600 text-white rounded-lg"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => updateSkillStatus(s.id, "declined")}
                              className="px-3 py-2 bg-red-600 text-white rounded-lg"
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
        ></div>
      )}
    </div>
  );
}

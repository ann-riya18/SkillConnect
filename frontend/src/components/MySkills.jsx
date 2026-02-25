import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  Users,
  Edit,
  Trash2,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Filter,
  Calendar,
  DollarSign,
  Tag,
  BarChart3,
} from "lucide-react";
import { authAPI, skillsAPI, getMediaUrl } from "../services/api";

export default function MySkills() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const [filterStatus, setFilterStatus] = useState(location.state?.status || "all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [skillToDelete, setSkillToDelete] = useState(null);

  useEffect(() => {
    // Fetch skills from backend on mount
    skillsAPI
      .getAll()
      .then((res) => {
        if (Array.isArray(res.data)) setSkills(res.data);
      })
      .catch((err) => console.error("Failed to load skills:", err));
  }, []);

  const [user, setUser] = useState({ name: "", email: "" });

  useEffect(() => {
    // Fetch user details
    authAPI.getMe().then(res => {
      setUser(res.data);
    }).catch(err => console.error("Failed to load user:", err));
  }, []);

  // Sample skills data (replace with real data from backend)
  const [skills, setSkills] = useState([
    {
      id: 1,
      title: "Complete Web Development Bootcamp",
      category: "Web Development",
      level: "Beginner",
      priceType: "Paid",
      price: 49.99,
      status: "accepted",
      uploadDate: "2024-01-15",
      thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&q=80",
      students: 234,
      rating: 4.8,
    },
    {
      id: 2,
      title: "Advanced React Development",
      category: "Web Development",
      level: "Advanced",
      priceType: "Paid",
      price: 79.99,
      status: "pending",
      uploadDate: "2024-01-20",
      thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&q=80",
      students: 0,
      rating: 0,
    },
    {
      id: 3,
      title: "Python for Data Science",
      category: "Data Science",
      level: "Intermediate",
      priceType: "Free",
      price: 0,
      status: "accepted",
      uploadDate: "2024-01-10",
      thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&q=80",
      students: 567,
      rating: 4.9,
    },
    {
      id: 4,
      title: "UI/UX Design Fundamentals",
      category: "UI/UX Design",
      level: "Beginner",
      priceType: "Paid",
      price: 39.99,
      status: "declined",
      uploadDate: "2024-01-18",
      thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&q=80",
      students: 0,
      rating: 0,
      rejectionReason: "Course content does not meet quality standards. Please add more detailed modules and examples.",
    },
  ]);

  const handleLogout = () => {
    console.log("User logged out");
    alert("Logged out successfully!");
    navigate("/login");
  };

  const navigationItems = [
    { name: "Edit Profile", icon: User, path: "/user/profile" },
    { name: "Upload Skills", icon: Upload, path: "/user/upload-skills" },
    { name: "Search Courses", icon: Search, path: "/user/search" },
    { name: "Your Courses", icon: Library, path: "/user/skills" },
    { name: "Messages", icon: MessageSquare, path: "/user/messages" },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case "accepted":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-600 bg-opacity-20 border border-green-600 text-green-400 rounded-full text-sm font-medium">
            <CheckCircle className="w-4 h-4" />
            Approved
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-600 bg-opacity-20 border border-yellow-600 text-yellow-400 rounded-full text-sm font-medium">
            <Clock className="w-4 h-4" />
            Pending Review
          </span>
        );
      case "declined":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-600 bg-opacity-20 border border-red-600 text-red-400 rounded-full text-sm font-medium">
            <XCircle className="w-4 h-4" />
            Declined
          </span>
        );
      default:
        return null;
    }
  };

  const getLevelBadge = (level) => {
    const colors = {
      Beginner: "bg-blue-600 text-blue-200",
      Intermediate: "bg-purple-600 text-purple-200",
      Advanced: "bg-orange-600 text-orange-200",
    };
    return (
      <span className={`px-2 py-1 ${colors[level]} bg-opacity-20 rounded text-xs font-medium`}>
        {level}
      </span>
    );
  };

  const handleViewSkill = (skillId) => {
    console.log("Viewing skill:", skillId);
    // Navigate to skill detail page or open modal
    alert(`Viewing details for skill ID: ${skillId}`);
  };

  const handleEditSkill = (skillId) => {
    console.log("Editing skill:", skillId);
    // Navigate to edit page
    navigate(`/user/edit-skill/${skillId}`);
  };

  const confirmDelete = (skill) => {
    setSkillToDelete(skill);
    setShowDeleteModal(true);
  };

  const handleDeleteSkill = () => {
    if (skillToDelete) {
      // call backend delete
      import("../services/api").then(({ skillsAPI }) => {
        skillsAPI
          .remove(skillToDelete.id)
          .then(() => {
            setSkills((prev) => prev.filter((s) => s.id !== skillToDelete.id));
            alert(`Skill "${skillToDelete.title}" has been deleted successfully!`);
          })
          .catch((err) => {
            console.error("Delete failed:", err);
            alert("Failed to delete skill");
          })
          .finally(() => {
            setShowDeleteModal(false);
            setSkillToDelete(null);
          });
      });
    }
  };

  const filteredSkills = skills.filter((skill) => {
    if (filterStatus === "all") return true;
    return skill.status === filterStatus;
  });

  const stats = {
    total: skills.length,
    accepted: skills.filter((s) => s.status === "accepted").length,
    pending: skills.filter((s) => s.status === "pending").length,
    declined: skills.filter((s) => s.status === "declined").length,
  };

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
                <BookOpen className="w-8 h-8 text-purple-500" />
                <h1 className="ml-2 text-xl font-bold text-white">
                  SkillConnect
                </h1>
              </div>
            </div>

            {/* Right side - User Actions */}
            <div className="flex items-center gap-4">

              {/* User Profile */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold">
                  {user.name.charAt(0)}
                </div>
                <span className="text-white text-sm">{user.name}</span>
              </div>

              <button
                onClick={() => navigate("/user/dashboard")}
                className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white transition"
              >
                <Home className="w-5 h-5" />
                <span className="hidden sm:inline">Dashboard</span>
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
                className={`w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition group ${item.name === "Your Skills" ? "bg-gray-800 text-white" : ""
                  }`}
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
            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  My Skills & Courses
                </h2>
                <p className="text-gray-400">
                  Manage and track your uploaded content
                </p>
              </div>
              <button
                onClick={() => navigate("/user/upload-skills")}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 transition font-semibold"
              >
                <Plus className="w-5 h-5" />
                Upload New Skill
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-5 h-5 text-purple-500" />
                  <span className="text-gray-400 text-sm">Total Skills</span>
                </div>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-400 text-sm">Approved</span>
                </div>
                <p className="text-2xl font-bold text-white">{stats.accepted}</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-yellow-500" />
                  <span className="text-gray-400 text-sm">Pending</span>
                </div>
                <p className="text-2xl font-bold text-white">{stats.pending}</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="w-5 h-5 text-red-500" />
                  <span className="text-gray-400 text-sm">Declined</span>
                </div>
                <p className="text-2xl font-bold text-white">{stats.declined}</p>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-purple-500" />
                <span className="text-white font-medium">Filter by Status</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "all", label: "All Skills", count: stats.total },
                  { value: "accepted", label: "Approved", count: stats.accepted },
                  { value: "pending", label: "Pending", count: stats.pending },
                  { value: "declined", label: "Declined", count: stats.declined },
                ].map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setFilterStatus(filter.value)}
                    className={`px-4 py-2 rounded-lg font-medium transition ${filterStatus === filter.value
                      ? "bg-purple-600 text-white"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-750"
                      }`}
                  >
                    {filter.label} ({filter.count})
                  </button>
                ))}
              </div>
            </div>

            {/* Skills List */}
            {filteredSkills.length === 0 ? (
              // Empty State
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
                <Award className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  {filterStatus === "all"
                    ? "No Skills Yet"
                    : `No ${filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)} Skills`}
                </h3>
                <p className="text-gray-400 mb-6">
                  {filterStatus === "all"
                    ? "Start sharing your knowledge by uploading your first skill or course!"
                    : `You don't have any ${filterStatus} skills at the moment.`}
                </p>
                <button
                  onClick={() => navigate("/user/upload-skills")}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 transition font-semibold"
                >
                  <Plus className="w-5 h-5" />
                  Upload Your First Skill
                </button>
              </div>
            ) : (
              // Skills Grid
              <div className="grid gap-6">
                {filteredSkills.map((skill) => (
                  <div
                    key={skill.id}
                    className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition"
                  >
                    <div className="flex flex-col md:flex-row">
                      {/* Thumbnail */}
                      <div className="md:w-64 h-48 md:h-auto bg-gray-800">
                        <img
                          src={getMediaUrl(skill.thumbnail)}
                          alt={skill.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-6">
                        <div className="flex flex-col h-full">
                          {/* Top Section */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h3 className="text-xl font-semibold text-white mb-2">
                                  {skill.title}
                                </h3>
                                <div className="flex flex-wrap items-center gap-2 mb-3">
                                  <span className="inline-flex items-center gap-1 text-gray-400 text-sm">
                                    <Tag className="w-4 h-4" />
                                    {skill.category}
                                  </span>
                                  {getLevelBadge(skill.level)}
                                </div>
                              </div>
                              {getStatusBadge(skill.status)}
                            </div>

                            {/* Stats (only for approved courses) */}
                            {skill.status === "approved" && (
                              <div className="flex items-center gap-4 mb-3 text-sm">
                                <span className="flex items-center gap-1 text-gray-400">
                                  <Users className="w-4 h-4" />
                                  {skill.students} students
                                </span>
                                <span className="flex items-center gap-1 text-gray-400">
                                  <BarChart3 className="w-4 h-4" />
                                  {skill.rating} ★
                                </span>
                              </div>
                            )}

                            {/* Upload Date */}
                            <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
                              <Calendar className="w-4 h-4" />
                              Uploaded on {new Date(skill.uploadDate).toLocaleDateString()}
                            </div>

                            {/* Rejection Reason */}
                            {skill.status === "declined" && skill.rejectionReason && (
                              <div className="bg-red-900 bg-opacity-20 border border-red-800 rounded-lg p-3 mb-3">
                                <p className="text-red-400 text-sm">
                                  <strong>Rejection Reason:</strong> {skill.rejectionReason}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-800">
                            <button
                              onClick={() => handleViewSkill(skill.id)}
                              className="flex items-center gap-2 px-4 py-2 bg-blue-600 bg-opacity-20 border border-blue-600 text-blue-400 rounded-lg hover:bg-opacity-30 transition text-sm font-medium"
                            >
                              <Eye className="w-4 h-4" />
                              View Details
                            </button>
                            {(skill.status === "pending" || skill.status === "declined") && (
                              <button
                                onClick={() => handleEditSkill(skill.id)}
                                className="flex items-center gap-2 px-4 py-2 bg-purple-600 bg-opacity-20 border border-purple-600 text-purple-400 rounded-lg hover:bg-opacity-30 transition text-sm font-medium"
                              >
                                <Edit className="w-4 h-4" />
                                Edit
                              </button>
                            )}
                            <button
                              onClick={() => confirmDelete(skill)}
                              className="flex items-center gap-2 px-4 py-2 bg-red-600 bg-opacity-20 border border-red-600 text-red-400 rounded-lg hover:bg-opacity-30 transition text-sm font-medium"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-600 bg-opacity-20 rounded-full flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold text-white">Delete Skill</h3>
            </div>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete{" "}
              <strong className="text-white">"{skillToDelete?.title}"</strong>?
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSkillToDelete(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg hover:bg-gray-750 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSkill}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

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
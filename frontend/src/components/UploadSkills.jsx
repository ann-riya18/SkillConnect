import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { skillsAPI } from "../services/api";
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
  Image,
  Tag,
  AlertCircle,
  CheckCircle,
  Link as LinkIcon,
} from "lucide-react";

export default function UploadSkills() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // use skillsAPI to post to backend

  // ✅ user from localStorage (optional)
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    level: "",
    course_link: "",   // backend field
    thumbnail: null,   // optional
  });

  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
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

  const categories = [
    "Web Development",
    "Mobile Development",
    "Data Science",
    "Machine Learning",
    "UI/UX Design",
    "Graphic Design",
    "Digital Marketing",
    "Business",
    "Photography",
    "Video Editing",
    "Music Production",
    "Writing",
    "Language Learning",
    "Finance",
    "Other",
  ];

  const levels = ["Beginner", "Intermediate", "Advanced"];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, thumbnail: "Please upload an image file" }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, thumbnail: "Thumbnail must be < 5MB" }));
      return;
    }

    setFormData((prev) => ({ ...prev, thumbnail: file }));
    setErrors((prev) => ({ ...prev, thumbnail: "" }));

    const reader = new FileReader();
    reader.onloadend = () => setThumbnailPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const isValidUrl = (url) => {
    try {
      const u = new URL(url);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.category) newErrors.category = "Please select a category";

    if (!formData.description.trim()) newErrors.description = "Description is required";
    else if (formData.description.trim().length < 50)
      newErrors.description = "Description should be at least 50 characters";

    if (!formData.level) newErrors.level = "Please select a level";

    // Price logic removed - all are free

    if (!formData.course_link.trim()) {
      newErrors.course_link = "Please paste a course/video link";
    } else if (!isValidUrl(formData.course_link.trim())) {
      newErrors.course_link = "Please enter a valid URL (include https://)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      alert("Please fix the errors in the form");
      return;
    }

    const user = localStorage.getItem("user");
    if (!user) {
      alert("Please login to upload a skill.");
      navigate("/login");
      return;
    }

    try {
      setSubmitting(true);

      // Build FormData for multipart upload (includes thumbnail file if provided)
      const fd = new FormData();
      fd.append("title", formData.title.trim());
      fd.append("category", formData.category);
      fd.append("description", formData.description.trim());
      fd.append("level", formData.level || "Beginner");
      fd.append("price_type", "Free");
      fd.append("price", 0);
      fd.append("course_link", formData.course_link.trim());

      if (formData.thumbnail) {
        fd.append("thumbnail", formData.thumbnail);
      }

      await skillsAPI.create(fd);

      alert("Skill submitted! Waiting for admin approval ✅");

      setFormData({
        title: "",
        category: "",
        description: "",
        level: "",
        course_link: "",
        thumbnail: null,
      });
      setThumbnailPreview(null);
      setErrors({});
    } catch (err) {
      console.log("Upload error:", err?.response?.data || err.message);

      // show serializer errors nicely
      const serverData = err?.response?.data;
      const msg = typeof serverData === "object" ? JSON.stringify(serverData, null, 2) : serverData?.detail || serverData?.error || "Upload failed. Please try again.";
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Top Nav */}
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
                <BookOpen className="w-8 h-8 text-purple-500" />
                <h1 className="ml-2 text-xl font-bold text-white">SkillConnect</h1>
              </div>
            </div>

            <div className="flex items-center gap-4">

              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold">
                  {(user?.name || "U").charAt(0)}
                </div>
                <span className="text-white text-sm">{user?.name || "User"}</span>
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
                className={`w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition group ${item.name === "Upload Skills" ? "bg-gray-800 text-white" : ""
                  }`}
              >
                <item.icon className="w-5 h-5 group-hover:text-purple-400" />
                <span>{item.name}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Upload New Skill/Course</h2>
              <p className="text-gray-400">Share your knowledge with the SkillConnect community</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-purple-500" />
                  Basic Information
                </h3>

                <div className="space-y-6">
                  {/* Title */}
                  <div>
                    <label className="block text-gray-300 mb-2 font-medium">
                      Skill/Course Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 bg-gray-800 border ${errors.title ? "border-red-500" : "border-gray-700"
                        } rounded-lg text-white focus:outline-none focus:border-purple-500 transition`}
                      placeholder="e.g., Complete Web Development Bootcamp"
                    />
                    {errors.title && (
                      <p className="mt-2 text-red-500 text-sm flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.title}
                      </p>
                    )}
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-gray-300 mb-2 font-medium">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 bg-gray-800 border ${errors.category ? "border-red-500" : "border-gray-700"
                        } rounded-lg text-white focus:outline-none focus:border-purple-500 transition`}
                    >
                      <option value="">Select a category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="mt-2 text-red-500 text-sm flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.category}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-gray-300 mb-2 font-medium">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={6}
                      className={`w-full px-4 py-3 bg-gray-800 border ${errors.description ? "border-red-500" : "border-gray-700"
                        } rounded-lg text-white focus:outline-none focus:border-purple-500 transition resize-none`}
                      placeholder="Describe what learners will get from your course..."
                    />
                    <div className="flex items-center justify-between mt-2">
                      {errors.description ? (
                        <p className="text-red-500 text-sm flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.description}
                        </p>
                      ) : (
                        <p className="text-gray-500 text-sm">Minimum 50 characters</p>
                      )}
                      <p className="text-gray-500 text-sm">{formData.description.length} characters</p>
                    </div>
                  </div>

                  {/* Level */}
                  <div>
                    <label className="block text-gray-300 mb-2 font-medium">
                      Level <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                      {levels.map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({ ...prev, level }));
                            if (errors.level) setErrors((prev) => ({ ...prev, level: "" }));
                          }}
                          className={`px-4 py-3 rounded-lg border-2 transition font-medium ${formData.level === level
                            ? "bg-purple-600 border-purple-600 text-white"
                            : "bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600"
                            }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                    {errors.level && (
                      <p className="mt-2 text-red-500 text-sm flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.level}
                      </p>
                    )}
                  </div>

                  {/* Course Link */}
                  <div>
                    <label className="block text-gray-300 mb-2 font-medium">
                      Course/Video Link <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <LinkIcon className="w-4 h-4" />
                      </span>
                      <input
                        type="url"
                        name="course_link"
                        value={formData.course_link}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-3 bg-gray-800 border ${errors.course_link ? "border-red-500" : "border-gray-700"
                          } rounded-lg text-white focus:outline-none focus:border-purple-500 transition`}
                        placeholder="https://youtube.com/... or https://udemy.com/..."
                      />
                    </div>
                    {errors.course_link && (
                      <p className="mt-2 text-red-500 text-sm flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.course_link}
                      </p>
                    )}
                    <p className="text-gray-500 text-sm mt-2">
                      Paste any valid link from YouTube / Udemy / Coursera / your website.
                    </p>
                  </div>
                </div>
              </div>

              {/* Pricing Section Removed - All courses are free */}

              {/* Thumbnail */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <Image className="w-5 h-5 text-blue-500" />
                  Thumbnail (Optional)
                </h3>

                <div className="flex flex-col md:flex-row gap-4">
                  <div className="md:w-1/3">
                    <div className="aspect-video bg-gray-800 border-2 border-dashed border-gray-700 rounded-lg overflow-hidden">
                      {thumbnailPreview ? (
                        <img src={thumbnailPreview} alt="Thumbnail" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                          <Image className="w-12 h-12" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="md:w-2/3 flex flex-col justify-center">
                    <label className="cursor-pointer">
                      <div className="px-6 py-4 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-750 transition text-center">
                        <Upload className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                        <p className="text-white font-medium">Click to upload thumbnail</p>
                        <p className="text-gray-400 text-sm mt-1">PNG, JPG up to 5MB</p>

                        {formData.thumbnail && (
                          <p className="text-green-500 text-sm mt-2 flex items-center justify-center gap-1">
                            <CheckCircle className="w-4 h-4" />
                            {formData.thumbnail.name}
                          </p>
                        )}
                      </div>

                      <input type="file" accept="image/*" onChange={handleThumbnailChange} className="hidden" />
                    </label>

                    {errors.thumbnail && (
                      <p className="mt-2 text-red-500 text-sm flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.thumbnail}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => navigate("/user/dashboard")}
                  className="flex-1 px-6 py-4 bg-gray-800 border border-gray-700 text-white rounded-lg hover:bg-gray-750 transition font-semibold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 transition font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <Upload className="w-5 h-5" />
                  {submitting ? "Submitting..." : "Submit for Approval"}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}

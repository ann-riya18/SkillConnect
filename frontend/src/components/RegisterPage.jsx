import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { BookOpen, Upload, X } from "lucide-react";
import { authAPI } from "../services/api";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm_password: "",
    bio: "",
  });

  const [profilePic, setProfilePic] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please choose an image file.");
      return;
    }

    setProfilePic(file);

    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result);
    reader.readAsDataURL(file);
  };

  const removeProfilePic = () => {
    setProfilePic(null);
    setPreviewUrl(null);
  };

  const showApiError = (serverData) => {
    if (!serverData) return "Registration failed";

    if (typeof serverData === "string") return serverData;
    if (serverData.detail) return serverData.detail;

    const keys = Object.keys(serverData);
    if (keys.length > 0) {
      const firstKey = keys[0];
      const val = serverData[firstKey];
      if (Array.isArray(val) && val.length > 0) return val[0];
    }

    return "Registration failed";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();

    if (!name) {
      alert("Name is required.");
      return;
    }

    if (form.password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    if (form.password !== form.confirm_password) {
      alert("Passwords do not match!");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", form.password);
      formData.append("confirm_password", form.confirm_password);
      formData.append("bio", form.bio);

      if (profilePic) {
        formData.append("profile_pic", profilePic);
      }

      await authAPI.register(formData);

      alert("Registration successful!");
      navigate("/login");
    } catch (err) {
      console.log("Register error:", err?.response?.data || err.message);
      alert(showApiError(err?.response?.data));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-gray-800 border border-gray-700 rounded-2xl p-8">
        <div className="flex items-center justify-center mb-6">
          <BookOpen className="w-8 h-8 text-purple-500" />
          <h1 className="ml-2 text-2xl font-bold text-white">SkillConnect</h1>
        </div>

        <h2 className="text-xl font-semibold text-white text-center mb-6">
          Create your account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Profile Picture */}
          <div>
            <label className="block text-gray-300 mb-2">
              Profile Picture <span className="text-gray-500">(Optional)</span>
            </label>

            <div className="flex items-center gap-4">
              {previewUrl ? (
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-20 h-20 rounded-full object-cover border-2 border-purple-400"
                  />
                  <button
                    type="button"
                    onClick={removeProfilePic}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-700 border-2 border-dashed border-gray-600 flex items-center justify-center">
                  <Upload className="w-6 h-6 text-gray-500" />
                </div>
              )}

              <label className="cursor-pointer px-4 py-2 bg-gray-700 text-white rounded-lg">
                Choose File
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Name */}
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
            placeholder="Your full name"
            required
          />

          {/* Email */}
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
            placeholder="your@email.com"
            required
          />

          {/* Password */}
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
            placeholder="Password"
            required
          />

          {/* Confirm Password */}
          <input
            type="password"
            name="confirm_password"
            value={form.confirm_password}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
            placeholder="Confirm password"
            required
          />

          {/* Bio */}
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
            placeholder="Tell us about yourself"
            rows={4}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full px-8 py-4 bg-gradient-to-r from-[#c77dff] to-[#f7b2d9] text-white rounded-lg text-lg font-semibold"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>

          <div className="text-center text-gray-400 text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-purple-400">
              Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

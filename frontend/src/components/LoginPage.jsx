import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { authAPI } from "../services/api";

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      // clear old local storage
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");

      const email = form.email.trim().toLowerCase();
      const password = form.password;

      console.log("=== LOGIN ATTEMPT ===");
      console.log("Email:", email);
      console.log("API Base URL:", "http://127.0.0.1:8000/api");

      // 1) Login -> get JWT tokens
      console.log("Step 1: Sending login request...");
      const loginRes = await authAPI.login(email, password);

      console.log("Login response status:", loginRes.status);
      console.log("Login response data:", loginRes.data);

      // Expected: { access: "...", refresh: "..." }
      const { access, refresh } = loginRes.data || {};

      if (!access || !refresh) {
        console.error("Missing tokens in response:", loginRes.data);
        alert("❌ Login failed: No tokens received.\n\nCheck browser console for details.\n\nMake sure:\n1. Backend is running on http://127.0.0.1:8000\n2. Email/password are correct\n3. Account exists");
        return;
      }

      console.log("Step 2: Tokens received successfully");
      console.log("Access token received: YES");
      console.log("Refresh token received: YES");

      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
      console.log("Step 3: Tokens stored in localStorage");

      // 2) Get current user using token
      console.log("Step 4: Fetching user info with token...");
      const meRes = await authAPI.getMe();
      const me = meRes.data;

      console.log("Step 5: User info received:", me);
      localStorage.setItem("user", JSON.stringify(me));

      // 3) Role handling
      const role = (me?.role || "user").toLowerCase();
      console.log("Step 6: User role determined:", role);
      localStorage.setItem("role", role);

      console.log("Step 7: Redirecting...");
      const redirectPath = role === "admin" ? "/admin/dashboard" : "/user/dashboard";
      console.log("Redirect destination:", redirectPath);

      if (role === "admin") {
        console.log("Admin detected, navigating to /admin/dashboard");
        navigate("/admin/dashboard");
      } else {
        console.log("Regular user detected, navigating to /user/dashboard");
        navigate("/user/dashboard");
      }

      console.log("=== LOGIN SUCCESS ===");
    } catch (err) {
      console.error("Login error:", err);
      console.error("Error response:", err?.response?.data);
      console.error("Error message:", err.message);
      console.error("Full error object:", JSON.stringify(err, null, 2));

      const server = err?.response?.data;

      // SimpleJWT often returns: { "detail": "No active account found..." }
      const msg =
        server?.detail ||
        (server?.email && Array.isArray(server.email) ? server.email[0] : null) ||
        (server?.password && Array.isArray(server.password) ? server.password[0] : null) ||
        server?.error ||
        (typeof server === "object" ? JSON.stringify(server, null, 2) : "") ||
        err.message ||
        "Login failed. Check email/password.";

      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-gray-800 border border-gray-700 rounded-2xl p-8">
        <div className="flex items-center justify-center mb-6">
          <BookOpen className="w-8 h-8 text-purple-500" />
          <h1 className="ml-2 text-2xl font-bold text-white">SkillConnect</h1>
        </div>

        <h2 className="text-xl font-semibold text-white text-center mb-6">
          Login to your account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
          <div>
            <label className="block text-gray-300 mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-400"
              placeholder="your@email.com"
              required
              autoComplete="off"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-400"
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-8 py-4 bg-gradient-to-r from-[#c77dff] to-[#f7b2d9] text-white rounded-lg text-lg font-semibold hover:opacity-90 transition disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <div className="text-center text-gray-400">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="hover:text-white transition"
            >
              ← Back to Home
            </button>
          </div>

          <div className="text-center text-gray-400 text-sm">
            Don’t have an account?{" "}
            <Link to="/register" className="text-purple-400 hover:text-purple-300">
              Register
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

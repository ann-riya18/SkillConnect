import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api";
export const BACKEND_URL = "http://localhost:8000";

export const getMediaUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${BACKEND_URL}${path}`;
};

// ==============================
// AXIOS INSTANCE
// ==============================
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// ==============================
// REQUEST INTERCEPTOR (JWT)
// ==============================
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ==============================
// RESPONSE INTERCEPTOR (REFRESH)
// ==============================
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");
        if (!refreshToken) {
          window.location.href = "/login";
          return Promise.reject(error);
        }

        const res = await axios.post(
          `${API_BASE_URL}/auth/refresh/`,
          { refresh: refreshToken }
        );

        const { access } = res.data;
        localStorage.setItem("access_token", access);

        api.defaults.headers.common["Authorization"] = `Bearer ${access}`;
        originalRequest.headers["Authorization"] = `Bearer ${access}`;

        return api(originalRequest);
      } catch (err) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

// ==============================
// AUTH APIs
// ==============================
export const authAPI = {
  // ✅ EXPECTS FormData (matches RegisterPage)
  register: (formData) =>
    api.post("/auth/register/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  login: (email, password) =>
    api.post("/auth/login/", { email, password }),
  refresh: (refresh) =>
    api.post("/auth/refresh/", { refresh }),

  getMe: () => api.get("/auth/me/"),

  logout: () => api.post("/auth/logout/"),

  updateProfile: (data) => {
    if (data instanceof FormData) {
      return api.put("/auth/profile/update/", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }
    return api.put("/auth/profile/update/", data);
  },
};

// ==============================
// COURSE APIs
// ==============================
export const courseAPI = {
  create: (courseData) => {
    const formData = new FormData();
    formData.append("title", courseData.title);
    formData.append("category", courseData.category);
    formData.append("description", courseData.description);
    formData.append("level", courseData.level);
    formData.append("price_type", courseData.price_type);
    formData.append("price", courseData.price || 0);
    formData.append("course_link", courseData.course_link);

    if (courseData.thumbnail) {
      formData.append("thumbnail", courseData.thumbnail);
    }

    return api.post("/courses/create/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  getMyList: () => api.get("/courses/my/"),
};

// ==============================
// SKILLS APIs
// ==============================
export const skillsAPI = {
  getPublicSkills: () => api.get("/skills/public/"),
  getAll: () => api.get("/skills/"),
  get: (id) => api.get(`/skills/${id}/`),
  create: (data) => {
    // Accept either FormData or a plain object
    if (data instanceof FormData) {
      return api.post("/skills/", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }

    const formData = new FormData();
    Object.keys(data || {}).forEach((key) => {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    });

    return api.post("/skills/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  update: (id, data) => api.put(`/skills/${id}/`, data),
  remove: (id) => api.delete(`/skills/${id}/`),
};

// ==============================
// ADMIN APIs
// ==============================
export const adminAPI = {
  getStats: () => api.get("/admin/stats/"),
  getActivity: () => api.get("/admin/activity/"),
  getPendingCourses: () => api.get("/admin/courses/pending/"),
  updateCourseStatus: (courseId, status) =>
    api.put(`/admin/courses/${courseId}/status/`, { status }),
  // Skills admin endpoints
  getPendingSkills: () => api.get("/admin/skills/pending/"),
  getAcceptedSkills: () => api.get("/admin/skills/accepted/"),
  updateSkillStatus: (skillId, status) =>
    api.put(`/admin/skills/${skillId}/status/`, { status }),
  // New Admin Features
  getAllUsers: () => api.get("/admin/users/"),
  getPopularSkills: () => api.get("/admin/skills/popular/"),
  getDeclinedSkills: () => api.get("/admin/skills/declined/"),
  getAllAdminCourses: () => api.get("/admin/skills/all/"),
  getFeedback: () => api.get("/admin/feedback/"),
  deleteUser: (id) => api.delete(`/admin/users/${id}/`),
};

export const feedbackAPI = {
  submitFeedback: (data) => api.post("/feedback/", data),
};

export const messageAPI = {
  getMessages: () => api.get("/messages/"),
  sendMessage: (recipient_id, text) => api.post("/messages/", { recipient_id, text }),
  getMessage: (id) => api.get(`/messages/${id}/`),
};

export const userAPI = {
  getPublicProfile: (username) => api.get(`/users/${username}/profile/`),
  getUserSkills: (username) => api.get(`/users/${username}/skills/`),
};

// Add Interaction methods to skillsAPI
skillsAPI.getSkill = (id) => api.get(`/skills/${id}/`);
skillsAPI.toggleLike = (id) => api.post(`/skills/${id}/like/`);
skillsAPI.getComments = (id) => api.get(`/skills/${id}/comments/`);
skillsAPI.addComment = (id, text) => api.post(`/skills/${id}/comments/add/`, { text });
skillsAPI.updateProgress = (id, progress) => api.post(`/skills/${id}/progress/`, { progress });
skillsAPI.downloadCertificate = (id) => api.get(`/skills/${id}/certificate/`, { responseType: 'blob' });

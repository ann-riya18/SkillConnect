import { Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import AdminDashboard from "./components/AdminDashboard";
import UserDashboard from "./components/UserDashboard";
import UploadSkills from "./components/UploadSkills";
import MySkills from "./components/MySkills";
import PendingRequests from "./components/PendingRequests";
import ApprovedCourses from "./components/ApprovedCourses";
import DeclinedCourses from "./components/DeclinedCourses";
import AllCourses from "./components/AllCourses";
import AllUsers from "./components/AllUsers";
import PopularCourses from "./components/PopularCourses";
import CourseDetails from "./components/CourseDetails";
import EditProfile from "./components/EditProfile";
import SearchCourses from "./components/SearchCourses";
import Messages from "./components/Messages";
import PublicProfile from "./components/PublicProfile";
import FeedbackManagement from "./components/FeedbackManagement";

function App() {
  return (
    <Routes>

      <Route path="/" element={<Home />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/pending" element={<PendingRequests />} />
      <Route path="/admin/accepted" element={<ApprovedCourses />} />
      <Route path="/admin/declined" element={<DeclinedCourses />} />
      <Route path="/admin/courses" element={<AllCourses />} />
      <Route path="/admin/users" element={<AllUsers />} />
      <Route path="/admin/popular" element={<PopularCourses />} />
      <Route path="/admin/feedback" element={<FeedbackManagement />} />
      <Route path="/user/dashboard" element={<UserDashboard />} />

      <Route path="/user/upload-skills" element={<UploadSkills />} />
      <Route path="/user/skills" element={<MySkills />} />
      <Route path="/user/skills" element={<MySkills />} />
      <Route path="/user/profile" element={<EditProfile />} />
      <Route path="/user/search" element={<SearchCourses />} />
      <Route path="/user/messages" element={<Messages />} />
      <Route path="/course/:id" element={<CourseDetails />} />
      <Route path="/profile/:username" element={<PublicProfile />} />
    </Routes>
  );
}

export default App;

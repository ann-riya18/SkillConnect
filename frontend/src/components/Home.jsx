import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { BookOpen, Users, Award, TrendingUp, Menu, X, ChevronRight, ArrowRight } from 'lucide-react';

import { skillsAPI, feedbackAPI, getMediaUrl } from '../services/api';

export default function SkillConnectHome() {
  const navigate = useNavigate();

  // Redirect logged-in users to their dashboards
  // Redirect logic removed to allow Home page access
  React.useEffect(() => {
    // Optional: You could check token validity here if needed
  }, []);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [publicSkills, setPublicSkills] = useState([]);
  const [loadingSkills, setLoadingSkills] = useState(true);
  const [skillsError, setSkillsError] = useState("");
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await skillsAPI.getPublicSkills();
        setPublicSkills(res.data || []);
      } catch (err) {
        console.error("Failed to fetch public skills", err);
        setSkillsError("Could not load courses at this time.");
      } finally {
        setLoadingSkills(false);
      }
    };
    fetchSkills();
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      alert("Please fill in all fields.");
      return;
    }
    try {
      await feedbackAPI.submitFeedback(formData);
      alert('Feedback sent successfully!');
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      if (err.response?.status === 401) {
        alert("Please login to send feedback.");
        return;
      }
      console.error("Failed to send feedback", err);
      alert("Failed to send feedback. Please try again.");
    }
  };

  const features = [
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Diverse Courses",
      description: "Access a wide range of courses uploaded by expert instructors from around the world"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Community Learning",
      description: "Join a vibrant community of learners and share knowledge with peers"
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Certifications",
      description: "Earn recognized certificates upon course completion to boost your career"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Track Progress",
      description: "Monitor your learning journey with detailed progress tracking and analytics"
    }
  ];

  if (showSplash) {
    return (
      <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center overflow-hidden">
        {/* Animated Background Orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-600/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-600/20 rounded-full blur-[120px] animate-pulse delay-1000"></div>

        <div className="relative flex flex-col items-center">
          <div className="mb-6 animate-bounce">
            <BookOpen className="w-20 h-20 text-purple-500 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
          </div>

          <div className="overflow-hidden">
            <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-gray-400 animate-in slide-in-from-bottom-full duration-1000 tracking-tighter">
              SkillConnect
            </h1>
          </div>

          <div className="mt-4 flex items-center gap-2 text-gray-400 font-medium tracking-[0.3em] uppercase text-xs animate-pulse">
            <span>Empowering</span>
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
            <span>Learning</span>
          </div>
        </div>

        {/* Loading bar */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-48 h-1 bg-gray-900 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 animate-[loading_2000ms_ease-in-out_infinite]"></div>
        </div>

        <style>
          {`
            @keyframes loading {
              0% { transform: translateX(-100%); width: 30%; }
              50% { transform: translateX(100%); width: 60%; }
              100% { transform: translateX(350%); width: 30%; }
            }
          `}
        </style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Navigation */}
      <nav className="bg-black/90 backdrop-blur-sm shadow-md fixed top-0 left-0 right-0 z-50 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <BookOpen className="w-8 h-8 text-purple-500" />
              <span className="ml-2 text-2xl font-bold text-white">
                SkillConnect
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <button onClick={() => scrollToSection('home')} className="text-gray-300 hover:text-purple-400 transition">
                Home
              </button>
              <button onClick={() => scrollToSection('courses')} className="text-gray-300 hover:text-purple-400 transition">
                Courses
              </button>
              <button onClick={() => scrollToSection('about')} className="text-gray-300 hover:text-purple-400 transition">
                About
              </button>
              <button onClick={() => scrollToSection('contact')} className="text-gray-300 hover:text-purple-400 transition">
                Contact
              </button>

              {/* Dynamic Auth Button */}
              {localStorage.getItem("access_token") && localStorage.getItem("access_token") !== "undefined" ? (
                <button
                  onClick={() => {
                    const role = (localStorage.getItem("role") || "").toLowerCase();
                    if (role === "admin") navigate("/admin/dashboard");
                    else navigate("/user/dashboard");
                  }}
                  className="px-4 py-2 text-purple-400 border border-purple-400 rounded-lg hover:bg-gray-800 transition"
                >
                  Dashboard
                </button>
              ) : (
                <button
                  onClick={() => navigate("/login")}
                  className="px-4 py-2 text-purple-400 border border-purple-400 rounded-lg hover:bg-gray-800 transition"
                >
                  Login
                </button>)}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-3">
              <button onClick={() => scrollToSection('home')} className="block w-full text-left text-gray-300 hover:text-purple-400">
                Home
              </button>
              <button onClick={() => scrollToSection('courses')} className="block w-full text-left text-gray-300 hover:text-purple-400">
                Courses
              </button>
              <button onClick={() => scrollToSection('about')} className="block w-full text-left text-gray-300 hover:text-purple-400">
                About
              </button>
              <button onClick={() => scrollToSection('contact')} className="block w-full text-left text-gray-300 hover:text-purple-400">
                Contact
              </button>

              {/* Login Button (Mobile - Direct to User Login) */}
              {/* Mobile Dynamic Auth Button */}
              {localStorage.getItem("access_token") && localStorage.getItem("access_token") !== "undefined" ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    const role = (localStorage.getItem("role") || "").toLowerCase();
                    if (role === "admin") navigate("/admin/dashboard");
                    else navigate("/user/dashboard");
                  }}
                  className="w-full px-4 py-2 text-purple-400 border border-purple-400 rounded-lg"
                >
                  Dashboard
                </button>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate("/login");
                  }}
                  className="w-full px-4 py-2 text-purple-400 border border-purple-400 rounded-lg"
                >
                  Login
                </button>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section
        id="home"
        className="min-h-screen flex items-center justify-center relative overflow-hidden"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/70"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
            Welcome to SkillConnect
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-10 max-w-3xl mx-auto">
            Discover and learn from world-class courses taught by passionate instructors from around the globe
          </p>
          <button
            onClick={() => navigate("/user/search")}
            className="px-10 py-4 bg-gradient-to-r from-[#c77dff] to-[#f7b2d9] text-white rounded-lg text-lg font-semibold hover:opacity-90 transition shadow-2xl inline-flex items-center"
          >
            Explore Courses
            <ChevronRight className="ml-2 w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Courses Section */}
      <section id="courses" className="min-h-screen py-20 bg-gradient-to-br from-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Featured Courses</h2>
            <p className="text-xl text-gray-300">Start learning with our most popular courses</p>
          </div>

          {loadingSkills ? (
            <div className="text-center text-gray-400">Loading courses...</div>
          ) : skillsError ? (
            <div className="text-center text-red-400">{skillsError}</div>
          ) : publicSkills.length === 0 ? (
            <div className="text-center text-gray-400">No courses available yet. Check back soon!</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {publicSkills.slice(0, 3).map((skill) => (
                <div key={skill.id} className="bg-gray-800 rounded-xl overflow-hidden hover:transform hover:scale-105 transition border border-gray-700">
                  <div className="h-48 bg-gradient-to-br from-[#c77dff] to-[#f7b2d9] flex items-center justify-center overflow-hidden bg-gray-700">
                    {skill.thumbnail ? (
                      <img src={getMediaUrl(skill.thumbnail)} alt={skill.title} className="w-full h-full object-cover" />
                    ) : (
                      <BookOpen className="w-16 h-16 text-white opacity-50" />
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-semibold text-white line-clamp-1">{skill.title}</h3>
                      <span className="text-xs text-gray-500 bg-gray-900 px-2 py-1 rounded">{skill.category}</span>
                    </div>
                    <p className="text-gray-400 mb-4 line-clamp-3 text-sm">{skill.description}</p>
                    <div
                      className="flex items-center gap-2 mb-4 cursor-pointer hover:text-purple-400 transition"
                      onClick={() => navigate(`/profile/${skill.username}`)}
                    >
                      <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-[10px] font-bold">
                        {skill.username ? skill.username[0].toUpperCase() : "U"}
                      </div>
                      <span className="text-xs text-gray-400">{skill.username}</span>
                    </div>
                    <div className="flex items-center justify-between mt-auto">
                      <button
                        onClick={() => navigate(`/course/${skill.id}`)}
                        className="px-4 py-2 bg-gradient-to-r from-[#c77dff] to-[#f7b2d9] text-white rounded-lg text-sm hover:opacity-90 transition"
                      >
                        View Course
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* About Section - Why SkillConnect */}
      <section id="about" className="min-h-screen py-20 bg-black border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Why SkillConnect?</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              We're revolutionizing online education by connecting passionate instructors with eager learners worldwide
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {features.map((feature, index) => (
              <div key={index} className="p-6 rounded-xl bg-gray-900 hover:bg-gray-800 hover:shadow-xl transition group border border-gray-700">
                <div className="w-16 h-16 bg-gradient-to-br from-[#c77dff] to-[#f7b2d9] rounded-lg flex items-center justify-center text-white mb-4 group-hover:scale-110 transition">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Stats Section */}
          <div className="py-16 bg-gradient-to-r from-[#c77dff] to-[#f7b2d9] rounded-3xl">
            <div className="grid md:grid-cols-3 gap-8 text-center text-white">
              <div>
                <div className="text-5xl font-bold mb-2">10,000+</div>
                <div className="text-xl opacity-90">Active Learners</div>
              </div>
              <div>
                <div className="text-5xl font-bold mb-2">500+</div>
                <div className="text-xl opacity-90">Quality Courses</div>
              </div>
              <div>
                <div className="text-5xl font-bold mb-2">50+</div>
                <div className="text-xl opacity-90">Expert Instructors</div>
              </div>
            </div>
          </div>

          {/* Mission Statement */}
          <div className="mt-16 text-center max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold text-white mb-6">Our Mission</h3>
            <p className="text-lg text-gray-300 leading-relaxed mb-4">
              At SkillConnect, we believe that education should be accessible to everyone, everywhere. Our platform empowers instructors to share their expertise and students to pursue their passions, creating a global community of lifelong learners.
            </p>
            <p className="text-lg text-gray-300 leading-relaxed">
              Whether you're looking to advance your career, explore a new hobby, or teach others what you know, SkillConnect is your gateway to unlimited learning opportunities.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="min-h-screen py-20 bg-gradient-to-br from-gray-900 to-black flex items-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Feedback</h2>
            <p className="text-xl text-gray-300">We'd love to hear your thoughts and suggestions</p>
          </div>

          <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-400"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-400"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Message</label>
                <textarea
                  name="message"
                  required
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={5}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-400"
                  placeholder="Your feedback or suggestion..."
                />
              </div>
              <button
                onClick={handleSubmit}
                className="w-full px-8 py-4 bg-gradient-to-r from-[#c77dff] to-[#f7b2d9] text-white rounded-lg text-lg font-semibold hover:opacity-90 transition"
              >
                Send Feedback
              </button>
            </div>
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="bg-black py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <BookOpen className="w-8 h-8 text-purple-500" />
                <span className="ml-2 text-xl font-bold text-white">SkillConnect</span>
              </div>
              <p className="text-gray-400">Empowering learners worldwide with quality education</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Platform</h4>
              <div className="space-y-2 text-gray-400">
                <p className="hover:text-white cursor-pointer">Browse Courses</p>
                <p className="hover:text-white cursor-pointer">Become Instructor</p>
                <p className="hover:text-white cursor-pointer">Pricing</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <div className="space-y-2 text-gray-400">
                <p className="hover:text-white cursor-pointer">About Us</p>
                <p className="hover:text-white cursor-pointer">Careers</p>
                <p className="hover:text-white cursor-pointer">Contact</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <div className="space-y-2 text-gray-400">
                <p className="hover:text-white cursor-pointer">Help Center</p>
                <p className="hover:text-white cursor-pointer">Terms of Service</p>
                <p className="hover:text-white cursor-pointer">Privacy Policy</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2026 SkillConnect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

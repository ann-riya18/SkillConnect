import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { skillsAPI } from "../services/api"; // Reuse skillsAPI.getPublicSkills or similar
import { Search, Filter, BookOpen, ArrowLeft, ChevronDown } from "lucide-react";

export default function SearchCourses() {
    const navigate = useNavigate();
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [selectedLevel, setSelectedLevel] = useState("All");

    // Predefined Categories based on valid choices
    const categories = [
        "All",
        "Video Editing",
        "Web Development",
        "Graphic Design",
        "Digital Marketing",
        "Data Science",
        "Programming",
        "Photography"
    ];

    useEffect(() => {
        fetchSkills();
    }, []);

    const fetchSkills = async () => {
        try {
            // Fetching ONLY public/approved skills
            const res = await skillsAPI.getPublicSkills();
            setSkills(res.data || []);
        } catch (err) {
            console.error("Failed to fetch skills", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredSkills = skills.filter((skill) => {
        const matchesSearch = skill.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === "All" || skill.category === selectedCategory;
        const matchesLevel = selectedLevel === "All" || skill.level === selectedLevel;
        return matchesSearch && matchesCategory && matchesLevel;
    });

    return (
        <div className="min-h-screen bg-black text-white p-6">
            <div className="max-w-7xl mx-auto">
                <button
                    onClick={() => navigate("/user/dashboard")}
                    className="flex items-center text-gray-400 hover:text-white mb-6 transition"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Dashboard
                </button>

                <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                    <div>
                        <h2 className="text-3xl font-bold mb-2">Search Courses</h2>
                        <p className="text-gray-400">Find the perfect course to upgrade your skills</p>
                    </div>
                </div>

                {/* Search & Filter Bar */}
                <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl mb-8 flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by course name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-purple-500 transition"
                        />
                    </div>

                    <div className="relative w-full md:w-64">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-10 py-3 text-white focus:outline-none focus:border-purple-500 appearance-none cursor-pointer"
                        >
                            <option value="All">All Categories</option>
                            {categories.filter(c => c !== "All").map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 pointer-events-none" />
                    </div>

                    <div className="relative w-full md:w-48">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                        <select
                            value={selectedLevel}
                            onChange={(e) => setSelectedLevel(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-10 py-3 text-white focus:outline-none focus:border-purple-500 appearance-none cursor-pointer"
                        >
                            <option value="All">All Levels</option>
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 pointer-events-none" />
                    </div>
                </div>

                {/* Results */}
                {loading ? (
                    <div className="text-center py-12 text-gray-500">Loading courses...</div>
                ) : filteredSkills.length === 0 ? (
                    <div className="text-center py-12 bg-gray-900 rounded-xl border border-gray-800">
                        <p className="text-gray-400 text-lg">No courses found matching your criteria.</p>
                        <button
                            onClick={() => { setSearchTerm(""); setSelectedCategory("All"); setSelectedLevel("All"); }}
                            className="mt-4 text-purple-400 hover:text-purple-300 underline"
                        >
                            Clear filters
                        </button>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredSkills.map((skill) => (
                            <div key={skill.id} className="bg-gray-900 rounded-xl overflow-hidden hover:border-purple-500/50 transition border border-gray-800 group">
                                <div className="h-48 bg-gray-800 overflow-hidden relative">
                                    {skill.thumbnail ? (
                                        <img src={skill.thumbnail} alt={skill.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-600">
                                            <BookOpen className="w-12 h-12" />
                                        </div>
                                    )}
                                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-xs text-white border border-gray-700">
                                        {skill.category}
                                    </div>
                                </div>

                                <div className="p-5">
                                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{skill.title}</h3>
                                    <p className="text-gray-400 text-sm line-clamp-2 mb-4 h-10">{skill.description}</p>

                                    <div
                                        className="flex items-center gap-2 mb-4 cursor-pointer hover:text-purple-400 transition"
                                        onClick={() => navigate(`/profile/${skill.username}`)}
                                    >
                                        <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-[10px] font-bold">
                                            {skill.username ? skill.username[0].toUpperCase() : "U"}
                                        </div>
                                        <span className="text-xs text-gray-400">{skill.username}</span>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-gray-500 uppercase tracking-wider">{skill.level}</span>
                                        </div>
                                        <button
                                            onClick={() => navigate(`/course/${skill.id}`)}
                                            className="px-4 py-2 bg-white text-black rounded-lg text-sm font-semibold hover:bg-gray-200 transition"
                                        >
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { userAPI } from "../services/api";
import { BookOpen, User, Calendar, MapPin, Mail, ChevronLeft } from "lucide-react";

export default function PublicProfile() {
    const { username } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                setLoading(true);
                const [profileRes, skillsRes] = await Promise.all([
                    userAPI.getPublicProfile(username),
                    userAPI.getUserSkills(username)
                ]);
                setProfile(profileRes.data);
                setSkills(skillsRes.data || []);
            } catch (err) {
                console.error(err);
                setError("Failed to load profile.");
            } finally {
                setLoading(false);
            }
        };
        fetchProfileData();
    }, [username]);

    if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading Profile...</div>;
    if (error || !profile) return <div className="min-h-screen bg-black text-white flex items-center justify-center">{error || "User not found"}</div>;

    return (
        <div className="min-h-screen bg-black text-white pb-20">
            {/* Header */}
            <div className="bg-gray-900 border-b border-gray-800 p-4 sticky top-0 z-50">
                <div className="max-w-6xl mx-auto flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-xl font-bold">Instructor Profile</h1>
                </div>
            </div>

            <div className="max-w-6xl mx-auto p-4 lg:p-8 space-y-8">
                {/* Profile Card */}
                <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 flex flex-col md:flex-row gap-8 items-center md:items-start anim-fade-in">
                    <div className="w-32 h-32 md:w-40 md:h-40 relative">
                        {profile.profile_pic ? (
                            <img src={`http://127.0.0.1:8000${profile.profile_pic}`} alt={profile.username} className="w-full h-full rounded-full object-cover border-4 border-purple-500/30" />
                        ) : (
                            <div className="w-full h-full rounded-full bg-purple-600 flex items-center justify-center text-5xl font-bold">
                                {profile.username[0].toUpperCase()}
                            </div>
                        )}
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-4">
                        <div>
                            <h2 className="text-3xl font-bold text-white">{profile.name || profile.username}</h2>
                            <p className="text-purple-400 font-medium">Instructor</p>
                        </div>

                        <p className="text-gray-300 max-w-2xl leading-relaxed">
                            {profile.bio || "This instructor hasn't added a bio yet."}
                        </p>

                        <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm text-gray-400">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>Joined {new Date(profile.date_joined).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <BookOpen className="w-4 h-4" />
                                <span>{skills.length} Courses Published</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Courses Section */}
                <div className="space-y-6">
                    <h3 className="text-2xl font-bold flex items-center gap-2">
                        <BookOpen className="w-6 h-6 text-purple-500" />
                        Courses by {profile.username}
                    </h3>

                    {skills.length === 0 ? (
                        <div className="bg-gray-900/50 rounded-xl p-12 border border-gray-800 text-center">
                            <p className="text-gray-500">No public courses uploaded yet.</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {skills.map((skill) => (
                                <div
                                    key={skill.id}
                                    className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-purple-500/50 transition-all group cursor-pointer"
                                    onClick={() => navigate(`/course/${skill.id}`)}
                                >
                                    <div className="h-40 bg-gray-800 relative overflow-hidden">
                                        {skill.thumbnail ? (
                                            <img src={skill.thumbnail} alt={skill.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <BookOpen className="w-10 h-10 text-gray-700" />
                                            </div>
                                        )}
                                        <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-xs text-purple-300">
                                            {skill.category}
                                        </div>
                                    </div>
                                    <div className="p-4 space-y-2">
                                        <h4 className="font-bold text-white group-hover:text-purple-400 transition truncate">{skill.title}</h4>
                                        <p className="text-sm text-gray-400 line-clamp-2 h-10">{skill.description}</p>
                                        <div className="flex items-center justify-between pt-2 border-t border-gray-800">
                                            <span></span>
                                            <button className="text-xs text-gray-400 hover:text-white transition">View Details</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

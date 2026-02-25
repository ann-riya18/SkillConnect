import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import { User, Mail, Camera, Save, ArrowLeft } from "lucide-react";

export default function EditProfile() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        bio: "",
        profile_pic: null,
    });
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        const fetchMe = async () => {
            try {
                const res = await authAPI.getMe();
                const { name, bio, profile_pic } = res.data;
                setFormData({ name: name || "", bio: bio || "", profile_pic: null });
                if (profile_pic) {
                    setPreview(`http://127.0.0.1:8000${profile_pic}`);
                }
            } catch (err) {
                console.error("Failed to load profile", err);
                alert("Failed to load profile data.");
                navigate("/user/dashboard");
            } finally {
                setLoading(false);
            }
        };
        fetchMe();
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData((prev) => ({ ...prev, profile_pic: file }));
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            // Use FormData to handle file upload
            const data = new FormData();
            data.append("name", formData.name);
            data.append("bio", formData.bio);
            if (formData.profile_pic) {
                data.append("profile_pic", formData.profile_pic);
            }

            await authAPI.updateProfile(data);
            alert("Profile updated successfully!");
            navigate("/user/dashboard");
        } catch (err) {
            console.error("Update error", err);
            alert("Failed to update profile.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-black text-white p-6">
            <div className="max-w-2xl mx-auto">
                <button
                    onClick={() => navigate("/user/dashboard")}
                    className="flex items-center text-gray-400 hover:text-white mb-6 transition"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Dashboard
                </button>

                <div className="bg-gray-900 border border-gray-800 rounded-xl p-8">
                    <h2 className="text-3xl font-bold mb-6">Edit Profile</h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Profile Picture */}
                        <div className="flex flex-col items-center mb-8">
                            <div className="relative w-32 h-32 mb-4">
                                {preview ? (
                                    <img src={preview} alt="Profile" className="w-full h-full rounded-full object-cover border-4 border-purple-500/30" />
                                ) : (
                                    <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center border-4 border-gray-700">
                                        <User className="w-16 h-16 text-gray-500" />
                                    </div>
                                )}
                                <label className="absolute bottom-0 right-0 bg-purple-600 p-2 rounded-full cursor-pointer hover:bg-purple-700 transition">
                                    <Camera className="w-5 h-5 text-white" />
                                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                </label>
                            </div>
                            <p className="text-gray-400 text-sm">Click the camera icon to change photo</p>
                        </div>

                        {/* Name */}
                        <div>
                            <label className="block text-gray-300 mb-2 font-medium">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-purple-500 transition"
                                    placeholder="Your Name"
                                    required
                                />
                            </div>
                        </div>

                        {/* Bio */}
                        <div>
                            <label className="block text-gray-300 mb-2 font-medium">Bio</label>
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-4 text-white focus:outline-none focus:border-purple-500 transition h-32 resize-none"
                                placeholder="Tell us about yourself..."
                            />
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 transition flex items-center justify-center disabled:opacity-50"
                        >
                            {saving ? (
                                "Saving..."
                            ) : (
                                <>
                                    <Save className="w-5 h-5 mr-2" />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

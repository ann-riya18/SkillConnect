import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { skillsAPI, getMediaUrl, authAPI, messageAPI } from "../services/api";
import {
    Heart,
    MessageCircle,
    ArrowLeft,
    Send,
    Download,
    Trophy,
    Play
} from "lucide-react";

export default function CourseDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [skill, setSkill] = useState(null);
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Like state
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);

    // Message state
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [messageText, setMessageText] = useState("");
    const [currentUser, setCurrentUser] = useState(null);

    // Video & Progress state
    const [videoId, setVideoId] = useState("");
    const [progress, setProgress] = useState(0);
    const [playerStarted, setPlayerStarted] = useState(false);
    const playerRef = useRef(null);
    const progressIntervalRef = useRef(null);
    const syncIntervalRef = useRef(null);

    const extractVideoId = (url) => {
        if (!url) return "";
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : "";
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const skillRes = await skillsAPI.getSkill(id);
                setSkill(skillRes.data);
                setLiked(skillRes.data.is_liked);
                setLikeCount(skillRes.data.total_likes);
                setProgress(skillRes.data.user_progress || 0);

                const vId = extractVideoId(skillRes.data.course_link);
                setVideoId(vId);

                const commentsRes = await skillsAPI.getComments(id);
                setComments(commentsRes.data || []);

                try {
                    const userRes = await authAPI.getMe();
                    setCurrentUser(userRes.data);
                } catch (e) {
                    // Not logged in
                }

            } catch (err) {
                console.error("Failed to load course details", err);
                setError("Failed to load course details.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();

        return () => {
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        };
    }, [id]);

    useEffect(() => {
        if (playerStarted && videoId && !window.YT) {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

            window.onYouTubeIframeAPIReady = () => {
                initPlayer();
            };
        } else if (playerStarted && videoId && window.YT) {
            initPlayer();
        }
    }, [playerStarted, videoId]);

    const initPlayer = () => {
        if (playerRef.current) return;

        playerRef.current = new window.YT.Player('youtube-player', {
            videoId: videoId,
            playerVars: {
                'autoplay': 1,
                'modestbranding': 1,
                'rel': 0
            },
            events: {
                'onReady': (event) => event.target.playVideo(),
                'onStateChange': onPlayerStateChange
            }
        });
    };

    const onPlayerStateChange = (event) => {
        if (event.data === window.YT.PlayerState.PLAYING) {
            startTrackingProgress();
        } else {
            stopTrackingProgress();
            syncProgress();
        }
    };

    const startTrackingProgress = () => {
        if (progressIntervalRef.current) return;
        progressIntervalRef.current = setInterval(() => {
            if (playerRef.current && playerRef.current.getDuration) {
                const currentTime = playerRef.current.getCurrentTime();
                const duration = playerRef.current.getDuration();
                if (duration > 0) {
                    const currentProgress = (currentTime / duration) * 100;
                    setProgress(prev => Math.max(prev, currentProgress));
                }
            }
        }, 5000); // Check local state every 5 seconds

        // Add a secondary interval for backend syncing (every 15 seconds)
        syncIntervalRef.current = setInterval(() => {
            syncProgress();
        }, 15000);
    };

    const stopTrackingProgress = () => {
        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
        }
        if (syncIntervalRef.current) {
            clearInterval(syncIntervalRef.current);
            syncIntervalRef.current = null;
        }
    };

    const syncProgress = async () => {
        try {
            await skillsAPI.updateProgress(id, progress);
        } catch (err) {
            console.error("Failed to sync progress", err);
        }
    };

    const handleDownloadCertificate = async () => {
        try {
            // First, sync the latest local progress to the backend
            await syncProgress();

            const res = await skillsAPI.downloadCertificate(id);
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Certificate_${skill.title.replace(/\s+/g, '_')}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            alert("Failed to download certificate. Make sure you've watched at least 75%.");
        }
    };

    const handleSendMessage = async () => {
        if (!messageText.trim()) return;
        try {
            const recipientId = skill.user;
            if (!recipientId) {
                alert("Could not identify instructor.");
                return;
            }
            await messageAPI.sendMessage(recipientId, messageText);
            alert("Message sent successfully!");
            setShowMessageModal(false);
            setMessageText("");
        } catch (err) {
            alert("Failed to send message.");
        }
    };

    const handleLike = async () => {
        try {
            const res = await skillsAPI.toggleLike(id);
            setLiked(res.data.liked);
            setLikeCount(res.data.total_likes);
        } catch (err) {
            if (err.response?.status === 401) {
                alert("Please login to like this course.");
                navigate("/login");
            }
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        try {
            const res = await skillsAPI.addComment(id, commentText);
            setComments([res.data, ...comments]);
            setCommentText("");
        } catch (err) {
            if (err.response?.status === 401) {
                alert("Please login to comment.");
                navigate("/login");
            } else {
                alert("Failed to post comment.");
            }
        }
    };

    if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center font-bold text-xl anim-pulse">Loading Course...</div>;
    if (error || !skill) return <div className="min-h-screen bg-black text-white flex items-center justify-center font-bold">{error || "Course not found"}</div>;

    return (
        <div className="min-h-screen bg-black text-white">
            <div className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800 p-4 sticky top-0 z-50">
                <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white transition p-2 hover:bg-gray-800 rounded-full">
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <h1 className="text-xl font-bold truncate">{skill.title}</h1>
                    </div>
                    {progress >= 75 && (
                        <button
                            onClick={handleDownloadCertificate}
                            className="bg-gradient-to-r from-yellow-500 to-orange-600 text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:scale-105 transition shadow-lg shadow-yellow-500/20 whitespace-nowrap text-sm"
                        >
                            <Trophy className="w-4 h-4" /> Download Certificate
                        </button>
                    )}
                </div>
            </div>

            <div className="max-w-6xl mx-auto p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="aspect-video bg-gray-900 rounded-xl overflow-hidden relative border border-gray-800 shadow-2xl group cursor-pointer">
                        {playerStarted && videoId ? (
                            <div id="youtube-player" className="w-full h-full animate-in fade-in duration-500"></div>
                        ) : videoId ? (
                            <div className="w-full h-full relative" onClick={() => setPlayerStarted(true)}>
                                <img
                                    src={getMediaUrl(skill.thumbnail)}
                                    alt={skill.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition duration-700 brightness-75 group-hover:brightness-50"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-20 h-20 bg-purple-600/90 rounded-full flex items-center justify-center shadow-2xl shadow-purple-500/50 transform group-hover:scale-110 transition duration-300">
                                        <Play className="w-10 h-10 text-white fill-current translate-x-1" />
                                    </div>
                                </div>
                                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold text-white border border-white/10 uppercase tracking-widest">
                                    Course Preview
                                </div>
                            </div>
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 bg-gray-900 italic gap-4">
                                <p>YouTube embed link not available.</p>
                                <a href={skill.course_link} target="_blank" rel="noreferrer" className="text-purple-400 underline not-italic">Watch on YouTube</a>
                            </div>
                        )}
                        <div className="absolute bottom-0 left-0 h-1.5 bg-gradient-to-r from-purple-600 to-indigo-500 transition-all duration-500 z-10" style={{ width: `${progress}%` }}></div>
                    </div>

                    <div className="flex items-start justify-between flex-wrap gap-4">
                        <div className="min-w-0">
                            <h1 className="text-3xl font-bold mb-2 break-words">{skill.title}</h1>
                            <div className="flex items-center gap-4 text-sm text-gray-400 font-medium">
                                <span className="bg-purple-900/20 text-purple-400 px-3 py-1 rounded-full border border-purple-800/50">{skill.category}</span>
                                <span>{new Date(skill.created_at).toLocaleDateString()}</span>
                                <div className="flex items-center gap-1.5 ml-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    <span>{Math.round(progress)}% Watched</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleLike}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-full transition font-bold ${liked ? 'bg-red-500/20 text-red-500 border border-red-500/50' : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'}`}
                            >
                                <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
                                <span className="font-bold">{likeCount}</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-5 bg-gray-900/50 rounded-2xl border border-gray-800/50">
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center text-2xl font-bold border-2 border-white/10 shadow-lg cursor-pointer transform hover:rotate-3 transition" onClick={() => navigate(`/profile/${skill.username}`)}>
                            {skill.username ? skill.username[0].toUpperCase() : "U"}
                        </div>
                        <div className="cursor-pointer" onClick={() => navigate(`/profile/${skill.username}`)}>
                            <p className="font-bold text-lg text-white">{skill.username || "Instructor"}</p>
                            <p className="text-sm text-gray-400">Content Creator</p>
                        </div>
                        <div className="ml-auto flex gap-2">
                            <button onClick={() => navigate(`/profile/${skill.username}`)} className="px-5 py-2 bg-gray-800 text-white text-sm rounded-xl hover:bg-gray-700 border border-gray-700 transition font-semibold">
                                Profile
                            </button>
                            {currentUser && currentUser.username !== skill.username && (
                                <button onClick={() => setShowMessageModal(true)} className="px-5 py-2 bg-purple-600 text-white text-sm rounded-xl hover:bg-purple-700 shadow-lg shadow-purple-500/20 transition flex items-center gap-2 font-bold">
                                    <MessageCircle className="w-4 h-4" /> Message
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800/50 shadow-sm">
                        <h3 className="text-xl font-bold mb-4 text-purple-400 flex items-center gap-2">
                            Overview
                        </h3>
                        <p className="text-gray-300 leading-relaxed whitespace-pre-wrap text-sm">{skill.description}</p>
                    </div>

                    <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800/50 shadow-sm flex flex-col h-[500px]">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-purple-400">
                            <MessageCircle className="w-5 h-5" />
                            {comments.length} Comments
                        </h3>
                        <form onSubmit={handleCommentSubmit} className="mb-8 relative">
                            <input
                                type="text"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Add a comment..."
                                className="w-full bg-gray-800 text-white rounded-xl pl-5 pr-14 py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-500/50 border border-gray-700 transition"
                            />
                            <button type="submit" disabled={!commentText.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 text-purple-400 hover:text-purple-300 disabled:opacity-30 transition bg-purple-500/10 rounded-lg">
                                <Send className="w-5 h-5" />
                            </button>
                        </form>
                        <div className="space-y-4 overflow-y-auto flex-1 pr-2 custom-scrollbar">
                            {comments.map((comment) => (
                                <div key={comment.id} className="flex gap-3 bg-gray-800/40 p-4 rounded-xl border border-gray-800/50 group hover:border-purple-500/30 transition">
                                    <div className="flex-shrink-0">
                                        {comment.profile_pic ? (
                                            <img src={getMediaUrl(comment.profile_pic)} alt="" className="w-9 h-9 rounded-full object-cover border-2 border-purple-500/20" />
                                        ) : (
                                            <div className="w-9 h-9 bg-gray-700 rounded-full flex items-center justify-center text-xs font-bold text-gray-300 border-2 border-gray-600">
                                                {comment.username ? comment.username[0].toUpperCase() : "?"}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-sm text-purple-300 truncate">{comment.display_name || comment.username}</span>
                                        </div>
                                        <p className="text-gray-300 text-sm break-words leading-relaxed">{comment.text}</p>
                                    </div>
                                </div>
                            ))}
                            {comments.length === 0 && (
                                <div className="text-center py-10 text-gray-600 italic">No comments yet. Be the first to start the conversation!</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {showMessageModal && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
                    <div className="bg-gray-900 border border-gray-800 rounded-3xl max-w-md w-full p-10 shadow-2xl relative">
                        <button onClick={() => setShowMessageModal(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white transition">
                            <Send className="w-6 h-6 rotate-45" />
                        </button>
                        <h3 className="text-2xl font-bold mb-2 text-white text-center">Contact Instructor</h3>
                        <p className="text-gray-400 text-center text-sm mb-8">Send a private message to {skill.username}</p>
                        <textarea
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            placeholder="How can I help you today?"
                            className="w-full bg-gray-800 text-white border border-gray-700 rounded-2xl p-5 min-h-[160px] focus:outline-none focus:ring-2 focus:ring-purple-500/50 mb-6 transition resize-none shadow-inner"
                        />
                        <div className="flex flex-col gap-3">
                            <button onClick={handleSendMessage} className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl hover:scale-[1.02] active:scale-100 transition font-bold shadow-xl shadow-purple-500/20 flex items-center justify-center gap-2">
                                <Send className="w-5 h-5" /> Send Message
                            </button>
                            <button onClick={() => setShowMessageModal(false)} className="w-full py-3 text-gray-500 hover:text-white font-medium transition">Maybe later</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

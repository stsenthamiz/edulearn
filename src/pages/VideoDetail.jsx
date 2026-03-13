import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactPlayer from 'react-player';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
    HeartIcon,
    ChatBubbleLeftIcon,
    ShareIcon,
    CheckBadgeIcon,
    ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

export default function VideoDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, authHeader } = useAuth();

    const [video, setVideo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLiked, setIsLiked] = useState(false);
    const [viewTracked, setViewTracked] = useState(false);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const playerRef = useRef(null);

    useEffect(() => {
        const fetchVideo = async () => {
            try {
                const res = await axios.get(`/api/student/video/${id}`);
                const v = res.data.data;
                setVideo(v);
                // Pre-load comments from the nested association
                if (v?.comments) {
                    setComments(v.comments.map(c => ({
                        id: c.id,
                        text: c.comment,
                        author: c.author?.name || 'Student',
                        date: new Date(c.created_at).toLocaleDateString()
                    })));
                }
            } catch (err) {
                console.error('Video not found:', err.message);
                setVideo(null);
            } finally {
                setIsLoading(false);
            }
        };
        fetchVideo();
    }, [id]);

    const handleProgress = async (state) => {
        if (!viewTracked && state.playedSeconds > 30) {
            setViewTracked(true);
            try {
                await axios.post(`/api/student/videos/${id}/view`, {}, { headers: authHeader() });
            } catch (error) {
                console.log('View track failed (non-critical):', error.message);
            }
        }
    };

    const handleLike = async () => {
        setIsLiked(!isLiked);
        try {
            await axios.post(`/api/student/videos/${id}/like`, {}, { headers: authHeader() });
        } catch (error) {
            console.log('Like failed:', error.message);
        }
    };

    const submitComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        const optimistic = { id: Date.now(), text: newComment, author: user?.name || 'Student', date: 'Just now' };
        setComments(prev => [...prev, optimistic]);
        setNewComment('');

        try {
            await axios.post(`/api/student/videos/${id}/comment`, { comment: newComment }, { headers: authHeader() });
        } catch (error) {
            console.log('Comment post failed:', error.message);
        }
    };

    if (isLoading) return (
        <div className="flex h-full items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500" />
        </div>
    );

    if (!video) return (
        <div className="flex flex-col h-full items-center justify-center gap-4 text-center py-20">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Video Not Found</h2>
            <p className="text-slate-500 dark:text-dark-muted">This video doesn't exist or may have been removed.</p>
            <button onClick={() => navigate(-1)} className="btn-primary px-6 py-2.5 rounded-xl">Go Back</button>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto pb-12">
            {/* Back Nav */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-slate-500 hover:text-primary-600 dark:text-dark-muted dark:hover:text-primary-400 font-medium mb-6 transition-colors"
            >
                <ArrowLeftIcon className="w-5 h-5" /> Back to Dashboard
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Player Area */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Video Player Frame */}
                    <div className="rounded-3xl overflow-hidden bg-black aspect-video shadow-xl border border-slate-200 dark:border-dark-border relative group">
                        {(video?.videoUrl || video?.cloudinary_url || video?.video_url) ? (
                            // Cloudinary / direct video URL — use native <video> player
                            <video
                                className="w-full h-full"
                                controls
                                autoPlay
                                onTimeUpdate={(e) => {
                                    if (!viewTracked && e.target.currentTime > 30) {
                                        setViewTracked(true);
                                        axios.post(`/api/student/videos/${id}/view`, {}, { headers: authHeader() }).catch(() => { });
                                    }
                                }}
                                controlsList="nodownload"
                            >
                                <source src={video.videoUrl || video.cloudinary_url || video.video_url} type="video/mp4" />
                            </video>
                        ) : (
                            // Legacy ReactPlayer fallback for old YouTube URLs
                            <ReactPlayer
                                ref={playerRef}
                                url={video?.url || video?.video_url || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'}
                                width="100%"
                                height="100%"
                                controls
                                playing
                                light={video?.thumbnail_url || true}
                                onProgress={handleProgress}
                                config={{ file: { attributes: { controlsList: 'nodownload' } } }}
                            />
                        )}
                    </div>

                    {/* Metadata & Actions */}
                    <div className="glass-card p-6 md:p-8">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-slate-200 dark:border-dark-border pb-6">
                            <div>
                                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2 leading-tight">
                                    {video?.title || "Educational Masterclass"}
                                </h1>
                                <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-dark-muted font-medium">
                                    <span className="flex items-center gap-1.5 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 px-3 py-1 rounded-full">
                                        {video?.views_count || video?.views || "12K"} Views
                                    </span>
                                    <span>•</span>
                                    <span>Published {video?.date || "2 days ago"}</span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-3 shrink-0">
                                <button
                                    onClick={handleLike}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${isLiked
                                        ? 'bg-red-50 text-red-600 dark:bg-red-900/20'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-dark-border dark:text-dark-muted dark:hover:bg-slate-700'
                                        }`}
                                >
                                    <motion.div whileTap={{ scale: 0.8 }} animate={{ scale: isLiked ? 1.2 : 1 }}>
                                        {isLiked ? <HeartSolid className="w-6 h-6" /> : <HeartIcon className="w-6 h-6" />}
                                    </motion.div>
                                    {isLiked ? 'Liked' : 'Like'}
                                </button>

                                <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-dark-border dark:text-dark-muted dark:hover:bg-slate-700 rounded-xl font-medium transition-colors">
                                    <ShareIcon className="w-5 h-5" /> Share
                                </button>
                            </div>
                        </div>

                        {/* Tutor Info */}
                        <div className="py-6 flex flex-col md:flex-row gap-6">
                            <div className="flex items-center gap-4 flex-1">
                                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-secondary-500 to-primary-500 p-0.5">
                                    <div className="w-full h-full rounded-full border-2 border-white dark:border-dark-card overflow-hidden bg-slate-200 flex items-center justify-center">
                                        <span className="font-bold text-slate-600 text-xl text-center block">
                                            {video?.tutor?.name?.charAt(0) || video?.tutor?.charAt(0) || 'T'}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-1.5">
                                        {video?.tutor?.name || video?.tutor || 'Pro Mentor'}
                                        <CheckBadgeIcon className="w-5 h-5 text-blue-500" />
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-dark-muted">Verified College Tutor</p>
                                </div>
                            </div>

                            <div className="text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg text-base">
                                {video?.description || 'In this comprehensive session, we cover all the necessary topics listed in the syllabus framework. Make sure to attempt the quiz!'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar (Comments & Quizzes) */}
                <div className="space-y-6">
                    {/* Quiz Prompt Card */}
                    <div className="glass-card p-6 bg-gradient-to-br from-primary-50 to-white dark:from-primary-900/10 dark:to-dark-card border-primary-200 dark:border-primary-900/30">
                        <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/50 text-primary-600 rounded-xl flex items-center justify-center mb-4">
                            <CheckBadgeIcon className="w-7 h-7" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Ready to test yourself?</h3>
                        <p className="text-slate-600 dark:text-dark-muted text-sm mb-6">
                            Attempt the subject quiz after watching to earn engagement score points and badges!
                        </p>
                        <button className="w-full btn-primary py-3">
                            Start Quiz
                        </button>
                    </div>

                    {/* Comments Section */}
                    <div className="glass-card p-6 flex flex-col h-[500px]">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <ChatBubbleLeftIcon className="w-6 h-6 text-secondary-500" />
                            Discussion Area
                        </h3>

                        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                            {comments.length === 0 ? (
                                <p className="text-center text-slate-500 dark:text-dark-muted my-auto text-sm">Be the first to ask a question!</p>
                            ) : (
                                comments.map((comment, i) => (
                                    <div key={i} className="bg-slate-50 dark:bg-dark-border p-4 rounded-2xl animate-fade-in">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-bold text-slate-900 dark:text-white text-sm">{comment.author}</span>
                                            <span className="text-xs text-slate-500 dark:text-dark-muted">{comment.date}</span>
                                        </div>
                                        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{comment.text}</p>
                                    </div>
                                ))
                            )}
                        </div>

                        <form onSubmit={submitComment} className="mt-4 pt-4 border-t border-slate-200 dark:border-dark-border relative">
                            <input
                                type="text"
                                className="w-full bg-slate-50 dark:bg-dark-border border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-4 pr-12 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary-500"
                                placeholder="Ask a doubt or share thoughts..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                            />
                            <button
                                type="submit"
                                disabled={!newComment.trim()}
                                className="absolute right-2 top-6 p-1.5 bg-secondary-500 text-white rounded-lg disabled:opacity-50 hover:bg-secondary-600 transition-colors"
                            >
                                <ArrowLeftIcon className="w-4 h-4 rotate-180" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

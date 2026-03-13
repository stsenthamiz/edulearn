import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { PlayCircleIcon, ClockIcon, UserGroupIcon, BookOpenIcon, MagnifyingGlassIcon, FireIcon, TagIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const listVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 10 },
    visible: { opacity: 1, scale: 1, y: 0 }
};

export default function StudentDashboard() {
    const { user, authHeader } = useAuth();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeSubject, setActiveSubject] = useState(null);
    const [subjects, setSubjects] = useState([]);
    const [videos, setVideos] = useState([]);
    const [progress, setProgress] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSearching, setIsSearching] = useState(false);
    const searchDebounce = useRef(null);

    // Fetch subjects on mount
    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const res = await axios.get('/api/student/subjects');
                setSubjects(res.data?.data || []);
            } catch (err) {
                console.error('Failed to load subjects:', err.message);
            }
        };
        fetchSubjects();
    }, []);

    // Fetch all videos on mount and when subject filter changes
    useEffect(() => {
        const fetchVideos = async () => {
            // If we're actively searching, don't override with a subject fetch
            if (searchTerm.trim()) return;
            setIsLoading(true);
            try {
                let res;
                if (activeSubject) {
                    res = await axios.get(`/api/student/videos/${activeSubject}`, { headers: authHeader() });
                } else {
                    res = await axios.get('/api/videos'); // new Cloudinary-backed endpoint
                }
                setVideos(res.data?.data || []);
            } catch (error) {
                console.error('Failed to load videos:', error.message);
                setVideos([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchVideos();
    }, [activeSubject]);

    // Live backend search with 400ms debounce
    useEffect(() => {
        if (searchDebounce.current) clearTimeout(searchDebounce.current);

        if (!searchTerm.trim()) {
            // Restore full list when search cleared
            if (!activeSubject) {
                setIsSearching(false);
                setIsLoading(true);
                axios.get('/api/videos')
                    .then(res => setVideos(res.data?.data || []))
                    .catch(() => setVideos([]))
                    .finally(() => setIsLoading(false));
            }
            return;
        }

        setIsSearching(true);
        setIsLoading(true);
        searchDebounce.current = setTimeout(async () => {
            try {
                const res = await axios.get(`/api/videos/search?q=${encodeURIComponent(searchTerm.trim())}`);
                setVideos(res.data?.data || []);
            } catch (err) {
                console.error('Search failed:', err.message);
                setVideos([]);
            } finally {
                setIsLoading(false);
            }
        }, 400);
    }, [searchTerm]);

    // Fetch student progress stats
    useEffect(() => {
        const fetchProgress = async () => {
            try {
                const res = await axios.get('/api/student/progress', { headers: authHeader() });
                setProgress(res.data?.data || []);
            } catch {
                // Non-critical
            }
        };
        fetchProgress();
    }, []);

    const completedVideos = progress.filter(p => p.completed).length;
    const avgScore = progress.length
        ? Math.round(progress.reduce((a, b) => a + (b.score || 0), 0) / progress.length)
        : 0;

    // Helper: resolve the video URL (using explicit videoUrl from API, fallback to direct properties)
    const getVideoUrl = (video) => video.videoUrl || video.cloudinary_url || video.video_url || null;
    // Helper: resolve display subject name
    const getSubjectName = (video) => video.subject_data?.name || video.subject || null;

    return (
        <div className="space-y-10 pb-12 w-full max-w-7xl mx-auto">
            {/* Header / Search */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-2">
                    <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-secondary-500">{user?.name?.split(' ')[0]}</span>!
                    </h1>
                    <p className="text-lg text-slate-500 dark:text-dark-muted font-medium">Ready to continue your learning journey?</p>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative w-full md:w-96 group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                    </div>
                    <input
                        type="text"
                        id="video-search"
                        className="block w-full pl-12 pr-4 py-3 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all shadow-sm"
                        placeholder="Search subjects, videos…"
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setActiveSubject(null); }}
                    />
                    {isSearching && searchTerm && (
                        <div className="absolute right-3 top-3.5">
                            <div className="w-5 h-5 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Stat Cards */}
            <motion.div variants={listVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div variants={itemVariants} className="glass-card p-6 border-l-4 border-l-primary-500 flex items-center justify-between">
                    <div>
                        <p className="text-slate-500 dark:text-dark-muted font-medium text-sm">Videos Watched</p>
                        <h3 className="text-3xl font-bold dark:text-white mt-1">{completedVideos}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
                        <PlayCircleIcon className="w-6 h-6 text-primary-500" />
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="glass-card p-6 border-l-4 border-l-secondary-500 flex items-center justify-between">
                    <div>
                        <p className="text-slate-500 dark:text-dark-muted font-medium text-sm">Avg Quiz Score</p>
                        <h3 className="text-3xl font-bold dark:text-white mt-1">{avgScore}%</h3>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-secondary-50 dark:bg-secondary-900/20 flex items-center justify-center">
                        <FireIcon className="w-6 h-6 text-secondary-500" />
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="glass-card p-6 border-l-4 border-l-accent-500 flex items-center justify-between">
                    <div>
                        <p className="text-slate-500 dark:text-dark-muted font-medium text-sm">Total Progress</p>
                        <h3 className="text-3xl font-bold dark:text-white mt-1">{progress.length} Videos</h3>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-accent-50 dark:bg-accent-900/20 flex items-center justify-center">
                        <ClockIcon className="w-6 h-6 text-accent-500" />
                    </div>
                </motion.div>
            </motion.div>

            {/* Certificate Banner */}
            {completedVideos > 0 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gradient-to-r from-primary-600 via-secondary-500 to-primary-800 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-glow-primary relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="relative z-10 w-full md:w-2/3">
                        <h2 className="text-2xl font-bold mb-2">Keep it up, {user?.name?.split(' ')[0]}!</h2>
                        <p className="text-primary-100 font-medium mb-4">You've completed {completedVideos} video{completedVideos !== 1 ? 's' : ''}. Keep watching to unlock your certificate.</p>
                        <div className="w-full bg-black/20 rounded-full h-3 mb-2">
                            <div className="bg-white h-3 rounded-full" style={{ width: `${Math.min(completedVideos * 10, 100)}%` }} />
                        </div>
                    </div>
                    <div className="relative z-10 shrink-0 flex flex-col items-center">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl backdrop-blur-md flex items-center justify-center mb-3 shadow-lg border border-white/30">
                            <BookOpenIcon className="w-8 h-8 text-white" />
                        </div>
                        <button
                            onClick={async () => {
                                try {
                                    const res = await axios.post('/api/student/certificate',
                                        { studentName: user?.name, subjectName: 'General' },
                                        { responseType: 'blob', headers: authHeader() }
                                    );
                                    const url = window.URL.createObjectURL(new Blob([res.data]));
                                    const link = document.createElement('a');
                                    link.href = url;
                                    link.setAttribute('download', `Certificate-${user?.name}.pdf`);
                                    document.body.appendChild(link);
                                    link.click();
                                } catch {
                                    alert('Complete more modules to unlock your certificate!');
                                }
                            }}
                            className="px-6 py-2.5 bg-white text-primary-700 font-bold rounded-xl hover:bg-primary-50 transition-colors shadow-md"
                        >
                            Claim Certificate
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Subjects Grid — hidden during search */}
            {!searchTerm && subjects.length > 0 && (
                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                            <BookOpenIcon className="w-7 h-7 text-primary-500" />
                            Explore Subjects
                        </h2>
                        {activeSubject && (
                            <button onClick={() => setActiveSubject(null)} className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-800 transition-colors">
                                View All
                            </button>
                        )}
                    </div>
                    <motion.div variants={listVariants} initial="hidden" animate="visible" className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {subjects.map((subject) => (
                            <motion.div
                                variants={itemVariants}
                                whileHover={{ y: -4, scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setActiveSubject(subject.id)}
                                key={subject.id}
                                className={`cursor-pointer p-6 rounded-2xl border transition-all duration-300 flex flex-col items-center text-center ${activeSubject === subject.id
                                    ? 'bg-gradient-to-b from-primary-500 to-primary-600 border-transparent shadow-glow-primary text-white'
                                    : 'glass-card hover:border-primary-300 dark:hover:border-primary-700'
                                    }`}
                            >
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors ${activeSubject === subject.id ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
                                    <BookOpenIcon className="w-7 h-7" />
                                </div>
                                <h3 className={`font-bold transition-colors ${activeSubject === subject.id ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                                    {subject.name}
                                </h3>
                                {subject.description && (
                                    <p className={`text-xs mt-1 line-clamp-2 ${activeSubject === subject.id ? 'text-white/80' : 'text-slate-500 dark:text-dark-muted'}`}>
                                        {subject.description}
                                    </p>
                                )}
                            </motion.div>
                        ))}
                    </motion.div>
                </section>
            )}

            {/* Video Library */}
            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <PlayCircleIcon className="w-7 h-7 text-secondary-500" />
                        {searchTerm ? `Search results for "${searchTerm}"` : activeSubject ? 'Subject Videos' : 'All Videos'}
                    </h2>
                    {searchTerm && (
                        <button onClick={() => setSearchTerm('')} className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-800 transition-colors">
                            Clear Search
                        </button>
                    )}
                </div>

                <AnimatePresence mode="popLayout">
                    {isLoading ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500" />
                        </motion.div>
                    ) : videos.length > 0 ? (
                        <motion.div variants={listVariants} initial="hidden" animate="visible" exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {videos.map(video => {
                                const videoUrl = getVideoUrl(video);
                                const subjectName = getSubjectName(video);
                                return (
                                    <motion.div
                                        variants={itemVariants}
                                        layout
                                        onClick={() => navigate(`/student/video/${video.id}`)}
                                        key={video.id}
                                        className="glass-card overflow-hidden group hover:shadow-lg transition-all duration-300 flex flex-col cursor-pointer"
                                    >
                                        {/* Video Thumbnail / Preview */}
                                        <div className="relative aspect-video overflow-hidden bg-slate-900">
                                            {videoUrl ? (
                                                <video
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                    muted
                                                    preload="metadata"
                                                    onMouseEnter={e => e.target.play()}
                                                    onMouseLeave={e => { e.target.pause(); e.target.currentTime = 0; }}
                                                >
                                                    <source src={videoUrl} type="video/mp4" />
                                                </video>
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                                                    <PlayCircleIcon className="w-16 h-16 text-slate-600" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <div className="bg-white/20 backdrop-blur-md rounded-full p-4 border border-white/30 transform scale-50 group-hover:scale-100 transition-all duration-500">
                                                    <PlayCircleIcon className="w-10 h-10 text-white" />
                                                </div>
                                            </div>
                                            {/* Subject badge on thumbnail */}
                                            {subjectName && (
                                                <div className="absolute top-3 left-3">
                                                    <span className="inline-flex items-center gap-1 bg-primary-600/90 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full">
                                                        <TagIcon className="w-3 h-3" />
                                                        {subjectName}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Card Body */}
                                        <div className="p-5 flex-1 flex flex-col">
                                            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-500 transition-colors">
                                                {video.title}
                                            </h3>
                                            {video.description && (
                                                <p className="text-sm text-slate-500 dark:text-dark-muted line-clamp-2 mb-3">
                                                    {video.description}
                                                </p>
                                            )}
                                            <div className="mt-auto pt-4 flex items-center justify-between text-sm text-slate-500 dark:text-dark-muted border-t border-slate-100 dark:border-dark-border">
                                                <span className="flex items-center gap-1.5">
                                                    <span className="w-6 h-6 rounded-full bg-gradient-to-tr from-primary-400 to-secondary-400 flex items-center justify-center text-xs text-white font-bold uppercase">
                                                        {video.tutor?.name?.charAt(0) || 'T'}
                                                    </span>
                                                    <span className="font-medium">{video.tutor?.name || 'Tutor'}</span>
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <UserGroupIcon className="w-4 h-4" /> {video.views_count || 0}
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    ) : (
                        <div className="text-center py-20 bg-white/50 dark:bg-dark-card/50 rounded-3xl border border-slate-200 dark:border-dark-border border-dashed">
                            <MagnifyingGlassIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                            <h3 className="text-xl font-bold dark:text-white text-slate-900">
                                {searchTerm ? 'No results found' : 'No videos yet'}
                            </h3>
                            <p className="text-slate-500 dark:text-dark-muted mt-2">
                                {searchTerm
                                    ? `No videos match "${searchTerm}". Try a different keyword.`
                                    : activeSubject ? 'No videos for this subject yet.' : 'Tutors are working on it — check back soon!'}
                            </p>
                            {searchTerm && (
                                <button onClick={() => setSearchTerm('')} className="mt-4 btn-primary px-6 py-2.5 rounded-xl text-sm">
                                    Clear Search
                                </button>
                            )}
                        </div>
                    )}
                </AnimatePresence>
            </section>
        </div>
    );
}

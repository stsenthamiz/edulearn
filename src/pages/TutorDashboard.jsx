import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { CloudArrowUpIcon, CalendarDaysIcon, ChartBarIcon, UsersIcon, VideoCameraIcon, ClockIcon, CheckCircleIcon, DocumentPlusIcon } from '@heroicons/react/24/outline';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement,
    LineElement, BarElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const listVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } };

export default function TutorDashboard() {
    const { user, authHeader } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [submitMsg, setSubmitMsg] = useState('');
    const [submitError, setSubmitError] = useState('');
    const fileInputRef = useRef(null);

    // Real data state
    const [analytics, setAnalytics] = useState({ totalVideos: 0, totalViews: 0, totalLikes: 0, totalEngagementScore: 0 });
    const [myVideos, setMyVideos] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [statsLoading, setStatsLoading] = useState(true);

    // Upload form state — no URL field anymore, actual file
    const [uploadForm, setUploadForm] = useState({
        title: '',
        description: '',
        subject_id: '',
        videoFile: null,
    });

    // Schedule form state
    const [scheduleForm, setScheduleForm] = useState({ title: '', scheduled_time: '', meeting_link: '', subject_id: '' });

    const fetchTutorData = async () => {
        setStatsLoading(true);
        try {
            const [analyticsRes, videosRes, subjectsRes] = await Promise.all([
                axios.get('/api/tutor/analytics', { headers: authHeader() }),
                axios.get('/api/tutor/videos', { headers: authHeader() }),
                axios.get('/api/student/subjects'),
            ]);
            setAnalytics(analyticsRes.data?.data || {});
            setMyVideos(videosRes.data?.data || []);
            setSubjects(subjectsRes.data?.data || []);
        } catch (err) {
            console.error('Failed to load tutor data:', err.message);
        } finally {
            setStatsLoading(false);
        }
    };

    useEffect(() => { fetchTutorData(); }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Client-side size validation (500 MB)
        if (file.size > 500 * 1024 * 1024) {
            setSubmitError(`File too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Max allowed: 500 MB.`);
            e.target.value = '';
            return;
        }

        const allowed = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-m4v'];
        if (!allowed.includes(file.type)) {
            setSubmitError('Invalid file type. Please upload an MP4, WebM, OGG, or MOV video.');
            e.target.value = '';
            return;
        }

        setSubmitError('');
        setUploadForm(f => ({ ...f, videoFile: file }));
    };

    const handleVideoUpload = async (e) => {
        e.preventDefault();
        setSubmitMsg('');
        setSubmitError('');

        if (!uploadForm.videoFile) {
            setSubmitError('Please choose a video file to upload.');
            return;
        }
        if (!uploadForm.title.trim()) {
            setSubmitError('Video title is required.');
            return;
        }

        setIsSubmitting(true);
        setUploadProgress(0);

        try {
            const formData = new FormData();
            formData.append('video', uploadForm.videoFile);
            formData.append('title', uploadForm.title.trim());
            formData.append('description', uploadForm.description.trim());
            formData.append('subjectId', uploadForm.subject_id || '');

            const selectedSubject = subjects.find(s => s.id === uploadForm.subject_id);
            formData.append('subject', selectedSubject?.name || '');

            await axios.post('/api/videos/upload', formData, {
                headers: {
                    ...authHeader(),
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(pct);
                },
            });

            setSubmitMsg('Video uploaded successfully to Cloudinary!');
            setUploadForm({ title: '', description: '', subject_id: '', videoFile: null });
            if (fileInputRef.current) fileInputRef.current.value = '';
            setUploadProgress(0);
            await fetchTutorData();
            setTimeout(() => { setActiveTab('overview'); setSubmitMsg(''); }, 1800);
        } catch (err) {
            setUploadProgress(0);
            setSubmitError(err?.response?.data?.message || 'Upload failed. Please check the file and try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleScheduleClass = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitMsg('');
        setSubmitError('');
        try {
            await axios.post('/api/tutor/live-class/schedule', scheduleForm, { headers: authHeader() });
            setSubmitMsg('Live class scheduled! Students will be notified.');
            setScheduleForm({ title: '', scheduled_time: '', meeting_link: '', subject_id: '' });
            setTimeout(() => { setActiveTab('overview'); setSubmitMsg(''); }, 1500);
        } catch (err) {
            setSubmitError(err?.response?.data?.message || 'Failed to schedule class. Check all fields.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const statCards = [
        { label: 'Total Views', value: analytics.totalViews?.toLocaleString() || 0, color: 'blue', Icon: ChartBarIcon },
        { label: 'Videos Published', value: analytics.totalVideos || 0, color: 'emerald', Icon: VideoCameraIcon },
        { label: 'Total Likes', value: analytics.totalLikes || 0, color: 'amber', Icon: UsersIcon },
        { label: 'Engagement Score', value: analytics.totalEngagementScore || 0, color: 'purple', Icon: CalendarDaysIcon },
    ];

    const colorMap = {
        blue: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', border: 'border-b-blue-500', blob: 'bg-blue-500/10' },
        emerald: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-b-emerald-500', blob: 'bg-emerald-500/10' },
        amber: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400', border: 'border-b-amber-500', blob: 'bg-amber-500/10' },
        purple: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400', border: 'border-b-purple-500', blob: 'bg-purple-500/10' },
    };

    return (
        <div className="space-y-8 pb-12 w-full max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white dark:bg-dark-card p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-dark-border shadow-sm">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        Tutor <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary-500 to-primary-500">Portal</span>
                    </h1>
                    <p className="text-slate-500 dark:text-dark-muted font-medium mt-2">Welcome, {user?.name}. Manage your content and impact SDG 4.</p>
                </div>
                <div className="flex bg-slate-100 dark:bg-dark-border p-1.5 rounded-xl shadow-inner w-full md:w-auto overflow-x-auto">
                    {[
                        { id: 'overview', name: 'Overview', icon: ChartBarIcon },
                        { id: 'upload', name: 'Upload Video', icon: CloudArrowUpIcon },
                        { id: 'schedule', name: 'Schedule Class', icon: CalendarDaysIcon }
                    ].map((tab) => (
                        <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSubmitMsg(''); setSubmitError(''); setUploadProgress(0); }}
                            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-white dark:bg-dark-card text-primary-600 dark:text-primary-400 shadow-sm'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}>
                            <tab.icon className="w-5 h-5 flex-shrink-0" />
                            {tab.name}
                        </button>
                    ))}
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                    {activeTab === 'overview' && (
                        <div className="space-y-8">
                            {/* Stat Cards */}
                            <motion.div variants={listVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {statCards.map(({ label, value, color, Icon }) => {
                                    const c = colorMap[color];
                                    return (
                                        <motion.div key={label} variants={itemVariants} className={`glass-card p-6 border-b-4 ${c.border} relative overflow-hidden group`}>
                                            <div className={`absolute -right-6 -top-6 w-24 h-24 ${c.blob} rounded-full group-hover:scale-150 transition-transform duration-500`} />
                                            <div className="flex items-center gap-4 relative z-10">
                                                <div className={`p-3.5 ${c.bg} ${c.text} rounded-2xl`}><Icon className="w-7 h-7" /></div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-500 dark:text-dark-muted">{label}</p>
                                                    <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                                                        {statsLoading ? <span className="animate-pulse">···</span> : value}
                                                    </h3>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </motion.div>

                            {/* Analytics Chart */}
                            <motion.div variants={itemVariants} className="glass-card p-6 md:p-8">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
                                    <ChartBarIcon className="w-6 h-6 text-primary-500" /> Engagement Overview
                                </h3>
                                <div className="h-72 w-full">
                                    <Line
                                        data={{
                                            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                                            datasets: [{
                                                label: 'Total Views',
                                                data: myVideos.length > 0
                                                    ? [analytics.totalViews, Math.round(analytics.totalViews * 0.8), Math.round(analytics.totalViews * 0.9), Math.round(analytics.totalViews * 0.7), Math.round(analytics.totalViews * 1.1), analytics.totalViews, Math.round(analytics.totalViews * 0.95)]
                                                    : [0, 0, 0, 0, 0, 0, 0],
                                                borderColor: '#4f46e5',
                                                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                                                tension: 0.4, fill: true, borderWidth: 2
                                            }]
                                        }}
                                        options={{
                                            responsive: true, maintainAspectRatio: false,
                                            plugins: { legend: { position: 'top', labels: { usePointStyle: true, boxWidth: 6 } } },
                                            scales: {
                                                y: { beginAtZero: true, grid: { color: 'rgba(148, 163, 184, 0.1)' }, border: { display: false } },
                                                x: { grid: { display: false }, border: { display: false } }
                                            }
                                        }}
                                    />
                                </div>
                            </motion.div>

                            {/* Recent Videos */}
                            <div className="glass-card p-6 md:p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <DocumentPlusIcon className="w-6 h-6 text-primary-500" /> My Uploaded Videos
                                    </h3>
                                    <button onClick={() => setActiveTab('upload')} className="btn-primary py-1.5 px-4 text-sm rounded-lg">Upload New</button>
                                </div>
                                {myVideos.length === 0 ? (
                                    <div className="text-center py-12 text-slate-500 dark:text-dark-muted">
                                        <VideoCameraIcon className="w-12 h-12 mx-auto mb-3 opacity-40" />
                                        <p className="font-medium">No videos uploaded yet.</p>
                                        <p className="text-sm mt-1">Click "Upload New" to publish your first lesson!</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {myVideos.slice(0, 5).map(v => (
                                            <div key={v.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-dark-border rounded-2xl transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700 group">
                                                <div className="w-full sm:w-32 h-20 bg-slate-200 dark:bg-slate-700 rounded-xl relative overflow-hidden shrink-0 flex items-center justify-center">
                                                    {v.cloudinary_url ? (
                                                        <video src={v.cloudinary_url} className="w-full h-full object-cover" muted preload="metadata" />
                                                    ) : (
                                                        <VideoCameraIcon className="w-8 h-8 text-slate-400" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors">{v.title}</h4>
                                                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-dark-muted mt-2 font-medium">
                                                        <span className="flex items-center gap-1"><ChartBarIcon className="w-4 h-4" /> {v.views_count || 0} views</span>
                                                        <span className="flex items-center gap-1"><ClockIcon className="w-4 h-4" /> {v.subject_data?.name || v.subject || 'General'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'upload' && (
                        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="max-w-3xl mx-auto glass-card p-8 md:p-10 shadow-lg border-t-4 border-t-primary-500">
                            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">Upload Video to Cloudinary</h2>
                            <p className="text-slate-500 dark:text-dark-muted mb-8 text-sm">Your video will be securely stored on Cloudinary and instantly available to students.</p>

                            {submitMsg && <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm flex items-center gap-2"><CheckCircleIcon className="w-5 h-5 flex-shrink-0" /> {submitMsg}</div>}
                            {submitError && <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{submitError}</div>}

                            <form onSubmit={handleVideoUpload} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Video Title *</label>
                                    <input required value={uploadForm.title} onChange={e => setUploadForm(f => ({ ...f, title: e.target.value }))}
                                        type="text" className="w-full bg-slate-50 dark:bg-dark-border border-0 ring-1 ring-slate-200 dark:ring-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500 p-3.5"
                                        placeholder="e.g. Introduction to Thermodynamics" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Description</label>
                                    <textarea rows={3} value={uploadForm.description} onChange={e => setUploadForm(f => ({ ...f, description: e.target.value }))}
                                        className="w-full bg-slate-50 dark:bg-dark-border border-0 ring-1 ring-slate-200 dark:ring-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500 p-3.5 resize-none"
                                        placeholder="Explain what students will learn..." />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Subject Category</label>
                                    <select value={uploadForm.subject_id} onChange={e => setUploadForm(f => ({ ...f, subject_id: e.target.value }))}
                                        className="w-full bg-slate-50 dark:bg-dark-border border-0 ring-1 ring-slate-200 dark:ring-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 p-3.5">
                                        <option value="">Select subject (optional)...</option>
                                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>

                                {/* File Upload Drop Zone */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                        Video File * <span className="font-normal text-slate-400">(MP4, WebM, MOV — max 500 MB)</span>
                                    </label>
                                    <div
                                        className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${uploadForm.videoFile
                                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10'
                                            : 'border-slate-300 dark:border-slate-600 hover:border-primary-400 dark:hover:border-primary-600'
                                            }`}
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="video/mp4,video/webm,video/ogg,video/quicktime,.mov,.mp4,.webm"
                                            className="hidden"
                                            onChange={handleFileChange}
                                        />
                                        {uploadForm.videoFile ? (
                                            <div className="space-y-2">
                                                <CheckCircleIcon className="w-10 h-10 text-primary-500 mx-auto" />
                                                <p className="font-bold text-primary-700 dark:text-primary-400">{uploadForm.videoFile.name}</p>
                                                <p className="text-sm text-slate-500">{(uploadForm.videoFile.size / (1024 * 1024)).toFixed(1)} MB — click to change</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <CloudArrowUpIcon className="w-12 h-12 text-slate-400 mx-auto" />
                                                <p className="font-semibold text-slate-600 dark:text-slate-400">Click to browse or drag & drop your video</p>
                                                <p className="text-xs text-slate-400">MP4, WebM, MOV formats supported</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Upload Progress Bar */}
                                {isSubmitting && uploadProgress > 0 && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm font-medium text-slate-600 dark:text-slate-400">
                                            <span>Uploading to Cloudinary…</span>
                                            <span>{uploadProgress}%</span>
                                        </div>
                                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                                            <div
                                                className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2.5 rounded-full transition-all duration-300"
                                                style={{ width: `${uploadProgress}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                <button disabled={isSubmitting} type="submit"
                                    className="w-full btn-primary py-4 rounded-xl text-lg flex items-center justify-center gap-2 mt-4 disabled:opacity-60">
                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CloudArrowUpIcon className="w-6 h-6" />}
                                    {isSubmitting
                                        ? (uploadProgress > 0 ? `Uploading… ${uploadProgress}%` : 'Processing…')
                                        : 'Upload & Publish Video'}
                                </button>
                            </form>
                        </motion.div>
                    )}

                    {activeTab === 'schedule' && (
                        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="max-w-3xl mx-auto glass-card p-8 md:p-10 shadow-lg border-t-4 border-t-secondary-500">
                            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-8">Schedule Live Session</h2>

                            {submitMsg && <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm flex items-center gap-2"><CheckCircleIcon className="w-5 h-5" /> {submitMsg}</div>}
                            {submitError && <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{submitError}</div>}

                            <form onSubmit={handleScheduleClass} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Session Topic *</label>
                                    <input required value={scheduleForm.title} onChange={e => setScheduleForm(f => ({ ...f, title: e.target.value }))}
                                        type="text" className="w-full bg-slate-50 dark:bg-dark-border border-0 ring-1 ring-slate-200 dark:ring-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-secondary-500 p-3.5"
                                        placeholder="e.g. Weekly Math Review" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Subject</label>
                                    <select value={scheduleForm.subject_id} onChange={e => setScheduleForm(f => ({ ...f, subject_id: e.target.value }))}
                                        className="w-full bg-slate-50 dark:bg-dark-border border-0 ring-1 ring-slate-200 dark:ring-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-secondary-500 p-3.5">
                                        <option value="">Select subject...</option>
                                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Date & Time *</label>
                                    <input required type="datetime-local" value={scheduleForm.scheduled_time} onChange={e => setScheduleForm(f => ({ ...f, scheduled_time: e.target.value }))}
                                        className="w-full bg-slate-50 dark:bg-dark-border border-0 ring-1 ring-slate-200 dark:ring-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-secondary-500 p-3.5" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Meeting Link (Zoom/Google Meet) *</label>
                                    <input required type="url" value={scheduleForm.meeting_link} onChange={e => setScheduleForm(f => ({ ...f, meeting_link: e.target.value }))}
                                        className="w-full bg-slate-50 dark:bg-dark-border border-0 ring-1 ring-slate-200 dark:ring-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-secondary-500 p-3.5"
                                        placeholder="https://zoom.us/j/..." />
                                </div>
                                <button disabled={isSubmitting} type="submit"
                                    className="w-full btn-secondary py-4 rounded-xl text-lg flex items-center justify-center gap-2 mt-4">
                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CalendarDaysIcon className="w-6 h-6" />}
                                    {isSubmitting ? 'Scheduling...' : 'Schedule & Notify Students'}
                                </button>
                            </form>
                        </motion.div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

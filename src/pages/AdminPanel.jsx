import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldExclamationIcon, UsersIcon, CheckBadgeIcon, XCircleIcon, FlagIcon, MagnifyingGlassIcon, BookOpenIcon, PlusIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const listVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } };

export default function AdminPanel() {
    const { authHeader } = useAuth();
    const [activeTab, setActiveTab] = useState('approvals');
    const [tutors, setTutors] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionMsg, setActionMsg] = useState('');
    const [search, setSearch] = useState('');

    const [subjects, setSubjects] = useState([]);
    const [isSubjectsLoading, setIsSubjectsLoading] = useState(false);
    const [subjectForm, setSubjectForm] = useState({ id: null, name: '', description: '' });
    const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);

    const fetchPendingTutors = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get('/api/admin/tutors/pending', { headers: authHeader() });
            setTutors(res.data?.data || []);
        } catch (err) {
            console.error('Failed to load pending tutors:', err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchSubjects = async () => {
        setIsSubjectsLoading(true);
        try {
            const res = await axios.get('/api/admin/subjects', { headers: authHeader() });
            setSubjects(res.data?.data || []);
        } catch (err) {
            console.error('Failed to load subjects:', err.message);
        } finally {
            setIsSubjectsLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingTutors();
        fetchSubjects();
    }, []);

    const handleApprove = async (id) => {
        if (!window.confirm('Are you sure you want to approve this tutor?')) return;
        try {
            await axios.put(`/api/admin/tutors/approve/${id}`, {}, { headers: authHeader() });
            setActionMsg('Tutor approved successfully!');
            setTutors(prev => prev.filter(t => t.id !== id));
        } catch (err) {
            setActionMsg('Failed to approve tutor. Please try again.');
        }
        setTimeout(() => setActionMsg(''), 3000);
    };

    const handleReject = async (id) => {
        if (!window.confirm('Are you sure you want to reject this application?')) return;
        // No reject endpoint yet — remove from UI; in production you'd call DELETE /api/admin/tutors/:id
        setTutors(prev => prev.filter(t => t.id !== id));
        setActionMsg('Application rejected and removed.');
        setTimeout(() => setActionMsg(''), 3000);
    };

    const handleSaveSubject = async (e) => {
        e.preventDefault();
        try {
            if (subjectForm.id) {
                await axios.put(`/api/admin/subjects/${subjectForm.id}`, subjectForm, { headers: authHeader() });
                setActionMsg('Subject updated successfully!');
            } else {
                await axios.post('/api/admin/subjects', subjectForm, { headers: authHeader() });
                setActionMsg('Subject created successfully!');
            }
            fetchSubjects();
            setIsSubjectModalOpen(false);
            setSubjectForm({ id: null, name: '', description: '' });
        } catch (err) {
            setActionMsg(err.response?.data?.message || 'Failed to save subject.');
        }
        setTimeout(() => setActionMsg(''), 3000);
    };

    const handleDeleteSubject = async (id) => {
        if (!window.confirm('Are you sure you want to delete this subject?')) return;
        try {
            await axios.delete(`/api/admin/subjects/${id}`, { headers: authHeader() });
            setActionMsg('Subject deleted successfully!');
            fetchSubjects();
        } catch (err) {
            setActionMsg('Failed to delete subject.');
        }
        setTimeout(() => setActionMsg(''), 3000);
    };

    const filteredTutors = tutors.filter(t =>
        t.name?.toLowerCase().includes(search.toLowerCase()) ||
        t.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8 pb-12 w-full max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white dark:bg-dark-card p-6 md:p-8 rounded-3xl border border-red-100 dark:border-red-900/30 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="relative z-10">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                        <ShieldExclamationIcon className="w-10 h-10 text-red-500" />
                        Platform <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">Command</span>
                    </h1>
                    <p className="text-slate-500 dark:text-dark-muted font-medium mt-2">Moderation, quality control, and user management.</p>
                </div>
                <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                    {/* Quick-access Add Subject button — always visible */}
                    <button
                        onClick={() => { setSubjectForm({ id: null, name: '', description: '' }); setIsSubjectModalOpen(true); }}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl hover:opacity-90 active:scale-95 transition-all font-bold shadow-md text-sm whitespace-nowrap"
                    >
                        <PlusIcon className="w-5 h-5" /> Add Subject
                    </button>
                    <div className="flex bg-slate-100 dark:bg-dark-border p-1.5 rounded-xl shadow-inner w-full sm:w-auto overflow-x-auto">
                        {[
                            { id: 'approvals', name: 'Tutor Approvals', icon: UsersIcon, count: tutors.length },
                            { id: 'subjects', name: 'Subjects', icon: BookOpenIcon, count: subjects.length },
                            { id: 'content', name: 'Content Moderation', icon: FlagIcon, count: 0 }
                        ].map((tab) => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${activeTab === tab.id
                                    ? 'bg-white dark:bg-dark-card text-red-600 dark:text-red-400 shadow-sm'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50'
                                    }`}>
                                <tab.icon className="w-5 h-5 flex-shrink-0" />
                                {tab.name}
                                {tab.count > 0 && (
                                    <span className={`ml-1 text-xs px-2 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' : 'bg-slate-200 text-slate-600 dark:bg-slate-700'}`}>
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>


            {/* Action feedback */}
            {actionMsg && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-5 py-3 text-sm font-medium flex items-center gap-2">
                    <CheckBadgeIcon className="w-5 h-5" /> {actionMsg}
                </div>
            )}

            <AnimatePresence mode="wait">
                <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="glass-card overflow-hidden">
                    {activeTab === 'approvals' && (
                        <div>
                            <div className="px-6 py-5 border-b border-slate-200 dark:border-dark-border bg-slate-50/50 dark:bg-dark-card/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <UsersIcon className="w-6 h-6 text-emerald-500" /> Pending Tutor Applications
                                </h2>
                                <div className="relative">
                                    <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input value={search} onChange={e => setSearch(e.target.value)}
                                        type="text" placeholder="Search by name or email..."
                                        className="pl-10 pr-4 py-2 border border-slate-200 dark:border-dark-border rounded-lg text-sm bg-white dark:bg-dark-border text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500" />
                                </div>
                            </div>

                            {isLoading ? (
                                <div className="flex justify-center py-16">
                                    <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
                                </div>
                            ) : (
                                <ul className="divide-y divide-slate-100 dark:divide-dark-border">
                                    {filteredTutors.map((app) => (
                                        <motion.li key={app.id} variants={itemVariants}
                                            className="p-6 hover:bg-slate-50/50 dark:hover:bg-dark-border/30 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-6 group">
                                            <div className="flex gap-4 items-center">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                                                    {app.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors">{app.name}</h3>
                                                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-dark-muted mt-1 font-medium">
                                                        <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">{app.email}</span>
                                                        <span>Applied {new Date(app.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
                                                <button onClick={() => handleApprove(app.id)}
                                                    className="flex flex-1 md:flex-none items-center justify-center gap-2 px-6 py-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors font-bold shadow-sm">
                                                    <CheckBadgeIcon className="w-5 h-5" /> Approve
                                                </button>
                                                <button onClick={() => handleReject(app.id)}
                                                    className="flex flex-1 md:flex-none items-center justify-center gap-2 px-6 py-2.5 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-xl hover:bg-red-100 transition-colors font-bold border border-red-200 dark:border-red-900/30">
                                                    <XCircleIcon className="w-5 h-5" /> Reject
                                                </button>
                                            </div>
                                        </motion.li>
                                    ))}
                                    {filteredTutors.length === 0 && (
                                        <div className="p-16 text-center">
                                            <CheckBadgeIcon className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">All Caught Up!</h3>
                                            <p className="text-slate-500 dark:text-dark-muted mt-2">No pending tutor applications right now.</p>
                                        </div>
                                    )}
                                </ul>
                            )}
                        </div>
                    )}

                    {activeTab === 'subjects' && (
                        <div>
                            <div className="px-6 py-5 border-b border-slate-200 dark:border-dark-border bg-slate-50/50 dark:bg-dark-card/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <BookOpenIcon className="w-6 h-6 text-primary-500" /> Subject Management
                                </h2>
                                <button onClick={() => { setSubjectForm({ id: null, name: '', description: '' }); setIsSubjectModalOpen(true); }}
                                    className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-bold shadow-sm whitespace-nowrap text-sm">
                                    <PlusIcon className="w-5 h-5" /> Add Subject
                                </button>
                            </div>

                            {isSubjectsLoading ? (
                                <div className="flex justify-center py-16">
                                    <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
                                </div>
                            ) : (
                                <ul className="divide-y divide-slate-100 dark:divide-dark-border">
                                    {subjects.map((sub) => (
                                        <motion.li key={sub.id} variants={itemVariants}
                                            className="p-6 hover:bg-slate-50/50 dark:hover:bg-dark-border/30 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-6 group">
                                            <div className="flex gap-4 items-center">
                                                <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 flex items-center justify-center font-bold text-lg shadow-sm">
                                                    <BookOpenIcon className="w-6 h-6" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors">{sub.name}</h3>
                                                    {sub.description && <p className="text-sm text-slate-500 dark:text-dark-muted mt-1 font-medium">{sub.description}</p>}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
                                                <button onClick={() => { setSubjectForm(sub); setIsSubjectModalOpen(true); }}
                                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 rounded-lg hover:bg-blue-100 transition-colors font-bold border border-blue-200 dark:border-blue-900/30">
                                                    <PencilIcon className="w-4 h-4" /> Edit
                                                </button>
                                                <button onClick={() => handleDeleteSubject(sub.id)}
                                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-lg hover:bg-red-100 transition-colors font-bold border border-red-200 dark:border-red-900/30">
                                                    <TrashIcon className="w-4 h-4" /> Delete
                                                </button>
                                            </div>
                                        </motion.li>
                                    ))}
                                    {subjects.length === 0 && (
                                        <div className="p-16 text-center">
                                            <BookOpenIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">No Subjects Found</h3>
                                            <p className="text-slate-500 dark:text-dark-muted mt-2">Click "Add Subject" to create one.</p>
                                        </div>
                                    )}
                                </ul>
                            )}
                        </div>
                    )}

                    {activeTab === 'content' && (
                        <div className="p-16 text-center">
                            <FlagIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Content Moderation</h3>
                            <p className="text-slate-500 dark:text-dark-muted mt-2 max-w-md mx-auto">
                                The reporting system is coming soon. Users will be able to flag videos and comments for review.
                            </p>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {isSubjectModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/50 backdrop-blur-sm">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-dark-card w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-dark-border">
                        <div className="p-6 border-b border-slate-100 dark:border-dark-border flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{subjectForm.id ? 'Edit Subject' : 'Add New Subject'}</h3>
                            <button onClick={() => setIsSubjectModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                <XCircleIcon className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSaveSubject} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Subject Name *</label>
                                <input required type="text" value={subjectForm.name} onChange={e => setSubjectForm(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full bg-slate-50 dark:bg-dark-border border-0 ring-1 ring-slate-200 dark:ring-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500 p-3.5"
                                    placeholder="e.g. Mathematics" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Description</label>
                                <textarea rows={3} value={subjectForm.description} onChange={e => setSubjectForm(prev => ({ ...prev, description: e.target.value }))}
                                    className="w-full bg-slate-50 dark:bg-dark-border border-0 ring-1 ring-slate-200 dark:ring-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500 p-3.5"
                                    placeholder="Brief description of the subject..." />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setIsSubjectModalOpen(false)} className="flex-1 py-3 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                                <button type="submit" className="flex-1 py-3 rounded-xl font-bold text-white bg-primary-500 hover:bg-primary-600 transition-colors">Save Subject</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

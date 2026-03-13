import React from 'react';
import { motion } from 'framer-motion';
import { BookOpenIcon, VideoCameraIcon, AcademicCapIcon, MapIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-dark-bg transition-colors duration-300">
            {/* Minimal Navbar just for landing */}
            <nav className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto">
                <div className="flex items-center gap-2">
                    <BookOpenIcon className="h-8 w-8 text-primary-600" />
                    <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-500">
                        EduLearn
                    </span>
                </div>
                <button
                    onClick={() => navigate('/login')}
                    className="btn-outline"
                >
                    Sign In
                </button>
            </nav>

            {/* Hero Section */}
            <main>
                <div className="relative overflow-hidden pt-16 pb-32">
                    {/* Decorative Gradients */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl px-4 pointer-events-none">
                        <div className="absolute -top-40 right-0 w-96 h-96 bg-primary-400/20 dark:bg-primary-900/30 rounded-full blur-3xl" />
                        <div className="absolute top-20 -left-20 w-72 h-72 bg-secondary-400/20 dark:bg-secondary-900/30 rounded-full blur-3xl" />
                    </div>

                    <div className="relative max-w-7xl mx-auto px-8 text-center text-slate-900 dark:text-white">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="text-5xl md:text-7xl font-extrabold tracking-tight"
                        >
                            Quality Education, <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-secondary-500">
                                Powered by Community
                            </span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="mt-6 text-xl text-slate-600 dark:text-dark-muted max-w-3xl mx-auto leading-relaxed"
                        >
                            Bridging the gap between passionate college mentors and ambitious school students.
                            Interactive video modules, live classes, and gamified learning for the UN SDG 4 mission.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
                        >
                            <button onClick={() => navigate('/login')} className="btn-primary text-lg px-8 py-3">
                                Start Learning Free
                            </button>
                            <button onClick={() => navigate('/login')} className="btn-secondary text-lg px-8 py-3">
                                Become a Tutor
                            </button>
                        </motion.div>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="max-w-7xl mx-auto px-8 py-24">
                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<VideoCameraIcon className="w-10 h-10 text-primary-500" />}
                            title="HD Video Learning"
                            description="Access thousands of meticulously curated educational videos mapped strictly to core syllabus requirements."
                        />
                        <FeatureCard
                            icon={<AcademicCapIcon className="w-10 h-10 text-secondary-500" />}
                            title="Live Masterclasses"
                            description="Join scheduled live workshops hosted by top-tier college students for real-time doubt resolution."
                        />
                        <FeatureCard
                            icon={<MapIcon className="w-10 h-10 text-accent-500" />}
                            title="Gamified Progress"
                            description="Earn distinct badges, compete on the Leaderboard, and secure verifiable completion certificates."
                        />
                    </div>
                </div>

                {/* SDG 4 Section */}
                <div className="bg-white dark:bg-dark-card py-24">
                    <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center gap-16">
                        <div className="md:w-1/2">
                            <motion.h2
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="text-4xl font-bold dark:text-white mb-6"
                            >
                                Aligned with <span className="text-primary-600">UN SDG 4</span>
                            </motion.h2>
                            <p className="text-lg text-slate-600 dark:text-dark-muted leading-relaxed mb-6">
                                "Ensure inclusive and equitable quality education and promote lifelong learning opportunities for all."
                            </p>
                            <p className="text-lg text-slate-600 dark:text-dark-muted leading-relaxed">
                                EduLearn directly addresses this by democratizing access to high-quality tutoring, leveraging the untapped potential of college students to lift up the next generation.
                            </p>
                        </div>
                        <div className="md:w-1/2 grid grid-cols-2 gap-4">
                            <div className="bg-primary-50 dark:bg-primary-900/20 p-6 rounded-2xl text-center">
                                <h4 className="text-4xl font-extrabold text-primary-600 dark:text-primary-400 mb-2">10k+</h4>
                                <p className="text-sm font-semibold text-slate-600 dark:text-dark-muted">Active Students</p>
                            </div>
                            <div className="bg-secondary-50 dark:bg-secondary-900/20 p-6 rounded-2xl text-center transform translate-y-8">
                                <h4 className="text-4xl font-extrabold text-secondary-600 dark:text-secondary-400 mb-2">500+</h4>
                                <p className="text-sm font-semibold text-slate-600 dark:text-dark-muted">College Mentors</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Leaderboard Preview */}
                <div className="max-w-7xl mx-auto px-8 py-24 text-center">
                    <h2 className="text-4xl font-bold dark:text-white mb-12">Top Mentors of the Week</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <motion.div
                                key={i}
                                whileHover={{ scale: 1.02 }}
                                className="glass-card p-6 flex flex-col items-center"
                            >
                                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-primary-400 to-secondary-500 flex items-center justify-center text-white text-2xl font-bold mb-4">
                                    #{i}
                                </div>
                                <h4 className="text-xl font-bold dark:text-white mb-1">Tutor Array {i}</h4>
                                <p className="text-primary-600 dark:text-primary-400 font-semibold">{9500 - (i * 500)} Points</p>
                                <div className="mt-4 flex gap-2">
                                    <span className="text-xs px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full font-medium">Gold Badge</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

const FeatureCard = ({ icon, title, description }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="glass-card p-8 text-left transition-all duration-300"
    >
        <div className="bg-slate-100 dark:bg-slate-800 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
            {icon}
        </div>
        <h3 className="text-xl font-bold mb-3 dark:text-white">{title}</h3>
        <p className="text-slate-600 dark:text-dark-muted leading-relaxed">{description}</p>
    </motion.div>
);

export default LandingPage;

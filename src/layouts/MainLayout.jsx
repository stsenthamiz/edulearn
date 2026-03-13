import React, { useState } from 'react';
import { Outlet, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
    HomeIcon,
    VideoCameraIcon,
    ChartBarIcon,
    ArrowRightOnRectangleIcon,
    SunIcon,
    MoonIcon,
    Bars3Icon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

const MainLayout = ({ allowedRoles }) => {
    const { user, logout } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Fallback for unauthenticated access or wrong role
    if (!user) return <Navigate to="/login" replace />;
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to={`/${user.role.toLowerCase()}`} replace />;
    }

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const menuItems = {
        STUDENT: [
            { name: 'Dashboard', icon: HomeIcon, path: '/student' },
        ],
        TUTOR: [
            { name: 'Dashboard', icon: HomeIcon, path: '/tutor' },
        ],
        ADMIN: [
            { name: 'Dashboard', icon: HomeIcon, path: '/admin' }
        ]
    };

    const navLinks = menuItems[user?.role] || [];

    return (
        <div className="flex flex-col md:flex-row h-screen bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-dark-text overflow-hidden transition-colors duration-300">

            {/* Mobile Header (Visible only on small screens) */}
            <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-dark-card border-b border-slate-200 dark:border-dark-border z-20">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-tr from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center text-white font-bold shadow-glow-primary">
                        E
                    </div>
                    <span className="font-bold text-lg">EduLearn</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
                    <Bars3Icon className="w-6 h-6" />
                </button>
            </div>

            {/* Sidebar */}
            <aside className={`
          absolute md:relative z-20 flex flex-col w-64 h-full
          bg-white/80 dark:bg-dark-card/80 backdrop-blur-xl md:backdrop-blur-none
          border-r border-slate-200 dark:border-dark-border
          transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
                <div className="hidden md:flex items-center gap-3 p-6 border-b border-slate-200 dark:border-dark-border h-20 shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-tr from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-glow-primary">
                        E
                    </div>
                    <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-500">EduLearn</span>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {navLinks.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <motion.button
                                key={item.name}
                                whileHover={{ scale: 1.02, x: 5 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                    navigate(item.path);
                                    setIsMobileMenuOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                        ? 'bg-primary-500 text-white shadow-md'
                                        : 'hover:bg-slate-100 dark:hover:bg-dark-border text-slate-600 dark:text-dark-muted'
                                    }`}
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="font-medium">{item.name}</span>
                            </motion.button>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-slate-200 dark:border-dark-border mt-auto">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors font-medium"
                    >
                        <ArrowRightOnRectangleIcon className="w-5 h-5" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative w-full">

                {/* Top Navbar */}
                <header className="hidden md:flex h-20 bg-white/50 dark:bg-dark-card/50 backdrop-blur-md mx-4 mt-4 border border-slate-200 dark:border-dark-border rounded-2xl px-6 items-center justify-between z-10 shrink-0 shadow-sm transition-colors duration-300">
                    <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-bold tracking-tight capitalize">
                            {user?.role} Dashboard
                        </h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleTheme}
                            className="p-2.5 rounded-full bg-slate-100 dark:bg-dark-border text-slate-600 dark:text-yellow-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                            <AnimatePresence mode="wait" initial={false}>
                                <motion.div
                                    key={isDarkMode ? 'dark' : 'light'}
                                    initial={{ y: -20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: 20, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {isDarkMode ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
                                </motion.div>
                            </AnimatePresence>
                        </button>

                        <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-dark-border">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-secondary-400 to-primary-500 shadow-md p-0.5">
                                <div className="w-full h-full rounded-full border-2 border-white dark:border-dark-card overflow-hidden bg-slate-200 flex items-center justify-center">
                                    <span className="font-bold text-slate-600 text-sm">
                                        {user?.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <p className="font-semibold text-sm leading-tight">{user?.name}</p>
                                <p className="text-xs text-slate-500 dark:text-dark-muted capitalize flex items-center gap-1">
                                    {user?.role}
                                    {user?.role === 'TUTOR' && <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>}
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dynamic Outlet Space */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8 bg-slate-50 dark:bg-dark-bg transition-colors duration-300">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;

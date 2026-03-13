import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BookOpen, GraduationCap, Video, ShieldCheck, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function Login() {
    const { login, signup } = useAuth();
    const navigate = useNavigate();

    const [mode, setMode] = useState('login'); // 'login' | 'signup'
    const [role, setRole] = useState('STUDENT');
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setIsLoading(true);
        try {
            if (mode === 'login') {
                const user = await login(form.email, form.password);
                if (user.role === 'STUDENT') navigate('/student');
                else if (user.role === 'TUTOR') navigate('/tutor');
                else navigate('/admin');
            } else {
                const result = await signup(form.name, form.email, form.password, role);
                if (result.pendingApproval) {
                    setSuccessMsg(result.message || 'Account created! Waiting for admin approval.');
                } else {
                    if (result.user.role === 'STUDENT') navigate('/student');
                    else if (result.user.role === 'TUTOR') navigate('/tutor');
                    else navigate('/admin');
                }
            }
        } catch (err) {
            const msg = err?.response?.data?.message || 'Something went wrong. Please try again.';
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const roles = [
        { id: 'STUDENT', label: 'Student', Icon: GraduationCap },
        { id: 'TUTOR', label: 'Tutor', Icon: Video },
        { id: 'ADMIN', label: 'Admin', Icon: ShieldCheck },
    ];

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 px-4">
            <div className="max-w-md w-full p-8 bg-white rounded-3xl shadow-2xl border border-slate-100 space-y-7">
                {/* Logo */}
                <div className="text-center">
                    <div className="flex justify-center items-center gap-2 mb-2">
                        <BookOpen className="w-9 h-9 text-blue-600" />
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">EduLearn</h1>
                    </div>
                    <p className="text-slate-500 text-sm">Quality Education for All · UN SDG 4</p>
                </div>

                {/* Mode Tabs */}
                <div className="flex bg-slate-100 p-1 rounded-xl">
                    {['login', 'signup'].map(m => (
                        <button
                            key={m}
                            type="button"
                            onClick={() => { setMode(m); setError(''); setSuccessMsg(''); }}
                            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all capitalize ${mode === m ? 'bg-white shadow text-blue-700' : 'text-slate-500 hover:text-slate-800'
                                }`}
                        >
                            {m === 'login' ? 'Sign In' : 'Create Account'}
                        </button>
                    ))}
                </div>

                {/* Alerts */}
                {error && (
                    <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                        <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}
                {successMsg && (
                    <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm">
                        <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" />
                        <span>{successMsg}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {mode === 'signup' && (
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-700">Full Name</label>
                            <input
                                required
                                name="name"
                                type="text"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Your full name"
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-700">Email Address</label>
                        <input
                            required
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-700">Password</label>
                        <input
                            required
                            name="password"
                            type="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Min. 8 characters"
                            minLength={8}
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                        />
                    </div>

                    {mode === 'signup' && (
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-700">I am a...</label>
                            <div className="grid grid-cols-3 gap-3">
                                {roles.map(({ id, label, Icon }) => (
                                    <button
                                        key={id}
                                        type="button"
                                        onClick={() => setRole(id)}
                                        className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1.5 text-sm transition-all ${role === id
                                                ? 'border-blue-600 bg-blue-50 text-blue-700'
                                                : 'border-slate-200 hover:border-blue-300 text-slate-600'
                                            }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span className="font-semibold">{label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-colors focus:ring-4 focus:ring-blue-100 disabled:opacity-60"
                    >
                        {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                        {mode === 'login' ? 'Sign In' : 'Create Account'}
                    </button>
                </form>

                <p className="text-center text-xs text-slate-400">
                    {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                    <button
                        onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setSuccessMsg(''); }}
                        className="text-blue-600 font-semibold hover:underline"
                    >
                        {mode === 'login' ? 'Sign Up' : 'Sign In'}
                    </button>
                </p>
            </div>
        </div>
    );
}

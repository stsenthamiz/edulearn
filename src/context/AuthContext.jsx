import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // On mount: restore session from stored JWT
    useEffect(() => {
        let cancelled = false;
        const restoreSession = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                if (!cancelled) setLoading(false);
                return;
            }
            try {
                const res = await axios.get('/api/auth/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!cancelled) setUser(res.data.user);
            } catch (err) {
                // Token invalid / expired — clear it
                localStorage.removeItem('token');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        restoreSession();
        return () => { cancelled = true; };
    }, []);

    const login = useCallback(async (email, password) => {
        setError(null);
        const res = await axios.post('/api/auth/login', { email, password });
        const { token, user: userData } = res.data;
        localStorage.setItem('token', token);
        setUser(userData);
        return userData;
    }, []);

    const signup = useCallback(async (name, email, password, role) => {
        setError(null);
        const res = await axios.post('/api/auth/signup', { name, email, password, role });
        // Tutors need approval first — no token returned
        if (res.data.token) {
            localStorage.setItem('token', res.data.token);
            setUser(res.data.user);
            return { user: res.data.user, pendingApproval: false };
        }
        return { user: null, pendingApproval: true, message: res.data.message };
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        localStorage.removeItem('token');
    }, []);

    // Helper: get auth header for protected requests
    const authHeader = () => {
        const token = localStorage.getItem('token');
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    // Always render children; show a full-screen spinner only during initial session restore
    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f8fafc' }}>
                <div style={{ width: 48, height: 48, border: '4px solid #e2e8f0', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, loading, error, setError, authHeader }}>
            {children}
        </AuthContext.Provider>
    );
};

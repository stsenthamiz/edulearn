import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import VideoDetail from './pages/VideoDetail';
import TutorDashboard from './pages/TutorDashboard';
import AdminPanel from './pages/AdminPanel';
import MainLayout from './layouts/MainLayout';

function PrivateRoutes() {
  const { user } = useAuth();

  if (!user) return <Navigate to="/" replace />;

  if (user.role === 'STUDENT') return <Navigate to="/student" replace />;
  if (user.role === 'TUTOR') return <Navigate to="/tutor" replace />;
  if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;

  return null;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />

            <Route element={<MainLayout allowedRoles={['STUDENT']} />}>
              <Route path="/student" element={<StudentDashboard />} />
              <Route path="/student/video/:id" element={<VideoDetail />} />
            </Route>

            <Route element={<MainLayout allowedRoles={['TUTOR']} />}>
              <Route path="/tutor" element={<TutorDashboard />} />
            </Route>

            <Route element={<MainLayout allowedRoles={['ADMIN']} />}>
              <Route path="/admin" element={<AdminPanel />} />
            </Route>

            {/* Catch-all route to handle redirects based on auth state */}
            <Route path="*" element={<PrivateRoutes />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

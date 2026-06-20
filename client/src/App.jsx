import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import SeekDashboard from './pages/SeekDashboard';
import RecruiterDashboard from './pages/RecruiterDashboard';
import PostJob from './pages/PostJob';
import Companies from './pages/Companies';
import About from './pages/About';
import Profile from './pages/Profile';
import ResumeGrader from './pages/ResumeGrader';
import { useAuth } from './context/AuthContext';
import AIChatbot from './components/AIChatbot';
import SalaryInsights from './pages/SalaryInsights';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
function App() {
  const { user, loading } = useAuth();
  const location = useLocation();

  const hideNavbar = ['/login', '/register', '/dashboard', '/post-job', '/profile'].includes(location.pathname);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: '#020817'}}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-blue-400 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/:id" element={<JobDetail />} />
        <Route path="/companies" element={<Companies />} />
        <Route path="/about" element={<About />} />
        <Route path="/profile" element={!user ? <Navigate to="/login" /> : <Profile />} />
        <Route path="/dashboard" element={
          !user ? <Navigate to="/login" /> :
          user.role === 'recruiter' ? <RecruiterDashboard /> : <SeekDashboard />
        } />
        <Route path="/post-job" element={
          !user ? <Navigate to="/login" /> :
          user.role === 'recruiter' ? <PostJob /> : <Navigate to="/" />
        } />
        <Route path="/resume-grader" element={
          !user ? <Navigate to="/login" /> : <ResumeGrader />
        } />
        <Route path="/salary-insights" element={<SalaryInsights />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
<Route path="/reset-password/:token" element={<ResetPassword />} />
      </Routes>
      <AIChatbot />
    </>
  );
}

export default App;
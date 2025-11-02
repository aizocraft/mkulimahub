import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop.jsx';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import GoogleAuthSuccess from './components/GoogleAuthSuccess.jsx';
import RoleSelectionPage from './pages/RoleSelectionPage';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import AboutPage from './pages/AboutPage'; 
import ContactPage from './pages/ContactPage'; 
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import FarmerDashboard from './pages/dashboards/FarmerDashboard';
import ExpertDashboard from './pages/dashboards/ExpertDashboard';
import UserPage from './pages/dashboards/admin/UserPage.jsx';
import Analytics from './pages/dashboards/admin/Analytics.jsx';
import ExpertsPage from './pages/dashboards/farmer/ExpertsPage.jsx';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

// Layout wrapper component
const PageLayout = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
    <Navbar />
    <main className="flex-1">
      {children}
    </main>
    <Footer />
  </div>
);

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <ScrollToTop /> 
          <Routes>
            {/* Routes with Navbar + Footer */}
            <Route path="/" element={
              <PageLayout>
                <HomePage />
              </PageLayout>
            } />
            <Route path="/about" element={
              <PageLayout>
                <AboutPage />
              </PageLayout>
            } />
            <Route path="/contact" element={
              <PageLayout>
                <ContactPage />
              </PageLayout>
            } />
            <Route path="/dashboard" element={
              <PageLayout>
                <Dashboard />
              </PageLayout>
            } />
            <Route path="/dashboard/admin" element={
              <PageLayout>
                <AdminDashboard />
              </PageLayout>
            } />
            <Route path="/dashboard/farmer" element={
              <PageLayout>
                <FarmerDashboard />
              </PageLayout>
            } />
            <Route path="/dashboard/expert" element={
              <PageLayout>
                <ExpertDashboard />
              </PageLayout>
            } />
            <Route path="/profile" element={
              <PageLayout>
                <ProfilePage />
              </PageLayout>
            } />
            <Route path="/settings" element={
              <PageLayout>
                <SettingsPage />
              </PageLayout>
            } />
            <Route path="/users" element={
              <PageLayout>
                <UserPage />
              </PageLayout>
            } />
            <Route path="/analytics" element={
              <PageLayout>
                <Analytics />
              </PageLayout>
            } />
            <Route path="/experts" element={
              <PageLayout>
                <ExpertsPage />
              </PageLayout>
            } />
            
            {/* Routes without Navbar + Footer (login/register) */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/auth/success" element={<GoogleAuthSuccess />} />
            <Route path="/role-selection" element={<RoleSelectionPage />} />
          </Routes>
        </BrowserRouter>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </AuthProvider>
    </ThemeProvider>
  );
}
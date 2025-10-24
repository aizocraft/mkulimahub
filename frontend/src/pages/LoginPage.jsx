import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import GoogleAuthButton from '../components/GoogleAuthButton';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { authAPI } from '../api';
import { toast } from 'react-toastify';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  ArrowRight, 
  Sparkles,
  Shield,
  User,
  Target,
  Leaf,
  Smartphone,
  Monitor,
  Tablet
} from 'lucide-react';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { login } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Check device type for responsive adjustments
  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  useEffect(() => {
    // Check for auth success from Google OAuth callback
    const token = searchParams.get('token');
    const user = searchParams.get('user');
    const isNewUser = searchParams.get('isNewUser') === 'true';

    if (token && user) {
      try {
        const userData = JSON.parse(decodeURIComponent(user));
        login(userData, token);
        
        if (isNewUser) {
          toast.success(`Welcome to Mkulima Hub, ${userData.name}! Account created successfully.`);
        } else {
          toast.success('Welcome back! Logged in successfully');
        }
        
        navigateToDashboard(userData);
      } catch (error) {
        console.error('Error parsing user data:', error);
        toast.error('Authentication failed');
      }
    }

    // Check for errors
    const errorParam = searchParams.get('error');
    if (errorParam) {
      toast.error(decodeURIComponent(errorParam) || 'Authentication failed. Please try again.');
    }
  }, [searchParams, login, navigate]);

  const navigateToDashboard = (user) => {
    // Small delay for better UX
    setTimeout(() => {
      if (user.role === 'admin') {
        navigate('/dashboard/admin');
      } else if (user.role === 'farmer') {
        navigate('/dashboard/farmer');
      } else if (user.role === 'expert') {
        navigate('/dashboard/expert');
      } else {
        navigate('/dashboard');
      }
    }, 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const response = await authAPI.login(formData);
      const { user, token } = response.data;
      
      login(user, token, rememberMe);
      toast.success('Welcome back! Logged in successfully');
      navigateToDashboard(user);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleGoogleSuccess = (user, token) => {
    login(user, token);
    toast.success('Google login successful!');
    navigateToDashboard(user);
  };

  const handleGoogleNewUser = (user, token) => {
    login(user, token);
    toast.success(`Welcome to Mkulima Hub, ${user.name}! Account created successfully.`);
    navigateToDashboard(user);
  };

  // Password strength indicator for login
  const getPasswordStrength = (password) => {
    if (password.length === 0) return 0;
    if (password.length < 6) return 1;
    if (password.length < 8) return 2;
    return 3;
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900/20 transition-all duration-500 overflow-hidden relative">
      {/* Advanced Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated Gradient Orbs */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-10 animate-pulse" style={{animationDelay: '4s'}}></div>
        
        {/* Animated Grid */}
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full" style={{
            backgroundImage: `linear-gradient(rgba(12, 74, 110, 0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(12, 74, 110, 0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}></div>
        </div>

        {/* Floating Particles */}
        {[...Array(isMobile ? 8 : 15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-full opacity-30 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 15}s`,
              animationDuration: `${20 + Math.random() * 25}s`,
              transform: `scale(${0.5 + Math.random() * 0.5})`
            }}
          />
        ))}

        {/* Floating Icons */}
        {[...Array(isMobile ? 3 : 6)].map((_, i) => (
          <div
            key={i}
            className="absolute text-emerald-300/20 animate-float"
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${25 + Math.random() * 20}s`,
            }}
          >
            {i % 3 === 0 ? <Leaf size={20} /> : i % 3 === 1 ? <User size={20} /> : <Target size={20} />}
          </div>
        ))}
      </div>

      {/* Device Indicator - for demo purposes */}
      <div className="fixed top-4 right-4 z-50 hidden md:flex items-center gap-2 bg-black/10 dark:bg-white/10 backdrop-blur-sm rounded-full px-3 py-1">
        {isMobile ? <Smartphone size={14} /> : window.innerWidth < 1024 ? <Tablet size={14} /> : <Monitor size={14} />}
        <span className="text-xs text-gray-600 dark:text-gray-400">
          {isMobile ? 'Mobile' : window.innerWidth < 1024 ? 'Tablet' : 'Desktop'}
        </span>
      </div>

      <div className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-6">
        <div className={`w-full ${isMobile ? 'max-w-sm' : 'max-w-md'} space-y-6`}>
          {/* Header */}
          <div className="text-center animate-fade-in">
            <Link to="/" className="inline-flex items-center space-x-3 group mb-6">
              <div className="flex items-center justify-center">
                <img 
                  src="/logo.png" 
                  alt="MkulimaHub" 
                  className="w-10 h-10 object-contain group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="text-left">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Mkulima<span className="text-emerald-600">Hub</span>
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Agricultural Intelligence</p>
              </div>
            </Link>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Welcome Back
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Sign in to your agricultural dashboard
              </p>
            </div>
          </div>

          {/* Login Form */}
          <div className="animate-slide-up" style={{animationDelay: '100ms'}}>
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/20 dark:border-gray-700/20 hover:shadow-3xl transition-all duration-300">
              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                  <div className="flex items-center space-x-2 text-red-700 dark:text-red-300 text-sm">
                    <Shield className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                </div>
              )}

              {/* Google Auth Button */}
              <div className="mb-6">
                <GoogleAuthButton 
                  type="login" 
                  onSuccess={handleGoogleSuccess}
                  onNewUser={handleGoogleNewUser}
                />
              </div>

              {/* Divider */}
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs">
                    Or continue with email
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Field */}
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email Address
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 group-focus-within:text-emerald-500 transition-colors duration-200" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      autoComplete="username"
                      className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm group-hover:border-gray-400 dark:group-hover:border-gray-500"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 group-focus-within:text-emerald-500 transition-colors duration-200" />
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      autoComplete="current-password"
                      className="w-full pl-10 pr-12 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm group-hover:border-gray-400 dark:group-hover:border-gray-500"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="flex items-center gap-2 text-xs">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 h-1 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            passwordStrength === 1 ? 'bg-red-500 w-1/3' :
                            passwordStrength === 2 ? 'bg-yellow-500 w-2/3' :
                            passwordStrength === 3 ? 'bg-green-500 w-full' : 'w-0'
                          }`}
                        />
                      </div>
                      <span className={`text-xs font-medium ${
                        passwordStrength === 1 ? 'text-red-500' :
                        passwordStrength === 2 ? 'text-yellow-500' :
                        passwordStrength === 3 ? 'text-green-500' : 'text-gray-400'
                      }`}>
                        {passwordStrength === 1 ? 'Weak' : passwordStrength === 2 ? 'Fair' : 'Strong'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center space-x-2 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 border-2 rounded transition-all duration-200 group-hover:border-emerald-400 ${
                        rememberMe 
                          ? 'bg-emerald-500 border-emerald-500' 
                          : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                      }`}>
                        {rememberMe && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-200">
                      Remember me
                    </span>
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors duration-200 text-xs font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 disabled:opacity-50 text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-emerald-500/30 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm">Signing In...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-sm">Sign In</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                    </>
                  )}
                </button>
              </form>

              {/* Register Link */}
              <div className="mt-6 text-center">
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Don't have an account?{' '}
                  <Link
                    to="/register"
                    className="font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors duration-200 inline-flex items-center gap-1 group"
                  >
                    Create account
                    <Sparkles className="w-3 h-3 group-hover:scale-110 transition-transform duration-200" />
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="animate-slide-up" style={{animationDelay: '200ms'}}>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { icon: User, label: 'Expert Network', color: 'text-emerald-500' },
                { icon: Shield, label: 'Secure', color: 'text-blue-500' },
                { icon: Target, label: 'Precision', color: 'text-green-500' }
              ].map((feature, index) => (
                <div 
                  key={index}
                  className="p-3 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-white/90 dark:hover:bg-gray-800/90 hover:border-emerald-200 dark:hover:border-emerald-600 transition-all duration-300 cursor-pointer group"
                >
                  <feature.icon className={`w-4 h-4 ${feature.color} mx-auto mb-1 group-hover:scale-110 transition-transform duration-200`} />
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                    {feature.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
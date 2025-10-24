import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { 
  Sprout, 
  Users, 
  BookOpen, 
  MessageCircle, 
  ArrowRight, 
  Star, 
  CheckCircle,
  TrendingUp,
  Shield,
  Clock,
  Globe,
  BadgeCheck,
  UserCheck
} from 'lucide-react';

const HomePage = () => {
  const { theme } = useTheme();
  const user = JSON.parse(localStorage.getItem('user'));

  const features = [
    {
      icon: <Sprout className="w-8 h-8" />,
      title: "Smart Crop Management",
      description: "Track your crops, get growth insights, and optimize your farming practices with AI-powered recommendations."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Expert Consultations",
      description: "Connect with certified agricultural experts for personalized advice and real-time problem-solving."
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Knowledge Library",
      description: "Access comprehensive farming guides, research papers, and best practices from industry leaders."
    },
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: "Community Support",
      description: "Join a vibrant community of farmers to share experiences, ask questions, and collaborate."
    }
  ];

  const stats = [
    { number: "10,000+", label: "Active Farmers" },
    { number: "500+", label: "Certified Experts" },
    { number: "50+", label: "Crop Varieties" },
    { number: "24/7", label: "Support Available" }
  ];

  const testimonials = [
    {
      name: "John Kamau",
      role: "Maize Farmer",
      content: "Mkulima Hub transformed my farming business. My yields increased by 40% in just one season!",
      rating: 5
    },
    {
      name: "Dr. Jane Mwangi",
      role: "Agricultural Expert",
      content: "A fantastic platform to share knowledge and help farmers succeed. The community is amazing.",
      rating: 5
    },
    {
      name: "Sarah Wanjiku",
      role: "Vegetable Farmer",
      content: "The expert consultations saved my tomato farm from pests. Highly recommended!",
      rating: 4
    }
  ];

  // Function to get user dashboard URL based on role
  const getDashboardUrl = (user) => {
    if (!user) return '/login';
    
    switch (user.role) {
      case 'admin':
        return '/dashboard/admin';
      case 'expert':
        return '/dashboard/expert';
      case 'farmer':
        return '/dashboard/farmer';
      default:
        return '/dashboard';
    }
  };

  // Function to get role display name
  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'expert':
        return 'Agricultural Expert';
      case 'farmer':
        return 'Farmer';
      default:
        return role;
    }
  };

  // Function to get role badge color
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'from-purple-500 to-purple-600';
      case 'expert':
        return 'from-blue-500 to-blue-600';
      case 'farmer':
        return 'from-green-500 to-green-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20 transition-colors duration-300">
      
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center animate-fade-in">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/25 animate-float">
                  <Sprout className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                  <Star className="w-4 h-4 text-white fill-current" />
                </div>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Welcome to <span className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">Mkulima Hub</span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">
              {user ? (
                <>
                  Welcome back, <span className="font-semibold text-emerald-600 dark:text-emerald-400">{user.name}</span>! 
                  Ready to continue your agricultural journey?
                </>
              ) : (
                "Empowering farmers with technology-driven solutions and expert knowledge for sustainable agricultural success."
              )}
            </p>

            {user ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link 
                  to={getDashboardUrl(user)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-emerald-500/50 flex items-center gap-2 shadow-lg shadow-emerald-500/25"
                >
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link 
                  to="/profile"
                  className="border-2 border-emerald-600 text-emerald-600 dark:text-emerald-400 dark:border-emerald-400 hover:bg-emerald-600 hover:text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-emerald-500/50"
                >
                  My Profile
                </Link>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link 
                  to="/register"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-emerald-500/50 flex items-center gap-2 shadow-lg shadow-emerald-500/25"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link 
                  to="/about"
                  className="border-2 border-emerald-600 text-emerald-600 dark:text-emerald-400 dark:border-emerald-400 hover:bg-emerald-600 hover:text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-emerald-500/50"
                >
                  Learn More
                </Link>
              </div>
            )}

            {/* User Info Card - Only show if user is logged in */}
            {user && (
              <div className="mt-8 inline-flex flex-col sm:flex-row items-center gap-4 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 max-w-md mx-auto">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    {/* Verification badge - Only show for verified experts */}
                    {user.role === 'expert' && user.isVerified && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                        <BadgeCheck className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      {user.name}
                      {/* Verification checkmark for experts */}
                      {user.role === 'expert' && user.isVerified && (
                        <BadgeCheck className="w-4 h-4 text-blue-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full bg-gradient-to-r ${getRoleBadgeColor(user.role)} text-white`}>
                        {getRoleDisplayName(user.role)}
                      </span>
                      {/* Show verification status only for experts */}
                      {user.role === 'expert' && (
                        <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
                          user.isVerified 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                        }`}>
                          {user.isVerified ? (
                            <>
                              <CheckCircle className="w-3 h-3" />
                              Verified
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3" />
                              Pending Verification
                            </>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Additional status indicators */}
                <div className="flex items-center gap-3 text-sm">
                  {/* Active status for all users */}
                  <div className={`flex items-center gap-1 ${
                    user.isActive 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      user.isActive ? 'bg-green-500' : 'bg-gray-400'
                    }`}></div>
                    <span>{user.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                  
                  {/* Last login indicator */}
                  {user.lastLogin && (
                    <div className="text-gray-500 dark:text-gray-400 text-xs">
                      Last active: {new Date(user.lastLogin).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800/50 backdrop-blur-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="text-center animate-fade-in p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-emerald-50 dark:from-gray-800 dark:to-emerald-900/10 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 hover:transform hover:-translate-y-1"
                style={{animationDelay: `${index * 100}ms`}}
              >
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 dark:text-gray-400 font-medium text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Mkulima Hub?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              We combine traditional farming wisdom with cutting-edge technology to help you succeed.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group p-8 rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl border border-gray-200 dark:border-gray-700 animate-slide-up hover:transform hover:-translate-y-2 transition-all duration-300 cursor-pointer"
                style={{animationDelay: `${index * 150}ms`}}
              >
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-lg shadow-emerald-500/25">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/10 dark:to-green-900/10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              What Our Community Says
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Join thousands of farmers and experts who are transforming agriculture.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 animate-slide-up"
                style={{animationDelay: `${index * 200}ms`}}
              >
                <div className="flex items-center gap-2 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'}`} 
                    />
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-6 italic leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section for logged out users */}
      {!user && (
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-r from-emerald-500 to-green-500 rounded-3xl p-12 shadow-2xl shadow-emerald-500/25">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Ready to Transform Your Farming Journey?
              </h2>
              <p className="text-emerald-100 text-xl mb-8 max-w-2xl mx-auto">
                Join thousands of successful farmers and experts who are already using Mkulima Hub to achieve better results.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  to="/register"
                  className="bg-white text-emerald-600 hover:bg-gray-100 font-bold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                >
                  <UserCheck className="w-5 h-5" />
                  Start Your Free Account
                </Link>
                <Link 
                  to="/about"
                  className="border-2 border-white text-white hover:bg-white hover:text-emerald-600 font-bold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105"
                >
                  Learn How It Works
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

    </div>
  );
};

export default HomePage;
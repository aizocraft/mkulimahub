import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import './HomePage.css';
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
  UserCheck,
  ChevronDown,
  Sparkles,
  Target,
  Award,
  Zap,
  Leaf,
  Cloud,
  Sun,
  Droplets
} from 'lucide-react';

const HomePage = () => {
  const { theme } = useTheme();
  const user = JSON.parse(localStorage.getItem('user'));
  const heroRef = useRef(null);
  const featuresRef = useRef(null);

  // Animation on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('.scroll-reveal');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: <Sprout className="w-8 h-8" />,
      title: "Smart Crop Management",
      description: "Track your crops, get growth insights, and optimize your farming practices with AI-powered recommendations.",
      color: "from-emerald-500 to-green-500",
      delay: "0ms"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Expert Consultations",
      description: "Connect with certified agricultural experts for personalized advice and real-time problem-solving.",
      color: "from-blue-500 to-cyan-500",
      delay: "100ms"
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Knowledge Library",
      description: "Access comprehensive farming guides, research papers, and best practices from industry leaders.",
      color: "from-purple-500 to-pink-500",
      delay: "200ms"
    },
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: "Community Support",
      description: "Join a vibrant community of farmers to share experiences, ask questions, and collaborate.",
      color: "from-amber-500 to-orange-500",
      delay: "300ms"
    }
  ];

  const stats = [
    { 
      number: "10,000+", 
      label: "Active Farmers",
      icon: <Users className="w-6 h-6" />,
      color: "text-emerald-500"
    },
    { 
      number: "500+", 
      label: "Certified Experts",
      icon: <Award className="w-6 h-6" />,
      color: "text-blue-500"
    },
    { 
      number: "50+", 
      label: "Crop Varieties",
      icon: <Leaf className="w-6 h-6" />,
      color: "text-green-500"
    },
    { 
      number: "24/7", 
      label: "Support Available",
      icon: <Clock className="w-6 h-6" />,
      color: "text-purple-500"
    }
  ];

  const testimonials = [
    {
      name: "John Kamau",
      role: "Maize Farmer",
      content: "Mkulima Hub transformed my farming business. My yields increased by 40% in just one season!",
      rating: 5,
      achievement: "Yield Master"
    },
    {
      name: "Dr. Jane Mwangi",
      role: "Agricultural Expert",
      content: "A fantastic platform to share knowledge and help farmers succeed. The community is amazing.",
      rating: 5,
      achievement: "Top Consultant"
    },
    {
      name: "Sarah Wanjiku",
      role: "Vegetable Farmer",
      content: "The expert consultations saved my tomato farm from pests. Highly recommended!",
      rating: 4,
      achievement: "Pest Control Pro"
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
        return 'bg-gradient-to-r from-purple-500 to-purple-600';
      case 'expert':
        return 'bg-gradient-to-r from-blue-500 to-blue-600';
      case 'farmer':
        return 'bg-gradient-to-r from-emerald-500 to-green-600';
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20 transition-colors duration-300">
      
      {/* Enhanced Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-300/10 dark:bg-emerald-500/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-300/10 dark:bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-green-300/10 dark:bg-green-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="absolute inset-0 bg-grid-pattern opacity-5 dark:opacity-10"></div>
        
        <div className="max-w-7xl mx-auto relative z-10 w-full">
          <div className="text-center animate-fade-in">
            {/* Animated Icon with Particle Effects */}
            <div className="relative inline-block mb-8">
              <div className="relative">
                <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/30 animate-float">
                  <div className="relative">
                    <Sprout className="w-12 h-12 md:w-16 md:h-16 text-white animate-pulse-slow" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-ping opacity-75"></div>
                  </div>
                </div>
                {/* Floating Particles */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400/20 backdrop-blur-sm rounded-full flex items-center justify-center animate-bounce delay-300">
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                </div>
                <div className="absolute -bottom-2 -left-4 w-6 h-6 bg-blue-400/20 backdrop-blur-sm rounded-full animate-bounce delay-700"></div>
                <div className="absolute top-10 -right-6 w-5 h-5 bg-green-400/20 backdrop-blur-sm rounded-full animate-bounce delay-1200"></div>
              </div>
            </div>
            
            {/* Main Title with Typewriter Effect */}
            <div className="mb-6">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4">
                <span className="text-gray-900 dark:text-white">Welcome to </span>
                <span className="bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-400 bg-clip-text text-transparent animate-gradient bg-300%">
                  Mkulima Hub
                </span>
              </h1>
              
              <div className="h-1 w-24 md:w-32 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full mx-auto mb-6 animate-expand"></div>
              
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8 px-4">
                {user ? (
                  <>
                    Welcome back, <span className="font-semibold text-emerald-600 dark:text-emerald-400 relative">
                      {user.name}
                      {user.role === 'expert' && user.isVerified && (
                        <BadgeCheck className="w-5 h-5 text-blue-500 inline-block ml-1" />
                      )}
                    </span>! Ready to continue your agricultural journey?
                  </>
                ) : (
                  "Empowering farmers with technology-driven solutions and expert knowledge for sustainable agricultural success."
                )}
              </p>
            </div>

            {/* User Role Badge (Minimal) */}
            {user && (
              <div className="mb-8 inline-block">
                <div className={`${getRoleBadgeColor(user.role)} text-white font-semibold px-6 py-2 rounded-full shadow-lg animate-fade-in`}>
                  {getRoleDisplayName(user.role)}
                </div>
              </div>
            )}

            {/* Action Buttons with Hover Effects */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              {user ? (
                <>
                  <Link 
                    to={getDashboardUrl(user)}
                    className="group relative overflow-hidden bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/40 flex items-center gap-2"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-400 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500"></div>
                    <span className="relative">Go to Dashboard</span>
                    <ArrowRight className="w-5 h-5 relative group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link 
                    to="/profile"
                    className="group relative overflow-hidden border-2 border-emerald-600 text-emerald-600 dark:text-emerald-400 dark:border-emerald-400 hover:text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <div className="absolute inset-0 bg-emerald-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    <span className="relative">My Profile</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    to="/register"
                    className="group relative overflow-hidden bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/40 flex items-center gap-2"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-400 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500"></div>
                    <span className="relative">Get Started Free</span>
                    <ArrowRight className="w-5 h-5 relative group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link 
                    to="/about"
                    className="group relative overflow-hidden border-2 border-emerald-600 text-emerald-600 dark:text-emerald-400 dark:border-emerald-400 hover:text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <div className="absolute inset-0 bg-emerald-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    <span className="relative">Learn More</span>
                  </Link>
                </>
              )}
            </div>

           {/* Scroll Indicator */}
<div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 z-30">
  <div className="flex flex-col items-center">
    <div className="animate-bounce mb-1">
      <ChevronDown className="w-8 h-8 text-emerald-500 dark:text-emerald-400 opacity-90" />
    </div>
    <div className="h-8 w-0.5 bg-gradient-to-b from-emerald-400/50 to-transparent rounded-full animate-pulse"></div>
  </div>
</div>
          </div>
        </div>
      </section>

      {/* Stats Section with Parallax Effect */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white/80 to-emerald-50/80 dark:from-gray-900/80 dark:to-emerald-900/10 backdrop-blur-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="scroll-reveal group relative p-6 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl hover:border-transparent transition-all duration-500 hover:transform hover:-translate-y-2"
                style={{animationDelay: `${index * 100}ms`}}
              >
                {/* Hover Effect Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-500/5 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-500"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-center mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-lg ${stat.color}`}>
                      {stat.icon}
                    </div>
                  </div>
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 font-medium text-sm text-center">
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section with 3D Effect */}
      <section ref={featuresRef} className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-50/20 to-transparent dark:via-emerald-900/5"></div>
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-16 scroll-reveal">
            <div className="inline-block mb-4">
              <span className="px-4 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-semibold rounded-full">
                Why Choose Us
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Transform Your <span className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">Farming Experience</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              We combine traditional farming wisdom with cutting-edge technology to help you succeed.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="scroll-reveal group relative p-6 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl transition-all duration-500 hover:transform hover:-translate-y-2 hover:rotate-1 cursor-pointer"
                style={{animationDelay: feature.delay}}
              >
                {/* Animated Border */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-sm"></div>
                
                <div className="relative z-10">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-lg`}>
                    <div className="relative">
                      {feature.icon}
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-white/30 rounded-full animate-ping"></div>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
                    {feature.description}
                  </p>
                  
                  {/* Hover Indicator */}
                  <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="h-1 w-8 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section with Slider Effect */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-emerald-50/50 via-white to-blue-50/50 dark:from-emerald-900/10 dark:via-gray-800 dark:to-blue-900/10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 scroll-reveal">
            <div className="inline-block mb-4">
              <span className="px-4 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-sm font-semibold rounded-full">
                Community Voices
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              What Our <span className="bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">Community Says</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Join thousands of farmers and experts who are transforming agriculture.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="scroll-reveal group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl transition-all duration-500 hover:transform hover:-translate-y-2"
                style={{animationDelay: `${index * 200}ms`}}
              >
                {/* Achievement Badge */}
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="px-3 py-1 bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs font-semibold rounded-full shadow-lg">
                    {testimonial.achievement}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mb-4 justify-center">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 transition-all duration-300 ${
                        i < testimonial.rating 
                          ? 'text-yellow-400 fill-yellow-400 group-hover:scale-125' 
                          : 'text-gray-300 dark:text-gray-600'
                      }`} 
                    />
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-6 italic leading-relaxed text-center group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center justify-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center text-white font-bold shadow-md group-hover:scale-110 transition-transform">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                      <CheckCircle className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {testimonial.name}
                    </div>
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
          <div className="max-w-4xl mx-auto text-center scroll-reveal">
            <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-400 rounded-3xl p-8 md:p-12 shadow-2xl shadow-emerald-500/25">
              {/* Animated Background */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
              </div>
              
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Ready to Transform Your <span className="text-yellow-200">Farming Journey</span>?
                </h2>
                <p className="text-emerald-100 text-lg md:text-xl mb-8 max-w-2xl mx-auto">
                  Join thousands of successful farmers and experts who are already using Mkulima Hub to achieve better results.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link 
                    to="/register"
                    className="group relative overflow-hidden bg-white text-emerald-600 hover:text-emerald-700 font-bold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-100 to-green-100 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500"></div>
                    <UserCheck className="w-5 h-5 relative" />
                    <span className="relative">Start Your Free Account</span>
                  </Link>
                  <Link 
                    to="/about"
                    className="group relative overflow-hidden border-2 border-white text-white hover:text-emerald-600 font-bold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105"
                  >
                    <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    <span className="relative">Learn How It Works</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

    
    </div>
  );
};

export default HomePage;
import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { 
  Users, 
  Target, 
  Award, 
  Globe, 
  Heart, 
  ArrowRight,
  CheckCircle,
  Star,
  Shield,
  Leaf,
  TrendingUp,
  Clock,
  Crop,
  PhoneCall,
  Sparkles,
  Lightbulb,
  Rocket
} from 'lucide-react';

const AboutPage = () => {
  const { theme } = useTheme();

  const features = [
    {
      icon: <Users className="w-6 h-6" />,
      title: "Expert Community",
      description: "Connect with certified agricultural experts and experienced farmers for real-time guidance"
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Precision Farming",
      description: "AI-powered insights tailored to your specific soil, climate, and crop conditions"
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Quality Certified",
      description: "All experts verified by agricultural boards with proven track records"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Localized Solutions",
      description: "Region-specific advice adapting global best practices to local conditions"
    }
  ];

  const stats = [
    { number: "50K+", label: "Farmers Empowered", icon: <Users className="w-4 h-4" /> },
    { number: "2K+", label: "Experts Network", icon: <Award className="w-4 h-4" /> },
    { number: "95%", label: "Success Rate", icon: <TrendingUp className="w-4 h-4" /> },
    { number: "24/7", label: "Support", icon: <Clock className="w-4 h-4" /> }
  ];

  const values = [
    {
      icon: <Heart className="w-5 h-5" />,
      title: "Farmer First",
      description: "Every decision centers on farmer success and sustainable growth"
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Trust & Safety",
      description: "Verified experts, secure platform, and reliable agricultural data"
    },
    {
      icon: <Leaf className="w-5 h-5" />,
      title: "Sustainability",
      description: "Promoting eco-friendly practices that protect our environment"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20 transition-colors duration-300 pt-16">
      
      {/* Hero Section - More Compact */}
      <section className="relative py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center animate-fade-in">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                  <Leaf className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Star className="w-2 h-2 text-white fill-current" />
                </div>
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Revolutionizing <span className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">African Agriculture</span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-6">
              Bridging the gap between traditional farming wisdom and cutting-edge technology 
              to empower farmers with expert knowledge and sustainable solutions.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Stats Combined */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            
            {/* Mission */}
            <div className="animate-slide-up">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Our Mission</h2>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  To democratize agricultural expertise by connecting farmers with certified experts 
                  through an intuitive digital platform, driving sustainable growth and food security across Africa.
                </p>
                <div className="space-y-2">
                  {[
                    "Digital advisory services",
                    "Real-time market insights",
                    "Climate-smart solutions",
                    "Community knowledge sharing"
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Vision & Stats */}
            <div className="space-y-6 animate-slide-up" style={{animationDelay: '150ms'}}>
              {/* Vision Card */}
              <div className="bg-gradient-to-br from-emerald-600 to-green-600 rounded-2xl p-6 text-white shadow-xl">
                <div className="flex items-center gap-2 mb-3">
                  <Rocket className="w-5 h-5" />
                  <h3 className="text-lg font-bold">Vision 2030</h3>
                </div>
                <p className="text-emerald-100 text-sm">
                  Empowering 1 million African farmers with digital agricultural expertise 
                  to transform food systems and create sustainable livelihoods.
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat, index) => (
                  <div 
                    key={index} 
                    className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700"
                  >
                    <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto mb-2">
                      {stat.icon}
                    </div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{stat.number}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features - Compact Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-medium mb-3">
              <Sparkles className="w-3 h-3" />
              Why Farmers Choose Us
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Smart Farming Solutions
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm max-w-xl mx-auto">
              Integrated technology and expertise for modern agricultural success
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group p-4 rounded-xl bg-white dark:bg-gray-800 shadow-md hover:shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-200"
              >
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform duration-200">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-xs leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values & CTA Combined */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            
            {/* Values */}
            <div className="animate-slide-up">
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full text-xs font-medium mb-3">
                  <Lightbulb className="w-3 h-3" />
                  Our Values
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Principles That Guide Us
                </h2>
              </div>
              
              <div className="space-y-4">
                {values.map((value, index) => (
                  <div 
                    key={index} 
                    className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
                  >
                    <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                      {value.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                        {value.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-xs">
                        {value.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="animate-slide-up" style={{animationDelay: '200ms'}}>
              <div className="bg-gradient-to-br from-emerald-600 to-green-600 rounded-2xl p-6 text-white h-full flex flex-col justify-center">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-3">
                    Start Your Journey
                  </h2>
                  <p className="text-emerald-100 text-sm mb-6">
                    Join thousands of successful farmers transforming their practices with expert guidance.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button className="bg-white text-emerald-600 hover:bg-gray-100 font-semibold py-2 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm">
                      <PhoneCall className="w-4 h-4" />
                      Get Started
                    </button>
                    <button className="border border-white text-white hover:bg-white hover:text-emerald-600 font-semibold py-2 px-6 rounded-lg transition-all duration-200 text-sm">
                      Learn More
                    </button>
                  </div>
                  
                  <p className="text-emerald-200 text-xs mt-4">
                    Free 30-day trial • No commitment
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
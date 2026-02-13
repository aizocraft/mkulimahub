import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion, useInView } from 'framer-motion';
import {
  Leaf,
  Users,
  Award,
  TrendingUp,
  Clock,
  Sprout,
  Lightbulb,
  MessageCircle,
  BookOpen,
  ChevronRight,
  Star,
  Shield,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Quote,
  Target,
  Play
} from 'lucide-react';

// Animated Counter Hook
const useAnimatedCounter = (end, duration = 2000, start = 0) => {
  const [count, setCount] = useState(start);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  useEffect(() => {
    if (!isInView) return;

    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * (end - start) + start));
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  }, [isInView, end, duration, start]);

  return { count, ref };
};

// Counter Component
const AnimatedCounter = ({ end, suffix = '', prefix = '', duration = 2000 }) => {
  const { count, ref } = useAnimatedCounter(end, duration);
  
  return (
    <span ref={ref} className="inline-block">
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
};

// Animation Variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
};

const HomePage = () => {
  const { t } = useTranslation('home');
  const { user, isAuthenticated } = useAuth();
  const { theme } = useTheme();

  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const testimonialsRef = useRef(null);
  const ctaRef = useRef(null);

  const heroInView = useInView(heroRef, { once: true, margin: '-100px' });
  const featuresInView = useInView(featuresRef, { once: true, margin: '-100px' });
  const testimonialsInView = useInView(testimonialsRef, { once: true, margin: '-100px' });
  const ctaInView = useInView(ctaRef, { once: true, margin: '-100px' });

  const features = [
    {
      icon: <Sprout className="w-6 h-6" />,
      title: t('smartCropManagement'),
      description: t('smartCropDesc'),
      color: 'from-emerald-500 to-green-500'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: t('expertConsultations'),
      description: t('expertConsultationsDesc'),
      color: 'from-blue-500 to-indigo-500'
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: t('knowledgeLibrary'),
      description: t('knowledgeLibraryDesc'),
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: t('communitySupport'),
      description: t('communitySupportDesc'),
      color: 'from-orange-500 to-red-500'
    }
  ];

  const stats = [
    { icon: <Users className="w-5 h-5" />, value: 10000, suffix: '+', label: 'activeFarmers' },
    { icon: <Award className="w-5 h-5" />, value: 500, suffix: '+', label: 'certifiedExperts' },
    { icon: <Sprout className="w-5 h-5" />, value: 50, suffix: '+', label: 'cropVarieties' },
    { icon: <Clock className="w-5 h-5" />, value: 24, suffix: '/7', label: 'supportAvailable' }
  ];

  const testimonials = [
    {
      name: t('testimonial1.name'),
      role: t('testimonial1.role'),
      content: t('testimonial1.content'),
      achievement: t('testimonial1.achievement'),
      avatar: 'https://ui-avatars.com/api/?name=John+Kamau&background=059669&color=fff'
    },
    {
      name: t('testimonial2.name'),
      role: t('testimonial2.role'),
      content: t('testimonial2.content'),
      achievement: t('testimonial2.achievement'),
      avatar: 'https://ui-avatars.com/api/?name=Jane+Mwangi&background=2563eb&color=fff'
    },
    {
      name: t('testimonial3.name'),
      role: t('testimonial3.role'),
      content: t('testimonial3.content'),
      achievement: t('testimonial3.achievement'),
      avatar: 'https://ui-avatars.com/api/?name=Sarah+Wanjiku&background=7e22ce&color=fff'
    }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-gray-900' 
        : 'bg-gradient-to-b from-gray-50 to-white'
    }`}>
      
      {/* Hero Section */}
      <section ref={heroRef} className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 lg:pt-32 lg:pb-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text Content */}
            <motion.div
              initial="hidden"
              animate={heroInView ? "visible" : "hidden"}
              variants={stagger}
              className="text-center lg:text-left"
            >
              <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                {}
              </motion.div>

              <motion.h1 
                variants={fadeInUp}
                className="text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 dark:text-white mb-6"
              >
                {isAuthenticated() && user ? (
                  <>
                    {t('welcomeBack', { name: user.name?.split(' ')[0] || 'User' })}
                  </>
                ) : (
                  <>
                    {t('welcome')}
                  </>
                )}
              </motion.h1>

              <motion.p 
                variants={fadeInUp}
                className={`text-lg lg:text-xl mb-8 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                {t('subtitle')}
              </motion.p>

              <motion.div 
                variants={fadeInUp}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                {isAuthenticated() ? (
                  <>
                    <Link
                      to="/dashboard"
                      className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      {t('goToDashboard')}
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                    <Link
                      to="/profile"
                      className={`inline-flex items-center justify-center px-6 py-3 font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 ${
                        theme === 'dark'
                          ? 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-700'
                          : 'bg-white text-gray-900 hover:bg-gray-50 border border-gray-200'
                      }`}
                    >
                      {t('myProfile')}
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/register"
                      className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      {t('getStartedFree')}
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                    <Link
                      to="/about"
                      className={`inline-flex items-center justify-center px-6 py-3 font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 ${
                        theme === 'dark'
                          ? 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-700'
                          : 'bg-white text-gray-900 hover:bg-gray-50 border border-gray-200'
                      }`}
                    >
                      {t('learnMore')}
                    </Link>
                  </>
                )}
              </motion.div>

              {/* Stats with Animated Counters */}
              <motion.div 
                variants={fadeInUp}
                className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-12"
              >
                {stats.map((stat, index) => (
                  <div key={index} className="text-center lg:text-left">
                    <div className={`text-2xl font-bold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      <AnimatedCounter 
                        end={stat.value} 
                        suffix={stat.suffix || ''} 
                        duration={2000 + index * 300}
                      />
                    </div>
                    <div className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {t(stat.label)}
                    </div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right Column - Image/Illustration */}
            <motion.div
              initial="hidden"
              animate={heroInView ? "visible" : "hidden"}
              variants={scaleIn}
              className="hidden lg:block"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-600 rounded-3xl blur-3xl opacity-20"></div>
                <div className={`relative rounded-3xl p-8 ${
                  theme === 'dark'
                    ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700'
                    : 'bg-white border border-gray-200'
                } shadow-2xl`}>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl flex items-center justify-center">
                      <Leaf className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">Mkulima Hub</div>
                      <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {t('transformExperience')}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t(`combineWisdom`)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className={`py-20 transition-colors duration-300 ${
        theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate={featuresInView ? "visible" : "hidden"}
            variants={fadeInUp}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('transformExperience')}
            </h2>
            <p className={`text-lg max-w-2xl mx-auto ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {t('combineWisdom')}
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            animate={featuresInView ? "visible" : "hidden"}
            variants={stagger}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -8 }}
                className={`group p-6 rounded-2xl transition-all duration-300 ${
                  theme === 'dark'
                    ? 'bg-gray-900 border border-gray-700 hover:border-gray-600'
                    : 'bg-white border border-gray-200 hover:border-emerald-200'
                } shadow-lg hover:shadow-xl`}
              >
                <div className={`w-14 h-14 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section ref={testimonialsRef} className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate={testimonialsInView ? "visible" : "hidden"}
            variants={fadeInUp}
            className="text-center mb-12"
          >
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-4 ${
              theme === 'dark'
                ? 'bg-purple-900/30 text-purple-300'
                : 'bg-purple-100 text-purple-700'
            }`}>
              <Quote className="w-4 h-4" />
              {t('communityVoices')}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('whatCommunitySays')}
            </h2>
            <p className={`text-lg max-w-2xl mx-auto ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {t('joinThousands')}
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            animate={testimonialsInView ? "visible" : "hidden"}
            variants={stagger}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ scale: 1.02 }}
                className={`p-6 rounded-2xl transition-all duration-300 ${
                  theme === 'dark'
                    ? 'bg-gray-800 border border-gray-700'
                    : 'bg-white border border-gray-200'
                } shadow-lg hover:shadow-xl relative`}
              >
                <div className="absolute -top-3 -right-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                    <Star className="w-5 h-5 text-white fill-current" />
                  </div>
                </div>
                
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-14 h-14 rounded-full border-2 border-emerald-500"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </h4>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {testimonial.role}
                    </p>
                  </div>
                </div>

                <p className={`mb-4 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  "{testimonial.content}"
                </p>

                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className={`text-xs font-medium ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {testimonial.achievement}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            animate={ctaInView ? "visible" : "hidden"}
            variants={scaleIn}
            className="bg-gradient-to-br from-emerald-600 to-green-600 rounded-3xl p-12 text-center text-white shadow-2xl relative overflow-hidden"
          >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/10 rounded-full blur-3xl"></div>
            
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {t('readyTransform')}
              </h2>
              <p className="text-emerald-100 text-lg mb-8 max-w-2xl mx-auto">
                {t('joinSuccessful')}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-emerald-600 hover:bg-gray-100 font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  {t('startFreeAccount')}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link
                  to="/about"
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-emerald-600 font-bold rounded-xl transition-all duration-300 transform hover:scale-105"
                >
                  {t('learnHowItWorks')}
                </Link>
              </div>
              
              <p className="text-emerald-200 text-sm mt-6">
                {t('freeTrial') || 'No credit card required • Free 30-day trial'}
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Users,
  Target,
  Award,
  Globe,
  Heart,
  CheckCircle,
  Star,
  Shield,
  Leaf,
  TrendingUp,
  Clock,
  PhoneCall,
  Sparkles,
  Lightbulb,
  Rocket
} from 'lucide-react';

// Animation Variants
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } }
};

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.12
    }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6 } }
};

const AboutPage = () => {
  const { theme } = useTheme();
  const { t } = useTranslation('about');

  const heroRef = useRef(null);
  const missionRef = useRef(null);
  const featuresRef = useRef(null);
  const valuesRef = useRef(null);

  const heroInView = useInView(heroRef, { once: true, margin: '-100px' });
  const missionInView = useInView(missionRef, { once: true, margin: '-100px' });
  const featuresInView = useInView(featuresRef, { once: true, margin: '-100px' });
  const valuesInView = useInView(valuesRef, { once: true, margin: '-100px' });

  const features = [
    { icon: <Users className="w-6 h-6" />, title: t('features.expertCommunity.title'), description: t('features.expertCommunity.description') },
    { icon: <Target className="w-6 h-6" />, title: t('features.precisionFarming.title'), description: t('features.precisionFarming.description') },
    { icon: <Award className="w-6 h-6" />, title: t('features.qualityCertified.title'), description: t('features.qualityCertified.description') },
    { icon: <Globe className="w-6 h-6" />, title: t('features.localizedSolutions.title'), description: t('features.localizedSolutions.description') }
  ];

  const stats = [
    { number: t('stats.farmersEmpowered.number'), label: t('stats.farmersEmpowered.label'), icon: <Users className="w-4 h-4" /> },
    { number: t('stats.expertsNetwork.number'), label: t('stats.expertsNetwork.label'), icon: <Award className="w-4 h-4" /> },
    { number: t('stats.successRate.number'), label: t('stats.successRate.label'), icon: <TrendingUp className="w-4 h-4" /> },
    { number: t('stats.support.number'), label: t('stats.support.label'), icon: <Clock className="w-4 h-4" /> }
  ];

  const values = [
    { icon: <Heart className="w-5 h-5" />, title: t('values.farmerFirst.title'), description: t('values.farmerFirst.description') },
    { icon: <Shield className="w-5 h-5" />, title: t('values.trustSafety.title'), description: t('values.trustSafety.description') },
    { icon: <Leaf className="w-5 h-5" />, title: t('values.sustainability.title'), description: t('values.sustainability.description') }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900/20' 
        : 'bg-gradient-to-br from-emerald-50 via-white to-blue-50'
    } pt-16`}>

      {/* Hero Section */}
      <section ref={heroRef} className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial="hidden"
            animate={heroInView ? "visible" : "hidden"}
            variants={scaleIn}
            className="flex justify-center mb-8"
          >
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/30">
                <Leaf className="w-11 h-11 text-white" />
              </div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg"
              >
                <Star className="w-5 h-5 text-white fill-current" />
              </motion.div>
            </div>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            initial="hidden"
            animate={heroInView ? "visible" : "hidden"}
            className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6"
          >
            {t('hero.title')}{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              {t('hero.highlight')}
            </span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            initial="hidden"
            animate={heroInView ? "visible" : "hidden"}
            className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
          >
            {t('hero.subtitle')}
          </motion.p>
        </div>
      </section>

      {/* Mission & Stats */}
      <section ref={missionRef} className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate={missionInView ? "visible" : "hidden"}
            className="grid lg:grid-cols-2 gap-10 items-start"
          >
            {/* Mission */}
            <motion.div variants={fadeInUp} className={`rounded-2xl p-8 shadow-xl border transition-colors duration-300 ${
              theme === 'dark' 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center gap-3 mb-5">
                <Target className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('mission.title')}</h2>
              </div>
              <p className={`mb-6 leading-relaxed ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {t('mission.description')}
              </p>
              <div className="space-y-3">
                {t('mission.points', { returnObjects: true }).map((item, index) => (
                  <motion.div key={index} variants={fadeInUp} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Vision + Stats */}
            <motion.div variants={stagger} className="space-y-8">
              <motion.div variants={fadeInUp} className="bg-gradient-to-br from-emerald-600 to-green-600 rounded-2xl p-8 text-white shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <Rocket className="w-7 h-7" />
                  <h3 className="text-xl font-bold">{t('vision.title')}</h3>
                </div>
                <p className="text-emerald-50 text-lg">
                  {t('vision.description')}
                </p>
              </motion.div>

              <motion.div variants={stagger} className="grid grid-cols-2 gap-5">
                {stats.map((stat, i) => (
                  <motion.div
                    key={i}
                    variants={fadeInUp}
                    className={`rounded-2xl p-6 text-center border shadow-lg transition-colors duration-300 ${
                      theme === 'dark' 
                        ? 'bg-gray-800 border-gray-700' 
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 ${
                      theme === 'dark' 
                        ? 'bg-emerald-900/40 text-emerald-400' 
                        : 'bg-emerald-100 text-emerald-600'
                    }`}>
                      {stat.icon}
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.number}</div>
                    <div className={`text-sm mt-1 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section ref={featuresRef} className={`py-16 px-4 sm:px-6 lg:px-8 transition-colors duration-300 ${
        theme === 'dark' ? 'bg-gray-800/30' : 'bg-white'
      }`}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            animate={featuresInView ? "visible" : "hidden"}
            variants={fadeInUp}
            className="text-center mb-12"
          >
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-4 ${
              theme === 'dark' 
                ? 'bg-blue-900/30 text-blue-300' 
                : 'bg-blue-100 text-blue-700'
            }`}>
              <Sparkles className="w-4 h-4" />
              {t('features.badge')}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('features.title')}
            </h2>
            <p className={`max-w-2xl mx-auto ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {t('features.subtitle')}
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            animate={featuresInView ? "visible" : "hidden"}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className={`group rounded-2xl p-6 shadow-lg hover:shadow-2xl border transition-all duration-300 ${
                  theme === 'dark' 
                    ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                <p className={`text-sm leading-relaxed ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Values & CTA */}
      <section ref={valuesRef} className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate={valuesInView ? "visible" : "hidden"}
            className="grid lg:grid-cols-2 gap-10"
          >
            {/* Values */}
            <motion.div variants={fadeInUp}>
              <div className="text-center mb-10">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-4 ${
                  theme === 'dark' 
                    ? 'bg-emerald-900/30 text-emerald-300' 
                    : 'bg-emerald-100 text-emerald-700'
                }`}>
                  <Lightbulb className="w-4 h-4" />
                  {t('values.badge')}
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {t('values.title')}
                </h2>
              </div>

              <div className="space-y-6">
                {values.map((value, i) => (
                  <motion.div
                    key={i}
                    variants={fadeInUp}
                    whileHover={{ x: 8 }}
                    className={`flex items-start gap-5 p-6 rounded-2xl shadow-md border transition-colors duration-300 ${
                      theme === 'dark' 
                        ? 'bg-gray-800 border-gray-700' 
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                      {value.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white mb-1">{value.title}</h3>
                      <p className={`text-sm leading-relaxed ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {value.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* CTA */}
            <motion.div
              variants={fadeInUp}
              className="bg-gradient-to-br from-emerald-600 to-green-600 rounded-3xl p-10 text-white flex flex-col justify-center shadow-2xl"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-5 text-center">
                {t('cta.title')}
              </h2>
              <p className="text-emerald-100 text-lg mb-8 text-center max-w-md mx-auto">
                {t('cta.subtitle')}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                <Link
                  to="/register"
                  className="bg-white text-emerald-600 hover:bg-gray-100 font-bold py-4 px-8 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg"
                >
                  <PhoneCall className="w-5 h-5" />
                  {t('cta.getStarted')}
                </Link>
                <Link
                  to="/contact"
                  className="border-2 border-white text-white hover:bg-white hover:text-emerald-600 font-bold py-4 px-8 rounded-xl transition-all duration-300"
                >
                  {t('cta.learnMore')}
                </Link>
              </div>

              <p className="text-center text-emerald-200 text-sm">
                {t('cta.trial')}
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
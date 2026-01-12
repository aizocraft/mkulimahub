// src/pages/AboutPage.jsx
import React, { useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { motion, useInView } from 'framer-motion';
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

  const heroRef = useRef(null);
  const missionRef = useRef(null);
  const featuresRef = useRef(null);
  const valuesRef = useRef(null);

  const heroInView = useInView(heroRef, { once: true, margin: '-100px' });
  const missionInView = useInView(missionRef, { once: true, margin: '-100px' });
  const featuresInView = useInView(featuresRef, { once: true, margin: '-100px' });
  const valuesInView = useInView(valuesRef, { once: true, margin: '-100px' });

  const features = [
    { icon: <Users className="w-6 h-6" />, title: "Expert Community", description: "Connect with certified agricultural experts and experienced farmers for real-time guidance" },
    { icon: <Target className="w-6 h-6" />, title: "Precision Farming", description: "AI-powered insights tailored to your specific soil, climate, and crop conditions" },
    { icon: <Award className="w-6 h-6" />, title: "Quality Certified", description: "All experts verified by agricultural boards with proven track records" },
    { icon: <Globe className="w-6 h-6" />, title: "Localized Solutions", description: "Region-specific advice adapting global best practices to local conditions" }
  ];

  const stats = [
    { number: "50K+", label: "Farmers Empowered", icon: <Users className="w-4 h-4" /> },
    { number: "2K+", label: "Experts Network", icon: <Award className="w-4 h-4" /> },
    { number: "95%", label: "Success Rate", icon: <TrendingUp className="w-4 h-4" /> },
    { number: "24/7", label: "Support", icon: <Clock className="w-4 h-4" /> }
  ];

  const values = [
    { icon: <Heart className="w-5 h-5" />, title: "Farmer First", description: "Every decision centers on farmer success and sustainable growth" },
    { icon: <Shield className="w-5 h-5" />, title: "Trust & Safety", description: "Verified experts, secure platform, and reliable agricultural data" },
    { icon: <Leaf className="w-5 h-5" />, title: "Sustainability", description: "Promoting eco-friendly practices that protect our environment" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20 transition-colors duration-300 pt-16">

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
            Revolutionizing{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              African Agriculture
            </span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            initial="hidden"
            animate={heroInView ? "visible" : "hidden"}
            className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
          >
           
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
            <motion.div variants={fadeInUp} className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-5">
                <Target className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Our Mission</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                To democratize agricultural expertise by connecting farmers with certified experts
                through an intuitive digital platform, driving sustainable growth and food security across Africa.
              </p>
              <div className="space-y-3">
                {["Digital advisory services", "Real-time market insights", "Climate-smart solutions", "Community knowledge sharing"].map((item) => (
                  <motion.div key={item} variants={fadeInUp} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Vision + Stats */}
            <motion.div variants={stagger} className="space-y-8">
              <motion.div variants={fadeInUp} className="bg-gradient-to-br from-emerald-600 to-green-600 rounded-2xl p-8 text-white shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <Rocket className="w-7 h-7" />
                  <h3 className="text-xl font-bold">Vision 2030</h3>
                </div>
                <p className="text-emerald-50 text-lg">
                  Empowering <strong>African farmers</strong> with digital agricultural expertise
                  to create sustainable livelihoods.
                </p>
              </motion.div>

              <motion.div variants={stagger} className="grid grid-cols-2 gap-5">
                {stats.map((stat, i) => (
                  <motion.div
                    key={i}
                    variants={fadeInUp}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center border border-gray-200 dark:border-gray-700 shadow-lg"
                  >
                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto mb-3">
                      {stat.icon}
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white"></div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section ref={featuresRef} className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            animate={featuresInView ? "visible" : "hidden"}
            variants={fadeInUp}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              Why Farmers Choose Us
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Smart Farming Solutions
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Integrated technology and expertise for modern agricultural success
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
                className="group bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl border border-gray-200 dark:border-gray-700 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
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
                <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-4 py-2 rounded-full text-sm font-medium mb-4">
                  <Lightbulb className="w-4 h-4" />
                  Our Core Values
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Principles That Guide Us
                </h2>
              </div>

              <div className="space-y-6">
                {values.map((value, i) => (
                  <motion.div
                    key={i}
                    variants={fadeInUp}
                    whileHover={{ x: 8 }}
                    className="flex items-start gap-5 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700"
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                      {value.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white mb-1">{value.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
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
                Start Your Journey Today
              </h2>
              <p className="text-emerald-100 text-lg mb-8 text-center max-w-md mx-auto">
                Join thousands of successful farmers transforming their farms with expert guidance.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                <button className="bg-white text-emerald-600 hover:bg-gray-100 font-bold py-4 px-8 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg">
                  <PhoneCall className="w-5 h-5" />
                  Get Started Free
                </button>
                <button className="border-2 border-white text-white hover:bg-white hover:text-emerald-600 font-bold py-4 px-8 rounded-xl transition-all duration-300">
                  Learn More
                </button>
              </div>

              <p className="text-center text-emerald-200 text-sm">
                Free 30-day trial • No credit card required
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
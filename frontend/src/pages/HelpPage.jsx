import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { 
  MessageSquare,
  Phone,
  Mail,
  Clock,
  ChevronDown,
  Search,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Zap,
  Shield,
  Users,
  LifeBuoy
} from 'lucide-react';

const HelpPage = () => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFaq, setActiveFaq] = useState(null);
  const [hoveredSupport, setHoveredSupport] = useState(null);

  // FAQ data
  const faqs = [
    {
      id: 1,
      question: 'How do I register as a farmer?',
      answer: 'Click on the "Register" button in the navigation bar, select "Farmer" as your role, and fill in your details including county location, experience level, and crops you grow.',
      category: 'Getting Started'
    },
    {
      id: 2,
      question: 'How can I book a consultation with an expert?',
      answer: 'Go to the Experts section in your dashboard, browse available experts, and click "Book Now". You can choose between free consultations or paid sessions with verified experts.',
      category: 'Consultations'
    },
    {
      id: 3,
      question: 'What payment methods are accepted?',
      answer: 'We accept M-Pesa, Airtel Money, and major credit/debit cards. All transactions are secure and encrypted.',
      category: 'Payments'
    },
    {
      id: 4,
      question: 'How do I update my crop information?',
      answer: 'Navigate to "My Crops" in your dashboard, click on a crop card, and use the edit button to update details like planting date, expected yield, or issues.',
      category: 'Crops Management'
    },
    {
      id: 5,
      question: 'How can I become a verified expert?',
      answer: 'Apply through the Expert Registration form with your credentials, experience certificates, and areas of specialization. Our team will review and verify within 48 hours.',
      category: 'Experts'
    },
    {
      id: 6,
      question: 'Is my data secure?',
      answer: 'Yes, we use end-to-end encryption and comply with data protection regulations. Your personal and farm data is never shared with third parties without consent.',
      category: 'Privacy & Security'
    }
  ];

  // Support channels
  const supportChannels = [
    {
      id: 'live-chat',
      icon: <MessageSquare className="w-6 h-6" />,
      title: 'Live Chat',
      description: 'Chat instantly with our support team',
      availability: '24/7',
      responseTime: 'Instant',
      color: 'from-blue-500 to-cyan-500',
      action: 'Start Chat',
      contact: 'Chat Now'
    },
    {
      id: 'phone',
      icon: <Phone className="w-6 h-6" />,
      title: 'Phone Support',
      description: 'Direct call support',
      availability: 'Mon-Fri, 8AM-6PM',
      responseTime: 'Immediate',
      color: 'from-emerald-500 to-green-500',
      action: 'Call Now',
      contact: '+254 700 123 456'
    },
    {
      id: 'email',
      icon: <Mail className="w-6 h-6" />,
      title: 'Email Support',
      description: 'Detailed assistance via email',
      availability: '24/7',
      responseTime: 'Within 24 hours',
      color: 'from-purple-500 to-pink-500',
      action: 'Send Email',
      contact: 'support@mkulimahub.co.ke'
    }
  ];

  // Quick links
  const quickLinks = [
    {
      title: 'User Guides',
      description: 'Step-by-step tutorials',
      icon: <Zap className="w-5 h-5" />,
      link: '/guides'
    },
    {
      title: 'Privacy Policy',
      description: 'How we protect your data',
      icon: <Shield className="w-5 h-5" />,
      link: '/privacy'
    },
    {
      title: 'Community',
      description: 'Connect with other farmers',
      icon: <Users className="w-5 h-5" />,
      link: '/forum'
    },
    {
      title: 'Emergency Help',
      description: 'Urgent crop issues',
      icon: <AlertCircle className="w-5 h-5" />,
      link: '/emergency'
    }
  ];

  // Filter FAQs based on search
  const filteredFaqs = searchQuery 
    ? faqs.filter(faq => 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqs;

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-b from-gray-50 to-white'
    }`}>
      {/* Header */}
      <div className="container mx-auto px-4 pt-8 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 shadow-lg shadow-emerald-500/25">
              <LifeBuoy className="w-6 h-6 text-white" />
            </div>
            <h1 className={`text-3xl md:text-4xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Help & Support
            </h1>
          </div>

          {/* Search Bar */}
          <div className="relative group mb-12">
            <div className={`absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200`}></div>
            <div className="relative">
              <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                theme === 'dark' ? 'text-gray-400 group-hover:text-emerald-400' : 'text-gray-400 group-hover:text-emerald-500'
              }`} />
              <input
                type="text"
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-12 pr-4 py-4 rounded-xl border focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm ${
                  theme === 'dark'
                    ? 'bg-gray-800/80 border-gray-700 text-white placeholder-gray-400'
                    : 'bg-white/80 border-gray-200 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-16">
        {/* FAQ Section - Moved to Top */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className={`text-2xl font-bold flex items-center gap-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              <HelpCircle className="w-5 h-5 text-emerald-500" />
              Frequently Asked Questions
            </h2>
            <div className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 ${
              theme === 'dark'
                ? 'bg-gray-800 text-gray-300'
                : 'bg-gray-100 text-gray-600'
            }`}>
              {filteredFaqs.length} questions
            </div>
          </div>

          <div className="max-w-4xl mx-auto space-y-3">
            {filteredFaqs.map((faq) => (
              <div
                key={faq.id}
                className={`rounded-xl border backdrop-blur-sm transition-all duration-500 overflow-hidden ${
                  theme === 'dark'
                    ? 'bg-gray-800/80 border-gray-700'
                    : 'bg-white/80 border-gray-200'
                } ${activeFaq === faq.id ? 'ring-2 ring-emerald-500/30' : ''}`}
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === faq.id ? null : faq.id)}
                  className="w-full px-6 py-4 flex items-center justify-between group"
                >
                  <div className="text-left">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium transition-colors duration-300 ${
                        theme === 'dark'
                          ? 'bg-gray-700 text-gray-300 group-hover:bg-emerald-900/30 group-hover:text-emerald-300'
                          : 'bg-gray-100 text-gray-600 group-hover:bg-emerald-100 group-hover:text-emerald-700'
                      }`}>
                        {faq.category}
                      </span>
                    </div>
                    <h3 className={`font-medium text-left transition-colors duration-300 ${
                      theme === 'dark' 
                        ? 'text-white group-hover:text-emerald-300' 
                        : 'text-gray-900 group-hover:text-emerald-600'
                    }`}>
                      {faq.question}
                    </h3>
                  </div>
                  <ChevronDown className={`w-5 h-5 transition-all duration-500 ${
                    theme === 'dark' 
                      ? 'text-gray-400 group-hover:text-emerald-400' 
                      : 'text-gray-500 group-hover:text-emerald-500'
                  } ${activeFaq === faq.id ? 'rotate-180 text-emerald-500' : ''}`} />
                </button>
                
                {/* Animated Answer */}
                <div 
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${
                    activeFaq === faq.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className={`px-6 pb-4 border-t ${
                    theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                  }`}>
                    <p className={`mt-4 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {filteredFaqs.length === 0 && (
              <div className={`text-center py-12 rounded-xl border backdrop-blur-sm transition-all duration-500 ${
                theme === 'dark'
                  ? 'bg-gray-800/80 border-gray-700'
                  : 'bg-white/80 border-gray-200'
              }`}>
                <Search className={`w-12 h-12 mx-auto mb-4 transition-colors duration-500 ${
                  theme === 'dark' ? 'text-gray-600' : 'text-gray-300'
                }`} />
                <h3 className={`text-lg font-semibold mb-2 transition-colors duration-500 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  No results found
                </h3>
                <p className={`transition-colors duration-500 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Try searching with different keywords
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Support Channels - Moved to Middle */}
        <div className="mb-16">
          <h2 className={`text-2xl font-bold mb-8 flex items-center gap-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            <MessageSquare className="w-5 h-5 text-emerald-500" />
            Get in Touch
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {supportChannels.map((channel) => (
              <div 
                key={channel.id}
                onMouseEnter={() => setHoveredSupport(channel.id)}
                onMouseLeave={() => setHoveredSupport(null)}
                className={`relative group transition-all duration-500 ${
                  hoveredSupport === channel.id ? 'transform -translate-y-1' : ''
                }`}
              >
                {/* Glow Effect */}
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${channel.color} rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-500`}></div>
                
                {/* Card */}
                <div className={`relative rounded-2xl p-6 border backdrop-blur-sm transition-all duration-500 ${
                  theme === 'dark'
                    ? 'bg-gray-800/80 border-gray-700 group-hover:border-emerald-500/50'
                    : 'bg-white/80 border-gray-200 group-hover:border-emerald-400/50'
                }`}>
                  {/* Icon */}
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${channel.color} mb-6 transform transition-transform duration-500 ${
                    hoveredSupport === channel.id ? 'scale-110 rotate-3' : ''
                  }`}>
                    <div className="text-white">{channel.icon}</div>
                  </div>

                  {/* Content */}
                  <div className="space-y-4">
                    <div>
                      <h3 className={`text-lg font-semibold mb-1 ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {channel.title}
                      </h3>
                      <p className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {channel.description}
                      </p>
                    </div>

                    {/* Details */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className={`w-4 h-4 ${
                          theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                        }`} />
                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                          {channel.availability}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className={`w-4 h-4 ${
                          theme === 'dark' ? 'text-emerald-400' : 'text-emerald-500'
                        }`} />
                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                          {channel.responseTime} response
                        </span>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className={`mt-4 p-3 rounded-lg transition-all duration-300 ${
                      theme === 'dark'
                        ? 'bg-gray-700/50 group-hover:bg-gray-700'
                        : 'bg-gray-100/50 group-hover:bg-gray-100'
                    }`}>
                      <div className={`text-sm font-medium ${
                        theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
                      }`}>
                        {channel.contact}
                      </div>
                    </div>

                    {/* Action Button */}
                    <button className={`w-full py-3 rounded-xl font-medium transition-all duration-300 transform ${
                      theme === 'dark'
                        ? 'bg-gradient-to-r from-gray-700 to-gray-800 hover:from-emerald-700 hover:to-emerald-800 text-white hover:scale-[1.02]'
                        : 'bg-gradient-to-r from-gray-100 to-gray-200 hover:from-emerald-500 hover:to-emerald-600 text-gray-800 hover:text-white hover:scale-[1.02]'
                    }`}>
                      {channel.action}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links - Moved to Bottom */}
        <div>
          <h2 className={`text-2xl font-bold mb-8 flex items-center gap-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            <Zap className="w-5 h-5 text-emerald-500" />
            Quick Links
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {quickLinks.map((link, index) => (
              <a
                key={index}
                href={link.link}
                className={`group relative rounded-xl p-5 border backdrop-blur-sm transition-all duration-500 overflow-hidden ${
                  theme === 'dark'
                    ? 'bg-gray-800/80 border-gray-700 hover:border-emerald-500/50'
                    : 'bg-white/80 border-gray-200 hover:border-emerald-400/50'
                }`}
              >
                {/* Hover Background */}
                <div className={`absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg transition-colors duration-500 ${
                      theme === 'dark'
                        ? 'bg-gray-700 group-hover:bg-emerald-900/30'
                        : 'bg-gray-100 group-hover:bg-emerald-100'
                    }`}>
                      <div className={`transition-colors duration-500 ${
                        theme === 'dark'
                          ? 'text-gray-300 group-hover:text-emerald-400'
                          : 'text-gray-600 group-hover:text-emerald-500'
                      }`}>
                        {link.icon}
                      </div>
                    </div>
                    <ExternalLink className={`w-5 h-5 transition-all duration-500 transform group-hover:translate-x-1 group-hover:-translate-y-1 ${
                      theme === 'dark' 
                        ? 'text-gray-500 group-hover:text-emerald-400' 
                        : 'text-gray-400 group-hover:text-emerald-500'
                    }`} />
                  </div>
                  
                  <h3 className={`font-semibold mb-2 transition-colors duration-500 ${
                    theme === 'dark' 
                      ? 'text-white group-hover:text-emerald-300' 
                      : 'text-gray-900 group-hover:text-emerald-600'
                  }`}>
                    {link.title}
                  </h3>
                  <p className={`text-sm transition-colors duration-500 ${
                    theme === 'dark' 
                      ? 'text-gray-400 group-hover:text-gray-300' 
                      : 'text-gray-600 group-hover:text-gray-700'
                  }`}>
                    {link.description}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
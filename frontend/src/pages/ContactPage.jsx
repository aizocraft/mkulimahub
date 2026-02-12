import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { 
  Mail, 
  Phone, 
  MapPin, 
  MessageCircle,
  User,
  Send,
  Clock,
  Globe,
  CheckCircle,
  Sparkles,
  Star,
  Shield,
  Users,
  Target
} from 'lucide-react';

const ContactPage = () => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setResult("Sending....");
    const formDataToSend = new FormData(event.target);
    formDataToSend.append("access_key", "c60950a6-f19d-465f-b72f-681e1ab34cf9");

    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      body: formDataToSend
    });

    const data = await response.json();
    if (data.success) {
      setResult("Form Submitted Successfully");
      event.target.reset();
      setFormData({ name: '', email: '', subject: '', message: '' });
    } else {
      setResult("Error");
    }
    setIsSubmitting(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const contactMethods = [
     {
      icon: <Phone className="w-5 h-5" />,
      title: "Phone",
      details: "+254 711 123 456",
      color: "from-emerald-500 to-green-500"
    },
    {
      icon: <Mail className="w-5 h-5" />,
      title: "Email",
      details: "support@mkulimahub.com",
      color: "from-blue-500 to-cyan-500"
    }
  ];

  const supportFeatures = [
    {
      icon: <Globe className="w-4 h-4" />,
      text: "Multilingual support"
    },
    {
      icon: <CheckCircle className="w-4 h-4" />,
      text: "Certified experts"
    },
    {
      icon: <Shield className="w-4 h-4" />,
      text: "Secure & private"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-emerald-900/20 transition-colors duration-300">
      
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-r from-emerald-500 via-green-500 to-cyan-500 overflow-hidden pt-12">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl animate-float"></div>
          <div className="absolute top-0 right-0 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl animate-float" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl animate-float" style={{animationDelay: '4s'}}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4 leading-tight">
              Contact Us
            </h1>

          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg 
            className="w-full h-12 text-green-50 dark:text-gray-900" 
            viewBox="0 0 1200 120" 
            preserveAspectRatio="none"
          >
            <path 
              d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
              opacity=".25" 
              className="fill-current"
            ></path>
            <path 
              d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
              opacity=".5" 
              className="fill-current"
            ></path>
            <path 
              d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
              className="fill-current"
            ></path>
          </svg>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 lg:py-16 -mt-1">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Contact Methods - Left Side */}
            <div className="lg:col-span-1 space-y-6">
              <div className="text-center lg:text-left mb-6">
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                  How Can We Help You?
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  Choose your preferred way to connect
                </p>
              </div>

              {contactMethods.map((method, index) => (
                <div
                  key={index}
                  className="group p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700 transition-all duration-300 cursor-pointer hover:translate-y-1"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${method.color} rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-200 shadow-lg`}>
                      {method.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">
                        {method.title}
                      </h3>

                      <p className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
                        {method.details}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Support Features */}
              <div className="bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="w-5 h-5" />
                  <h3 className="font-bold text-lg">Support Features</h3>
                </div>
                <div className="space-y-3">
                  {supportFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                        {feature.icon}
                      </div>
                      <span className="text-green-100 text-sm">{feature.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Form - Right Side */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700 h-full">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Send className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Send us a Message</h2>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">We'll connect you with the right expert</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Your Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                          type="text"
                          id="name"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 transform focus:scale-[1.02] text-base"
                          placeholder="Enter your full name"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                          type="email"
                          id="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200 text-base"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Subject *
                    </label>
                    <div className="relative">
                      <MessageCircle className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        required
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 transform focus:scale-[1.02] text-base"
                        placeholder="Enter your subject"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Describe your farming challenge *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows="5"
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 transform focus:scale-[1.02] text-base resize-none"
                      placeholder="Tell us about your specific farming situation, crops, and challenges..."
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 disabled:opacity-50 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-emerald-500/50 flex items-center justify-center gap-3 text-base"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Send Message
                      </>
                    )}
                  </button>

                  {result && (
                    <div className={`mt-4 p-4 rounded-xl text-center font-semibold transition-all duration-500 ${
                      result === "Form Submitted Successfully"
                        ? "bg-green-100 text-green-800 border border-green-200 animate-fade-in"
                        : result === "Error"
                        ? "bg-red-100 text-red-800 border border-red-200 animate-fade-in"
                        : "bg-blue-100 text-blue-800 border border-blue-200"
                    }`}>
                      {result}
                    </div>
                  )}

                </form>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
};

export default ContactPage;
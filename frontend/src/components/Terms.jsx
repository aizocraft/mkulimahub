import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, FileText, Shield, Scale, Mail } from 'lucide-react';

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900/20 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link 
          to="/register" 
          className="inline-flex items-center text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Registration
        </Link>

        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
              <FileText className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Terms and Conditions
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Last updated: February 2026
              </p>
            </div>
          </div>

          <div className="prose prose-emerald max-w-none dark:prose-invert">
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Welcome to Mkulima Hub. By accessing or using our platform, you agree to be bound by these Terms and Conditions. 
              Please read them carefully before creating an account or using our services.
            </p>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-6">
          {/* Section 1 */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
            <div className="flex items-start space-x-3 mb-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mt-1">
                <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  1. Account Registration
                </h2>
                <div className="space-y-2 text-gray-600 dark:text-gray-300">
                  <p>• You must provide accurate, current, and complete information during registration.</p>
                  <p>• You are responsible for maintaining the security of your account credentials.</p>
                  <p>• You must be at least 18 years old to create an account.</p>
                  <p>• One person may not maintain more than one account.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
            <div className="flex items-start space-x-3 mb-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg mt-1">
                <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  2. Platform Usage Guidelines
                </h2>
                <div className="space-y-2 text-gray-600 dark:text-gray-300">
                  <p>• Users must treat all community members with respect and professionalism.</p>
                  <p>• No harassment, hate speech, or discriminatory content is allowed.</p>
                  <p>• Do not post false or misleading information about agricultural practices.</p>
                  <p>• Respect intellectual property rights of other users and the platform.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
            <div className="flex items-start space-x-3 mb-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg mt-1">
                <Scale className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  3. Consultation and Payment Terms
                </h2>
                <div className="space-y-2 text-gray-600 dark:text-gray-300">
                  <p>• Consultations are binding agreements between farmers and agricultural experts.</p>
                  <p>• Payments are processed securely through M-Pesa integration.</p>
                  <p>• Cancellation policies: Free cancellation up to 24 hours before scheduled consultation.</p>
                  <p>• Refunds are processed within 3-5 business days for eligible cancellations.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4 */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
            <div className="flex items-start space-x-3 mb-4">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg mt-1">
                <FileText className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  4. Expert Responsibilities
                </h2>
                <div className="space-y-2 text-gray-600 dark:text-gray-300">
                  <p>• Experts must verify their agricultural credentials before offering services.</p>
                  <p>• Provide accurate, evidence-based agricultural advice.</p>
                  <p>• Respond to consultation requests within 24 hours.</p>
                  <p>• Maintain professional conduct during all video consultations.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 5 */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
            <div className="flex items-start space-x-3 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg mt-1">
                <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  5. Account Termination
                </h2>
                <div className="space-y-2 text-gray-600 dark:text-gray-300">
                  <p>• We reserve the right to suspend or terminate accounts that violate our terms.</p>
                  <p>• Users may delete their accounts at any time through account settings.</p>
                  <p>• Repeated violations may result in permanent ban from the platform.</p>
                  <p>• Fraudulent activity will result in immediate termination and legal action.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 6 */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
            <div className="flex items-start space-x-3 mb-4">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg mt-1">
                <Mail className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  6. Contact Information
                </h2>
                <div className="space-y-2 text-gray-600 dark:text-gray-300">
                  <p>If you have any questions about these Terms and Conditions, please contact us:</p>
                  <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <p className="flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-emerald-600" />
                      Email: legal@mkulimahub.com
                    </p>
                    <p className="mt-2 text-sm">
                      Response time: Within 48 hours on business days
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

    
      </div>
    </div>
  );
};

export default TermsPage;
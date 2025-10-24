import { useState } from 'react';
import { MessageCircle, Search, Filter, Clock, User, ThumbsUp, Eye } from 'lucide-react';

const Questions = () => {
  const [activeFilter, setActiveFilter] = useState('unanswered');
  const [searchTerm, setSearchTerm] = useState('');

  const questions = [
    {
      id: 1,
      question: 'Best fertilizer for tomato plants in clay soil?',
      client: 'Sarah K.',
      time: '2 hours ago',
      status: 'unanswered',
      category: 'Soil & Fertilizer',
      views: 24,
      upvotes: 3
    },
    {
      id: 2,
      question: 'How to control aphids organically without pesticides?',
      client: 'David M.',
      time: '5 hours ago',
      status: 'unanswered',
      category: 'Pest Control',
      views: 18,
      upvotes: 5
    },
    {
      id: 3,
      question: 'Soil pH testing methods for small-scale farmers?',
      client: 'Grace W.',
      time: '1 day ago',
      status: 'answered',
      category: 'Soil & Fertilizer',
      views: 42,
      upvotes: 8
    },
    {
      id: 4,
      question: 'When is the best time to plant maize in Central Kenya?',
      client: 'James N.',
      time: '2 days ago',
      status: 'answered',
      category: 'Planting',
      views: 56,
      upvotes: 12
    }
  ];

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         q.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === 'all' || q.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const handleAnswerQuestion = (id) => {
    console.log('Answer question:', id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Questions & Answers</h2>
          <p className="text-gray-600 dark:text-gray-400">Help farmers by answering their questions</p>
        </div>
        <div className="mt-4 sm:mt-0 text-right">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-semibold text-purple-600 dark:text-purple-400">12</span> questions answered this week
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-4">
            <select 
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="all">All Questions</option>
              <option value="unanswered">Unanswered</option>
              <option value="answered">Answered</option>
            </select>
            <button className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
              <Filter size={18} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.map(question => (
          <div key={question.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1 mb-4 lg:mb-0">
                <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">
                  {question.question}
                </h3>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                  <div className="flex items-center space-x-1">
                    <User size={14} />
                    <span>by {question.client}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock size={14} />
                    <span>{question.time}</span>
                  </div>
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs">
                    {question.category}
                  </span>
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Eye size={14} />
                    <span>{question.views} views</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <ThumbsUp size={14} />
                    <span>{question.upvotes} upvotes</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  question.status === 'unanswered' 
                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                    : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                }`}>
                  {question.status === 'unanswered' ? 'Needs Answer' : 'Answered'}
                </div>
                
                {question.status === 'unanswered' && (
                  <button 
                    onClick={() => handleAnswerQuestion(question.id)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200 text-sm whitespace-nowrap"
                  >
                    Answer Question
                  </button>
                )}
                {question.status === 'answered' && (
                  <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors duration-200 text-sm">
                    View Answers
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredQuestions.length === 0 && (
          <div className="text-center py-12">
            <MessageCircle className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No questions found</h3>
            <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Questions;
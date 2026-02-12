// src/pages/ForumPages.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { forumAPI } from '../api';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  TrendingUp,
  MessageSquare,
  Eye,
  ThumbsUp,
  ThumbsDown,
  CheckCircle,
  Star,
  Clock,
  AlertCircle,
  Lock,
  Pin,
  Plus,
  Edit,
  Trash2,
  ChevronRight,
  Users,
  FileText,
  MessageCircle,
  BarChart3,
  Loader2,
  Heart,
  Bookmark,
  Share2
} from 'lucide-react';
import AttachmentDisplay from '../components/AttachmentDisplay';
import socketService from '../services/socketService';

const ForumPages = () => {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { theme } = useTheme();
  const { t } = useTranslation('forum');
  const navigate = useNavigate();
  
  // State with localStorage persistence
  const [activeTab, setActiveTab] = useState(() => {
    try {
      return localStorage.getItem('forumActiveTab') || 'all';
    } catch {
      return 'all';
    }
  });
  const [categories, setCategories] = useState([]);
  const [posts, setPosts] = useState([]);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [votedPosts, setVotedPosts] = useState(() => {
    try {
      const saved = localStorage.getItem('forumVotedPosts');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [votingPostId, setVotingPostId] = useState(null);

  // Filters with localStorage persistence
  const [filters, setFilters] = useState(() => {
    try {
      const saved = localStorage.getItem('forumFilters');
      return saved ? JSON.parse(saved) : {
        category: '',
        sortBy: 'newest',
        search: ''
      };
    } catch {
      return {
        category: '',
        sortBy: 'newest',
        search: ''
      };
    }
  });

  // Check if user can moderate
  const canModerate = user?.role === 'admin' || user?.role === 'expert';

  // Persist states to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('forumActiveTab', activeTab);
    } catch (error) {
      console.warn('Failed to save activeTab to localStorage:', error);
    }
  }, [activeTab]);

  useEffect(() => {
    try {
      localStorage.setItem('forumFilters', JSON.stringify(filters));
    } catch (error) {
      console.warn('Failed to save filters to localStorage:', error);
    }
  }, [filters]);

  useEffect(() => {
    try {
      localStorage.setItem('forumVotedPosts', JSON.stringify(votedPosts));
    } catch (error) {
      console.warn('Failed to save votedPosts to localStorage:', error);
    }
  }, [votedPosts]);

  // Fetch data
  useEffect(() => {
    if (isAuthLoading) return;
    fetchForumData();
  }, [filters, activeTab, user?.id, isAuthLoading]);

  // Initialize socket for real-time updates
  useEffect(() => {
    if (user?.id && !isAuthLoading) {
      const token = localStorage.getItem('token');
      socketService.initialize(token, user.id);
      socketService.joinForum();

      const handleVoteUpdate = (data) => {
        const { postId, stats, userVote } = data;
        setPosts(currentPosts =>
          currentPosts.map(post =>
            post.id === postId
              ? { ...post, stats, userVote: userVote || null }
              : post
          )
        );
      };

      const handleReactionUpdate = (data) => {
        const { postId, reactionType, userId: reactingUserId } = data;
        if (reactingUserId !== user.id) {
          toast.info(t('reactionNotification', { reaction: reactionType }), {
            position: 'top-center',
            autoClose: 2000,
            hideProgressBar: true
          });
        }
      };

      socketService.on('forum:vote-update', handleVoteUpdate);
      socketService.on('forum:reaction-update', handleReactionUpdate);

      return () => {
        socketService.off('forum:vote-update', handleVoteUpdate);
        socketService.off('forum:reaction-update', handleReactionUpdate);
        socketService.leaveForum();
      };
    }
  }, [user?.id, isAuthLoading, t]);

  const fetchForumData = async () => {
    try {
      setIsLoading(true);
      setError('');

      const categoriesResponse = await forumAPI.getCategories();
      setCategories(categoriesResponse.data.categories || []);

      const postParams = {
        category: filters.category,
        sortBy: filters.sortBy,
        search: filters.search,
        limit: 10
      };
      const postsResponse = await forumAPI.getPosts(postParams);
      const fetchedPosts = postsResponse.data.posts || [];
      setPosts(fetchedPosts);

      const newVoteMap = { ...votedPosts };
      fetchedPosts.forEach(p => {
        if (newVoteMap[p.id] === undefined) {
          newVoteMap[p.id] = p.userVote || null;
        }
      });
      setVotedPosts(newVoteMap);

      if (canModerate && activeTab === 'moderation') {
        const reviewsResponse = await forumAPI.getPendingReviews();
        setPendingReviews(reviewsResponse.data.items || []);
      }

      const statsResponse = await forumAPI.getForumStats();
      setStats(statsResponse.data.stats);

    } catch (err) {
      console.error('Error fetching forum data:', err);
      setError(t('error.loadFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return t('date.unknown');
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffHours < 1) return t('date.justNow');
    if (diffHours < 24) return t('date.hoursAgo', { hours: diffHours });
    return date.toLocaleDateString();
  };

  const handleVote = async (postId, voteType) => {
    if (!isAuthenticated()) {
      toast.info(t('vote.loginRequired'), { position: 'top-center' });
      navigate('/login');
      return;
    }

    try {
      setVotingPostId(postId);

      const response = await forumAPI.votePost(postId, voteType);

      setPosts(currentPosts => currentPosts.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            stats: response.data.stats,
            userVote: response.data.userVote || null,
            voteDifference: response.data.voteDifference
          };
        }
        return p;
      }));

      setVotedPosts(prev => ({
        ...prev,
        [postId]: response.data.userVote || null
      }));

      const newUserVote = response.data.userVote;
      if (newUserVote === voteType) {
        if (voteType === 'upvote') {
          toast.success(t('vote.upvoted'), {
            position: 'top-center',
            autoClose: 1500,
            hideProgressBar: true
          });
        } else if (voteType === 'downvote') {
          toast.info(t('vote.downvoted'), {
            position: 'top-center',
            autoClose: 1500,
            hideProgressBar: true
          });
        }
      } else if (newUserVote === null) {
        toast.info(t('vote.removed'), {
          position: 'top-center',
          autoClose: 1500,
          hideProgressBar: true
        });
      } else if (newUserVote !== voteType) {
        if (newUserVote === 'upvote') {
          toast.success(t('vote.changedToUpvote'), {
            position: 'top-center',
            autoClose: 1500,
            hideProgressBar: true
          });
        } else if (newUserVote === 'downvote') {
          toast.info(t('vote.changedToDownvote'), {
            position: 'top-center',
            autoClose: 1500,
            hideProgressBar: true
          });
        }
      }
    } catch (err) {
      console.error('Error voting:', err);
      await fetchForumData();
      const errorMsg = err.response?.data?.message || t('vote.error');
      toast.error(errorMsg, {
        position: 'top-center',
        autoClose: 3000
      });
    } finally {
      setVotingPostId(null);
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm(t('delete.confirm'))) return;

    try {
      await forumAPI.deletePost(postId);
      setPosts(prev => prev.filter(post => post.id !== postId));
      toast.success(t('delete.success'), { 
        position: 'top-center',
        autoClose: 2000 
      });
    } catch (err) {
      console.error('Error deleting post:', err);
      const errorMsg = err.response?.data?.message || t('delete.error');
      toast.error(errorMsg, { 
        position: 'top-center',
        autoClose: 3000 
      });
    }
  };

  const handleModerate = async (type, id, action, reason = '') => {
    try {
      if (action === 'approve') {
        await forumAPI.approveContent(type, id, t('moderation.approvedReason'));
        toast.success(t('moderation.approved'), { 
          position: 'top-center',
          autoClose: 2000 
        });
      } else {
        await forumAPI.rejectContent(type, id, reason);
        toast.info(t('moderation.rejected'), { 
          position: 'top-center',
          autoClose: 2000 
        });
      }
      
      setPendingReviews(prev => prev.filter(item => 
        !(item.type === type && item.item._id === id)
      ));
      
      fetchForumData();
    } catch (err) {
      console.error('Error moderating content:', err);
      const errorMsg = err.response?.data?.message || t('moderation.error');
      toast.error(errorMsg, { 
        position: 'top-center',
        autoClose: 3000 
      });
    }
  };

  const tabs = [
    { id: 'all', label: t('tabs.all'), icon: <FileText className="w-4 h-4" /> },
    { id: 'my', label: t('tabs.myPosts'), icon: <MessageSquare className="w-4 h-4" /> },
    ...(canModerate ? [{ 
      id: 'moderation', 
      label: t('tabs.moderation'), 
      icon: <AlertCircle className="w-4 h-4" />,
      badge: pendingReviews.length 
    }] : []),
    { id: 'stats', label: t('tabs.stats'), icon: <BarChart3 className="w-4 h-4" /> }
  ];

  const filteredPosts = activeTab === 'my' && user
    ? posts.filter(post => post.author?._id === user.id || post.author === user.id)
    : posts;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-gray-900 text-gray-100' 
        : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Header */}
      <div className={`transition-colors duration-300 ${
        theme === 'dark' 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      } border-b`}>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">{t('title')}</h1>
              <p className={`mt-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {t('subtitle')}
              </p>
            </div>
            
            {isAuthenticated() && (
              <button
                onClick={() => navigate('/forum/create')}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
              >
                <Plus className="w-5 h-5 mr-2" />
                {t('createPost')}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className={`rounded-lg shadow-sm p-4 mb-6 transition-colors duration-300 ${
          theme === 'dark' 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        } border`}>
          <form onSubmit={(e) => { e.preventDefault(); fetchForumData(); }} className="space-y-4 md:space-y-0 md:grid md:grid-cols-4 md:gap-4">
            <div>
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
                }`} />
                <input
                  type="text"
                  placeholder={t('filters.search')}
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  className={`w-full pl-10 pr-3 py-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200 ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300'
                  } border`}
                />
              </div>
            </div>
            
            <div>
              <div className="relative">
                <Filter className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
                }`} />
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({...filters, category: e.target.value})}
                  className={`w-full pl-10 pr-3 py-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none transition-colors duration-200 ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                  } border`}
                >
                  <option value="">{t('filters.allCategories')}</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <ChevronRight className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 rotate-90 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
                }`} />
              </div>
            </div>
            
            <div>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200 ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300'
                } border`}
              >
                <option value="newest">{t('filters.newest')}</option>
                <option value="trending">{t('filters.trending')}</option>
                <option value="most_commented">{t('filters.mostCommented')}</option>
                <option value="most_voted">{t('filters.mostVoted')}</option>
              </select>
            </div>
            
            <div>
              <button
                type="submit"
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
              >
                {t('filters.apply')}
              </button>
            </div>
          </form>
        </div>

        {/* Tabs */}
        <div className={`rounded-lg shadow-sm mb-6 overflow-hidden transition-colors duration-300 ${
          theme === 'dark' 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        } border`}>
          <div className={`border-b ${
            theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <nav className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-6 py-3 border-b-2 font-medium whitespace-nowrap transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-green-600 text-green-600'
                      : `border-transparent ${
                          theme === 'dark' 
                            ? 'text-gray-400 hover:text-gray-300' 
                            : 'text-gray-500 hover:text-gray-700'
                        }`
                  }`}
                >
                  {tab.icon}
                  <span className="ml-2">{tab.label}</span>
                  {tab.badge > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className={`mb-6 p-4 rounded-lg transition-colors duration-300 ${
            theme === 'dark' 
              ? 'bg-red-900/20 border-red-800' 
              : 'bg-red-50 border-red-200'
          } border`}>
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <p className={theme === 'dark' ? 'text-red-300' : 'text-red-700'}>{error}</p>
            </div>
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-12 h-12 text-green-600 animate-spin" />
          </div>
        ) : activeTab === 'stats' ? (
          <StatsTab stats={stats} categories={categories} theme={theme} t={t} />
        ) : activeTab === 'moderation' ? (
          <ModerationTab 
            pendingReviews={pendingReviews} 
            onModerate={handleModerate}
            canModerate={canModerate}
            theme={theme}
            t={t}
          />
        ) : (
          <PostsTab 
            posts={filteredPosts}
            user={user}
            onVote={handleVote}
            onDelete={handleDelete}
            canModerate={canModerate}
            formatDate={formatDate}
            activeTab={activeTab}
            isAuthenticated={isAuthenticated}
            navigate={navigate}
            theme={theme}
            votingPostId={votingPostId}
            setVotingPostId={setVotingPostId}
            votedPosts={votedPosts}
            setVotedPosts={setVotedPosts}
            t={t}
          />
        )}
      </div>
    </div>
  );
};

// Stats Tab Component
const StatsTab = ({ stats, categories, theme, t }) => {
  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { value: stats.totalPosts || 0, label: t('stats.totalPosts') },
          { value: stats.totalComments || 0, label: t('stats.totalComments') },
          { value: stats.postsToday || 0, label: t('stats.postsToday') },
          { value: stats.totalUsers || 0, label: t('stats.activeUsers') },
        ].map((stat, index) => (
          <div 
            key={index}
            className={`p-6 rounded-lg shadow-sm transition-colors duration-300 ${
              theme === 'dark' 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            } border`}
          >
            <div className="text-3xl font-bold">{stat.value}</div>
            <div className={`mt-1 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Top Categories */}
      <div className={`rounded-lg shadow-sm p-6 transition-colors duration-300 ${
        theme === 'dark' 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      } border`}>
        <h3 className={`text-lg font-semibold mb-4 ${
          theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
        }`}>{t('stats.topCategories')}</h3>
        <div className="space-y-3">
          {(stats.topCategories || []).slice(0, 5).map((category) => (
            <div key={category._id} className="flex items-center justify-between">
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-3" 
                  style={{ backgroundColor: category.color || '#4CAF50' }}
                />
                <span className={theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}>
                  {category.name}
                </span>
              </div>
              <div className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                {t('stats.postCount', { count: category.postCount || 0 })} • {t('stats.commentCount', { count: category.commentCount || 0 })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className={`rounded-lg shadow-sm p-6 transition-colors duration-300 ${
        theme === 'dark' 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      } border`}>
        <h3 className={`text-lg font-semibold mb-4 ${
          theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
        }`}>{t('stats.recentActivity')}</h3>
        <div className="space-y-3">
          {(stats.recentActivity || []).map((post) => (
            <Link
              key={post._id}
              to={`/forum/posts/${post._id}`}
              className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${
                theme === 'dark' 
                  ? 'hover:bg-gray-700' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex-shrink-0">
                {post.author?.profilePicture ? (
                  <img 
                    src={post.author.profilePicture} 
                    alt={post.author.name}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    theme === 'dark' ? 'bg-green-900' : 'bg-green-100'
                  }`}>
                    <span className={theme === 'dark' ? 'text-green-300' : 'text-green-600'}>
                      {post.author?.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                )}
              </div>
              <div className="ml-3 flex-1">
                <h4 className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                }`}>{post.title}</h4>
                <p className={`text-xs ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {t('stats.byAuthor', { author: post.author?.name })} • {new Date(post.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className={`text-xs px-2 py-1 rounded ${
                theme === 'dark' 
                  ? 'bg-gray-700 text-gray-300' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {post.category?.name}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

// Moderation Tab Component
const ModerationTab = ({ pendingReviews, onModerate, canModerate, theme, t }) => {
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  if (!canModerate) {
    return (
      <div className={`rounded-lg p-4 transition-colors duration-300 ${
        theme === 'dark' 
          ? 'bg-yellow-900/20 border-yellow-800' 
          : 'bg-yellow-50 border-yellow-200'
      } border`}>
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-yellow-500 mr-2" />
          <p className={theme === 'dark' ? 'text-yellow-300' : 'text-yellow-700'}>
            {t('moderation.noPermission')}
          </p>
        </div>
      </div>
    );
  }

  if (pendingReviews.length === 0) {
    return (
      <div className={`rounded-lg p-8 text-center transition-colors duration-300 ${
        theme === 'dark' 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      } border`}>
        <AlertCircle className={`w-12 h-12 mx-auto mb-4 ${
          theme === 'dark' ? 'text-gray-600' : 'text-gray-300'
        }`} />
        <h3 className={`text-lg font-semibold mb-2 ${
          theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
        }`}>{t('moderation.noPending')}</h3>
        <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
          {t('moderation.allReviewed')}
        </p>
      </div>
    );
  }

  const handleReject = (type, id) => {
    if (!rejectionReason.trim()) {
      alert(t('moderation.reasonRequired'));
      return;
    }
    onModerate(type, id, 'reject', rejectionReason);
    setRejectingId(null);
    setRejectionReason('');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className={`text-lg font-semibold ${
          theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
        }`}>
          {t('moderation.pendingReviews', { count: pendingReviews.length })}
        </h3>
      </div>
      
      {pendingReviews.map((item) => (
        <div 
          key={`${item.type}-${item.item._id}`} 
          className={`rounded-lg border-l-4 border-yellow-500 p-4 transition-colors duration-300 ${
            theme === 'dark' 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          } border`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <span className={`text-sm font-medium px-2 py-1 rounded ${
                  theme === 'dark' 
                    ? 'bg-yellow-900 text-yellow-300' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {item.type === 'post' ? t('moderation.post') : t('moderation.comment')}
                </span>
                <span className={`ml-2 text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {t('moderation.byAuthor', { author: item.item.author?.name })}
                </span>
              </div>
              
              <p className={`mb-3 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {(item.item.content || '').substring(0, 200)}...
              </p>
              
              <div className={`text-xs ${
                theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
              }`}>
                {t('moderation.submitted')}: {new Date(item.item.createdAt).toLocaleString()}
              </div>
            </div>
          </div>
          
          {rejectingId === `${item.type}-${item.item._id}` ? (
            <div className="mt-4 space-y-3">
              <textarea
                placeholder={t('moderation.rejectionReason')}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200 ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300'
                } border`}
                rows="3"
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setRejectingId(null)}
                  className={`px-3 py-1 rounded-lg transition-colors duration-200 ${
                    theme === 'dark' 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  } border`}
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={() => handleReject(item.type, item.item._id)}
                  className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  {t('moderation.confirmReject')}
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => onModerate(item.type, item.item._id, 'approve')}
                className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
              >
                {t('moderation.approve')}
              </button>
              <button
                onClick={() => setRejectingId(`${item.type}-${item.item._id}`)}
                className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                {t('moderation.reject')}
              </button>
              <Link
                to={item.type === 'post' 
                  ? `/forum/posts/${item.item._id}` 
                  : `/forum/posts/${item.item.post?._id}`
                }
                className={`px-3 py-1 rounded-lg transition-colors duration-200 ${
                  theme === 'dark' 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                } border`}
              >
                {t('moderation.view')}
              </Link>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Posts Tab Component
const PostsTab = ({ 
  posts, 
  user, 
  onVote, 
  onDelete, 
  canModerate, 
  formatDate, 
  activeTab,
  isAuthenticated,
  navigate,
  theme,
  votingPostId,
  setVotingPostId,
  votedPosts,
  setVotedPosts,
  t
}) => {
  if (!isAuthenticated() && activeTab === 'my') {
    return (
      <div className={`rounded-lg p-4 transition-colors duration-300 ${
        theme === 'dark' 
          ? 'bg-blue-900/20 border-blue-800' 
          : 'bg-blue-50 border-blue-200'
      } border`}>
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-blue-500 mr-2" />
          <p className={theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}>
            {t('loginRequired')}
          </p>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className={`rounded-lg p-8 text-center transition-colors duration-300 ${
        theme === 'dark' 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      } border`}>
        <FileText className={`w-12 h-12 mx-auto mb-4 ${
          theme === 'dark' ? 'text-gray-600' : 'text-gray-300'
        }`} />
        <h3 className={`text-lg font-semibold mb-2 ${
          theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
        }`}>
          {activeTab === 'my' ? t('noPosts.my') : t('noPosts.general')}
        </h3>
        <p className={`mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          {activeTab === 'my' ? t('noPosts.createFirst') : t('noPosts.beFirst')}
        </p>
        {isAuthenticated() && activeTab === 'my' && (
          <button
            onClick={() => navigate('/forum/create')}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
          >
            <Plus className="w-5 h-5 mr-2" />
            {t('createFirstPost')}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-1">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          user={user}
          onVote={onVote}
          onDelete={onDelete}
          canModerate={canModerate}
          formatDate={formatDate}
          navigate={navigate}
          theme={theme}
          votingPostId={votingPostId}
          setVotingPostId={setVotingPostId}
          votedPosts={votedPosts}
          setVotedPosts={setVotedPosts}
          t={t}
        />
      ))}
    </div>
  );
};

// Post Card Component
const PostCard = React.memo(({ post, user, onVote, onDelete, canModerate, formatDate, navigate, theme, votingPostId, setVotingPostId, votedPosts, setVotedPosts, t }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const canEdit = post.author?._id === user?.id || canModerate;
  const localUserVote = votedPosts[post.id] !== undefined ? votedPosts[post.id] : (post.userVote || null);

  return (
    <div className={`rounded-xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
      theme === 'dark'
        ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-gray-600 shadow-lg hover:shadow-2xl'
        : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:border-gray-300 shadow-md hover:shadow-xl'
    } border backdrop-blur-sm`}>
      {/* Post Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          {post.author?.profilePicture ? (
            <img 
              src={post.author.profilePicture} 
              alt={post.author.name}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              theme === 'dark' ? 'bg-green-900' : 'bg-green-100'
            }`}>
              <span className={`font-medium ${
                theme === 'dark' ? 'text-green-300' : 'text-green-600'
              }`}>
                {post.author?.name?.charAt(0) || 'U'}
              </span>
            </div>
          )}
          <div className="ml-3">
            <div className="flex items-center">
              <h4 className={`font-medium ${
                theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
              }`}>{post.author?.name}</h4>
              {post.author?.role === 'expert' && (
                <CheckCircle className="w-4 h-4 text-green-600 ml-1" title={t('badges.expert')} />
              )}
            </div>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {formatDate(post.createdAt)} • {post.category?.name}
            </p>
          </div>
        </div>
        
        {/* Status Indicators */}
        <div className="flex items-center space-x-2">
          {post.isPinned && <Pin className="w-4 h-4 text-yellow-600" title={t('badges.pinned')} />}
          {post.isLocked && <Lock className="w-4 h-4 text-gray-400" title={t('badges.locked')} />}
          {post.status === 'pending_review' && <Clock className="w-4 h-4 text-yellow-600" title={t('badges.pending')} />}
        </div>
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold mb-2">
        <Link 
          to={`/forum/posts/${post.id}`}
          className={`hover:text-green-600 transition-colors duration-200 ${
            theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
          }`}
        >
          {post.title}
          {post.isExpertAnswer && <Star className="w-4 h-4 text-yellow-500 inline-block ml-2" title={t('badges.expertAnswer')} />}
        </Link>
      </h3>

      {/* Content Excerpt */}
      <p className={`mb-4 ${
        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
      }`}>
        {(post.content || '').length > 150 
          ? `${(post.content || '').substring(0, 150)}...`
          : post.content
        }
      </p>

      {/* Attachments preview */}
      {post.attachments && post.attachments.length > 0 && (
        <AttachmentDisplay attachments={post.attachments} compact={true} theme={theme} />
      )}

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.slice(0, 3).map((tag) => (
            <span 
              key={tag} 
              className={`px-2 py-1 text-sm rounded ${
                theme === 'dark' 
                  ? 'bg-gray-700 text-gray-300' 
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Stats and Actions */}
      <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t pt-4 ${
        theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="flex items-center space-x-4 sm:space-x-6 overflow-x-auto">
          {/* Votes */}
          <div className="flex items-center space-x-1 flex-shrink-0">
            <button
              onClick={() => onVote(post.id, 'upvote')}
              disabled={!user || votingPostId === post.id}
              className={`p-2 rounded-lg transition-all duration-200 transform origin-center ${
                votingPostId === post.id ? 'scale-95' : 'hover:scale-110'
              } ${
                user
                  ? `${
                      localUserVote === 'upvote'
                        ? 'text-green-600 dark:text-green-500 bg-green-100 dark:bg-green-900/30'
                        : theme === 'dark' ? 'text-gray-400 hover:text-green-400' : 'text-gray-500 hover:text-green-600'
                    }`
                  : 'opacity-50 cursor-not-allowed'
              }`}
              title={user ? (localUserVote === 'upvote' ? t('vote.removeUpvote') : t('vote.upvote')) : t('vote.loginRequired')}
            >
              <ThumbsUp className={`w-4 sm:w-5 h-4 sm:h-5 transition-all duration-200 ${
                localUserVote === 'upvote' ? 'fill-current' : ''
              }`} />
            </button>
            <span className={`text-xs sm:text-sm font-bold min-w-[24px] text-center transition-all duration-200 ${
              theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
            } ${
              localUserVote === 'upvote' ? 'text-green-600 dark:text-green-500' : ''
            }`}>
              {post.stats?.upvotes || 0}
            </span>
            <button
              onClick={() => onVote(post.id, 'downvote')}
              disabled={!user}
              className={`p-2 rounded-lg transition-all duration-200 transform origin-center ${
                votingPostId === post.id ? 'scale-95' : 'hover:scale-110'
              } ${
                user 
                  ? `${
                      localUserVote === 'downvote'
                        ? 'text-red-600 dark:text-red-500 bg-red-100 dark:bg-red-900/30'
                        : theme === 'dark' ? 'text-gray-400 hover:text-red-400' : 'text-gray-500 hover:text-red-600'
                    }` 
                  : 'opacity-50 cursor-not-allowed'
              }`}
              title={user ? (localUserVote === 'downvote' ? t('vote.removeDownvote') : t('vote.downvote')) : t('vote.loginRequired')}
            >
              <ThumbsDown className={`w-4 sm:w-5 h-4 sm:h-5 transition-all duration-200 ${
                localUserVote === 'downvote' ? 'fill-current' : ''
              }`} />
            </button>
          </div>

          {/* Comments */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => navigate(`/forum/posts/${post.id}`)}
              className="flex items-center space-x-2 focus:outline-none"
              title={t('post.viewComments')}
            >
              <MessageSquare className={`w-4 sm:w-5 h-4 sm:h-5 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`} />
              <span className={`text-xs sm:text-sm ${
                theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
              }`}>{post.stats?.commentCount || 0}</span>
            </button>
          </div>

          {/* Views */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            <Eye className={`w-4 sm:w-5 h-4 sm:h-5 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`} />
            <span className={`text-sm ${
              theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
            }`}>{post.stats?.views || 0}</span>
          </div>
        </div>

        {/* Actions */}
        {canEdit && (
          <div className="flex items-center space-x-2">
            {showDeleteConfirm ? (
              <>
                <button
                  onClick={() => onDelete(post.id)}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  {t('common.confirm')}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors duration-200 ${
                    theme === 'dark' 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  } border`}
                >
                  {t('common.cancel')}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate(`/forum/edit/${post.id}`)}
                  className={`inline-flex items-center text-sm transition-colors duration-200 ${
                    theme === 'dark' 
                      ? 'text-gray-400 hover:text-gray-300' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  {t('post.edit')}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className={`inline-flex items-center text-sm transition-colors duration-200 ${
                    theme === 'dark' 
                      ? 'text-red-400 hover:text-red-300' 
                      : 'text-red-600 hover:text-red-900'
                  }`}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  {t('post.delete')}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.post.id === nextProps.post.id &&
    prevProps.post.userVote === nextProps.post.userVote &&
    prevProps.post.stats?.upvotes === nextProps.post.stats?.upvotes &&
    prevProps.post.stats?.downvotes === nextProps.post.stats?.downvotes &&
    prevProps.votingPostId === nextProps.votingPostId &&
    prevProps.theme === nextProps.theme &&
    prevProps.user?.id === nextProps.user?.id
  );
});

PostCard.displayName = 'PostCard';
export default ForumPages;
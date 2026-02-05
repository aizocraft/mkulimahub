import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { forumAPI } from '../api';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
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
  Loader2
} from 'lucide-react';
import AttachmentDisplay from '../components/AttachmentDisplay';

const ForumPages = () => {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  
  // State
  const [activeTab, setActiveTab] = useState('all');
  const [categories, setCategories] = useState([]);
  const [posts, setPosts] = useState([]);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [votedPosts, setVotedPosts] = useState({}); // Track user votes
  const [votingPostId, setVotingPostId] = useState(null); // Track voting animation
  
  // Filters
  const [filters, setFilters] = useState({
    category: '',
    sortBy: 'newest',
    search: ''
  });

  // Check if user can moderate
  const canModerate = user?.role === 'admin' || user?.role === 'expert';

  // Fetch data
  useEffect(() => {
    if (isAuthLoading) return; // wait for auth to initialize to get correct userVote
    fetchForumData();
  }, [filters, activeTab, user?.id, isAuthLoading]);

  const fetchForumData = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Fetch categories
      const categoriesResponse = await forumAPI.getCategories();
      setCategories(categoriesResponse.data.categories || []);

      // Fetch posts
      const postParams = {
        category: filters.category,
        sortBy: filters.sortBy,
        search: filters.search,
        limit: 10
      };
      const postsResponse = await forumAPI.getPosts(postParams);
      const fetchedPosts = postsResponse.data.posts || [];
      setPosts(fetchedPosts);

      // Sync votedPosts state with server data - this is the single source of truth
      const newVoteMap = {};
      fetchedPosts.forEach(p => {
        // Use post.userVote from server as the definitive state
        newVoteMap[p.id] = p.userVote || null;
      });
      setVotedPosts(newVoteMap);

      // Fetch pending reviews
      if (canModerate && activeTab === 'moderation') {
        const reviewsResponse = await forumAPI.getPendingReviews();
        setPendingReviews(reviewsResponse.data.items || []);
      }

      // Fetch stats
      const statsResponse = await forumAPI.getForumStats();
      setStats(statsResponse.data.stats);

    } catch (err) {
      console.error('Error fetching forum data:', err);
      setError('Failed to load forum data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  // Handle vote - improved with toggle functionality and animations
  const handleVote = async (postId, voteType) => {
    if (!isAuthenticated()) {
      toast.info('Please login to vote on posts', { position: 'top-center' });
      navigate('/login');
      return;
    }

    try {
      setVotingPostId(postId);
      
      // Get the post and use its current userVote as source of truth
      const postIndex = posts.findIndex(p => p.id === postId);
      if (postIndex === -1) return;
     
      const post = posts[postIndex];
      const currentUserVote = post.userVote || null;
      
      // Determine new vote type - toggle if clicking same button
      let newVoteType = voteType;
      if (currentUserVote === voteType) {
        // Clicking same vote button removes vote
        newVoteType = null;
      }
      
      // Create updated posts array with optimistic update
      const updatedPosts = posts.map(p => {
        if (p.id === postId) {
          const oldUpvotes = p.stats?.upvotes || 0;
          const oldDownvotes = p.stats?.downvotes || 0;
          
          let newUpvotes = oldUpvotes;
          let newDownvotes = oldDownvotes;
          
          // Remove old vote if exists
          if (currentUserVote === 'upvote') {
            newUpvotes = Math.max(0, newUpvotes - 1);
          } else if (currentUserVote === 'downvote') {
            newDownvotes = Math.max(0, newDownvotes - 1);
          }
          
          // Add new vote if applicable
          if (newVoteType === 'upvote') {
            newUpvotes++;
          } else if (newVoteType === 'downvote') {
            newDownvotes++;
          }
          
          return {
            ...p,
            stats: {
              ...p.stats,
              upvotes: newUpvotes,
              downvotes: newDownvotes
            },
            userVote: newVoteType,
            voteDifference: newUpvotes - newDownvotes
          };
        }
         return p;
       });
     
       // Apply optimistic update
       setPosts(updatedPosts);
      
      // Make API call
      const response = await forumAPI.votePost(postId, newVoteType);
      
      // Update from server response for exact sync
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

      // Also sync votedPosts
      setVotedPosts(prev => ({
        ...prev,
        [postId]: response.data.userVote || null
      }));

      // Show success toast
      if (newVoteType === null) {
        toast.info('Vote removed', { 
          position: 'top-center',
          autoClose: 1500,
          hideProgressBar: true
        });
      } else if (newVoteType === 'upvote') {
        toast.success('👍 Upvoted!', { 
          position: 'top-center',
          autoClose: 1500,
          hideProgressBar: true
        });
      } else if (newVoteType === 'downvote') {
        toast.info('👎 Downvoted', { 
          position: 'top-center',
          autoClose: 1500,
          hideProgressBar: true
        });
      }
    } catch (err) {
      console.error('Error voting:', err);
      
      // Refresh data to sync with server on error
      await fetchForumData();
      
      const errorMsg = err.response?.data?.message || 'Failed to vote. Please try again.';
      toast.error(errorMsg, { 
        position: 'top-center',
        autoClose: 3000 
      });
    } finally {
      setVotingPostId(null);
    }
  };

  // Handle delete
  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      await forumAPI.deletePost(postId);
      setPosts(prev => prev.filter(post => post.id !== postId));
      toast.success('Post deleted successfully', { 
        position: 'top-center',
        autoClose: 2000 
      });
    } catch (err) {
      console.error('Error deleting post:', err);
      const errorMsg = err.response?.data?.message || 'Failed to delete post.';
      toast.error(errorMsg, { 
        position: 'top-center',
        autoClose: 3000 
      });
    }
  };

  // Handle moderation
  const handleModerate = async (type, id, action, reason = '') => {
    try {
      if (action === 'approve') {
        await forumAPI.approveContent(type, id, 'Approved by moderator');
        toast.success('Content approved ✓', { 
          position: 'top-center',
          autoClose: 2000 
        });
      } else {
        await forumAPI.rejectContent(type, id, reason);
        toast.info('Content rejected', { 
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
      const errorMsg = err.response?.data?.message || 'Failed to moderate content.';
      toast.error(errorMsg, { 
        position: 'top-center',
        autoClose: 3000 
      });
    }
  };

  // Tabs
  const tabs = [
    { id: 'all', label: 'All Posts', icon: <FileText className="w-4 h-4" /> },
    { id: 'my', label: 'My Posts', icon: <MessageSquare className="w-4 h-4" /> },
    ...(canModerate ? [{ 
      id: 'moderation', 
      label: 'Moderation', 
      icon: <AlertCircle className="w-4 h-4" />,
      badge: pendingReviews.length 
    }] : []),
    { id: 'stats', label: 'Statistics', icon: <BarChart3 className="w-4 h-4" /> }
  ];

  // Filter posts by current tab
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
              <h1 className="text-3xl font-bold">Community Forum</h1>
              <p className={`mt-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Share knowledge, ask questions, and connect with fellow farmers and experts.
              </p>
            </div>
            
            {isAuthenticated() && (
              <button
                onClick={() => navigate('/forum/create')}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create New Post
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
                  placeholder="Search posts..."
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
                  <option value="">All Categories</option>
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
                <option value="newest">Newest First</option>
                <option value="trending">Trending</option>
                <option value="most_commented">Most Comments</option>
                <option value="most_voted">Most Votes</option>
              </select>
            </div>
            
            <div>
              <button
                type="submit"
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
              >
                Apply Filters
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
          <StatsTab stats={stats} categories={categories} theme={theme} />
        ) : activeTab === 'moderation' ? (
          <ModerationTab 
            pendingReviews={pendingReviews} 
            onModerate={handleModerate}
            canModerate={canModerate}
            theme={theme}
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
            />
        )}
      </div>
    </div>
  );
};

// Stats Tab Component
const StatsTab = ({ stats, categories, theme }) => {
  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { value: stats.totalPosts || 0, label: 'Total Posts' },
          { value: stats.totalComments || 0, label: 'Total Comments' },
          { value: stats.postsToday || 0, label: 'Posts Today' },
          { value: stats.totalUsers || 0, label: 'Active Users' },
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
        }`}>Top Categories</h3>
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
                {category.postCount || 0} posts • {category.commentCount || 0} comments
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
        }`}>Recent Activity</h3>
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
                  By {post.author?.name} • {new Date(post.createdAt).toLocaleDateString()}
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
const ModerationTab = ({ pendingReviews, onModerate, canModerate, theme }) => {
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
            You need to be an expert or administrator to access this section.
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
        }`}>No pending reviews</h3>
        <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
          All content has been moderated.
        </p>
      </div>
    );
  }

  const handleReject = (type, id) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
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
          Pending Reviews ({pendingReviews.length})
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
                  {item.type === 'post' ? '📝 Post' : '💬 Comment'}
                </span>
                <span className={`ml-2 text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  by {item.item.author?.name}
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
                Submitted: {new Date(item.item.createdAt).toLocaleString()}
              </div>
            </div>
          </div>
          
          {rejectingId === `${item.type}-${item.item._id}` ? (
            <div className="mt-4 space-y-3">
              <textarea
                placeholder="Reason for rejection..."
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
                  Cancel
                </button>
                <button
                  onClick={() => handleReject(item.type, item.item._id)}
                  className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  Confirm Reject
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => onModerate(item.type, item.item._id, 'approve')}
                className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
              >
                Approve
              </button>
              <button
                onClick={() => setRejectingId(`${item.type}-${item.item._id}`)}
                className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                Reject
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
                View
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
  setVotedPosts
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
            Please login to view your posts.
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
          {activeTab === 'my' ? "You haven't created any posts yet" : 'No posts found'}
        </h3>
        <p className={`mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          {activeTab === 'my' 
            ? 'Share your knowledge or ask questions to get started.'
            : 'Be the first to post in the community!'}
        </p>
        {isAuthenticated() && activeTab === 'my' && (
          <button
            onClick={() => navigate('/forum/create')}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Your First Post
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
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
        />
      ))}
    </div>
  );
};

// Post Card Component
const PostCard = React.memo(({ post, user, onVote, onDelete, canModerate, formatDate, navigate, theme, votingPostId, setVotingPostId, votedPosts, setVotedPosts }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const canEdit = post.author?._id === user?.id || canModerate;
  
  // Use post.userVote directly - always kept in sync with server
  const localUserVote = post.userVote || null;

  return (
    <div className={`rounded-lg p-6 hover:shadow-md transition-all duration-300 ${
      theme === 'dark' 
        ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
        : 'bg-white border-gray-200 hover:border-gray-300'
    } border`}>
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
                <CheckCircle className="w-4 h-4 text-green-600 ml-1" />
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
          {post.isPinned && <Pin className="w-4 h-4 text-yellow-600" />}
          {post.isLocked && <Lock className="w-4 h-4 text-gray-400" />}
          {post.status === 'pending_review' && <Clock className="w-4 h-4 text-yellow-600" />}
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
          {post.isExpertAnswer && <Star className="w-4 h-4 text-yellow-500 inline-block ml-2" />}
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
              {tag}
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
              disabled={!user}
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
              title={user ? `${localUserVote === 'upvote' ? 'Remove upvote' : 'Upvote'}` : 'Login to vote'}
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
              title={user ? `${localUserVote === 'downvote' ? 'Remove downvote' : 'Downvote'}` : 'Login to vote'}
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
              title="View post and comments"
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
                  Confirm
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors duration-200 ${
                    theme === 'dark' 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  } border`}
                >
                  Cancel
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
                  Edit
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
                  Delete
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison - only re-render if post or voting state actually changed
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
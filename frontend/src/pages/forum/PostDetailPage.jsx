import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { forumAPI } from '../../api';
import AttachmentDisplay from '../../components/AttachmentDisplay';
import {
  ArrowLeft,
  Edit,
  Trash2,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  Send,
  User,
  Loader2,
  File
} from 'lucide-react';

const PostDetailPage = () => {
  const { id } = useParams();
  const postId = id; // Map the route param to postId
  const { user, isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [votedComments, setVotedComments] = useState({}); // Track comment votes

  useEffect(() => {
    fetchPostDetails();
  }, [postId]);

  const fetchPostDetails = async () => {
    try {
      setIsLoading(true);
      const response = await forumAPI.getPost(postId);
      setPost(response.data.post);
      
      // Flatten comments and replies for display
      const allComments = [];
      if (response.data.comments) {
        response.data.comments.forEach(comment => {
          allComments.push({ ...comment, isReply: false });
          if (comment.replies) {
            comment.replies.forEach(reply => {
              allComments.push({ ...reply, isReply: true, parentCommentId: comment.id });
            });
          }
        });
      }
      setComments(allComments);
    } catch (err) {
      console.error('Error fetching post:', err);
      setError('Failed to load post');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = async (voteType) => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    try {
      await forumAPI.votePost(postId, voteType);
      setPost(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          [voteType === 'upvote' ? 'upvotes' : 'downvotes']: 
            (prev.stats[voteType === 'upvote' ? 'upvotes' : 'downvotes'] || 0) + 1
        }
      }));
    } catch (err) {
      console.error('Error voting:', err);
      setError('Failed to vote');
    }
  };

  const handleCommentVote = async (commentId, voteType) => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    try {
      const currentVote = votedComments[commentId];
      
      // Determine new vote type - toggle if clicking same button
      let newVoteType = voteType;
      if (currentVote === voteType) {
        newVoteType = null;
      }
      
      const response = await forumAPI.voteComment(commentId, newVoteType);
      
      // Update voted comments state
      setVotedComments(prev => ({
        ...prev,
        [commentId]: newVoteType
      }));
      
      // Update comments
      setComments(prev => prev.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            votes: response.data.votes,
            userVote: response.data.userVote
          };
        }
        return comment;
      }));
    } catch (err) {
      console.error('Error voting on comment:', err);
      const errorMsg = err.response?.data?.message || 'Failed to vote on comment';
      setError(errorMsg);
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    setIsSubmitting(true);
    try {
      const response = await forumAPI.createComment(postId, {
        content: newComment,
        parentComment: replyTo
      });
      
      const newCommentObj = response.data.comment;
      setComments(prev => [...prev, { ...newCommentObj, isReply: !!replyTo }]);
      setNewComment('');
      setReplyTo(null);
      
      // Update post comment count
      setPost(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          commentCount: (prev.stats?.commentCount || 0) + 1
        }
      }));
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    
    try {
      await forumAPI.deletePost(postId);
      navigate('/forum');
    } catch (err) {
      console.error('Error deleting post:', err);
      setError('Failed to delete post');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    
    try {
      await forumAPI.deleteComment(commentId);
      setComments(prev => prev.filter(comment => comment.id !== commentId));
      
      // Update post comment count
      setPost(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          commentCount: Math.max(0, (prev.stats?.commentCount || 0) - 1)
        }
      }));
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError('Failed to delete comment');
    }
  };

  const handleMarkAsAnswer = async (commentId) => {
    try {
      await forumAPI.markAsAnswer(commentId);
      // Update comment in local state
      setComments(prev => prev.map(comment => {
        if (comment.id === commentId) {
          return { ...comment, isAnswer: true };
        }
        return comment;
      }));
    } catch (err) {
      console.error('Error marking as answer:', err);
      setError('Failed to mark as answer');
    }
  };

  const canEdit = user?.id === post?.author?._id || 
                  user?.role === 'admin' || 
                  user?.role === 'expert';

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <Loader2 className="w-12 h-12 text-green-600 animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="container mx-auto px-4 py-8">
          <div className={`rounded-lg p-4 transition-colors duration-300 ${
            theme === 'dark' 
              ? 'bg-red-900/20 border-red-800' 
              : 'bg-red-50 border-red-200'
          } border`}>
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <p className={theme === 'dark' ? 'text-red-300' : 'text-red-700'}>Post not found</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <button
          onClick={() => navigate('/forum')}
          className={`inline-flex items-center mb-6 transition-colors duration-200 ${
            theme === 'dark' 
              ? 'text-gray-400 hover:text-gray-300' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Forum
        </button>

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

        {/* Post */}
        <div className={`rounded-lg shadow-sm border p-6 mb-6 transition-colors duration-300 ${
          theme === 'dark' 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          {/* Post Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className={`text-2xl font-bold mb-2 ${
                theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
              }`}>{post.title}</h1>
              <div className="flex items-center flex-wrap gap-4">
                <div className="flex items-center">
                  {post.author?.profilePicture ? (
                    <img 
                      src={post.author.profilePicture} 
                      alt={post.author.name}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      theme === 'dark' ? 'bg-green-900' : 'bg-green-100'
                    }`}>
                      <span className={`font-medium ${
                        theme === 'dark' ? 'text-green-300' : 'text-green-600'
                      }`}>
                        {post.author?.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                  )}
                  <div className="ml-2">
                    <div className="flex items-center">
                      <span className={`font-medium ${
                        theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                      }`}>{post.author?.name}</span>
                      {post.author?.role === 'expert' && (
                        <CheckCircle className="w-4 h-4 text-green-600 ml-1" />
                      )}
                    </div>
                    <span className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>{formatDate(post.createdAt)}</span>
                  </div>
                </div>
                
                <span className={`px-3 py-1 rounded-full text-sm ${
                  theme === 'dark' 
                    ? 'bg-gray-700 text-gray-300' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {post.category?.name}
                </span>
                
                {post.status === 'pending_review' && (
                  <span className={`px-3 py-1 rounded-full text-sm flex items-center ${
                    theme === 'dark' 
                      ? 'bg-yellow-900 text-yellow-300' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    <Clock className="w-4 h-4 mr-1" />
                    Pending Review
                  </span>
                )}
              </div>
            </div>
            
            {canEdit && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigate(`/forum/edit/${postId}`)}
                  className={`p-2 rounded-lg transition-colors duration-200 ${
                    theme === 'dark' 
                      ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={handleDeletePost}
                  className={`p-2 rounded-lg transition-colors duration-200 ${
                    theme === 'dark' 
                      ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20' 
                      : 'text-red-600 hover:text-red-900 hover:bg-red-50'
                  }`}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Post Content */}
          <div className="prose max-w-none mb-6">
            <p className={`whitespace-pre-wrap ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>{post.content}</p>
          </div>

          {/* Attachments */}
          {post.attachments && post.attachments.length > 0 && (
            <AttachmentDisplay
              attachments={post.attachments}
              canDelete={false}
              theme={theme}
            />
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map((tag) => (
                <span 
                  key={tag} 
                  className={`px-3 py-1 rounded-full text-sm ${
                    theme === 'dark' 
                      ? 'bg-green-900 text-green-300' 
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Post Stats and Actions */}
          <div className={`flex items-center justify-between border-t pt-4 ${
            theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="flex items-center space-x-6">
              {/* Votes */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleVote('upvote')}
                  disabled={!isAuthenticated()}
                  className={`p-2 rounded-lg transition-colors duration-200 ${
                    isAuthenticated() 
                      ? `hover:bg-gray-100 dark:hover:bg-gray-700 ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        }` 
                      : 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  <ThumbsUp className="w-5 h-5" />
                </button>
                <span className={`text-lg font-semibold ${
                  theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                }`}>
                  {(post.stats?.upvotes || 0) - (post.stats?.downvotes || 0)}
                </span>
                <button
                  onClick={() => handleVote('downvote')}
                  disabled={!isAuthenticated()}
                  className={`p-2 rounded-lg transition-colors duration-200 ${
                    isAuthenticated() 
                      ? `hover:bg-gray-100 dark:hover:bg-gray-700 ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        }` 
                      : 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  <ThumbsDown className="w-5 h-5" />
                </button>
              </div>
              
              {/* Comments */}
              <div className="flex items-center space-x-2">
                <MessageSquare className={`w-5 h-5 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`} />
                <span className={`${
                  theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                }`}>{post.stats?.commentCount || 0} comments</span>
              </div>
              
              {/* Views */}
              <div className="flex items-center space-x-2">
                <Eye className={`w-5 h-5 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`} />
                <span className={`${
                  theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                }`}>{post.stats?.views || 0} views</span>
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className={`rounded-lg shadow-sm border p-6 transition-colors duration-300 ${
          theme === 'dark' 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <h2 className={`text-xl font-semibold mb-6 ${
            theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
          }`}>
            Comments ({comments.length})
          </h2>
          
          {/* Add Comment Form */}
          {isAuthenticated() && (
            <div className="mb-8">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {user?.profilePicture ? (
                    <img 
                      src={user.profilePicture} 
                      alt={user.name}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      theme === 'dark' ? 'bg-green-900' : 'bg-green-100'
                    }`}>
                      <User className={`w-5 h-5 ${
                        theme === 'dark' ? 'text-green-300' : 'text-green-600'
                      }`} />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={replyTo ? `Replying to comment...` : "Add a comment..."}
                    className={`w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none transition-colors duration-200 ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300'
                    } border`}
                    rows="3"
                  />
                  <div className="flex justify-between items-center mt-2">
                    {replyTo && (
                      <div className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Replying to comment #{replyTo.substring(0, 8)}...
                        <button
                          onClick={() => setReplyTo(null)}
                          className="ml-2 text-red-600 hover:text-red-700 transition-colors duration-200"
                        >
                          Cancel reply
                        </button>
                      </div>
                    )}
                    <button
                      onClick={handleAddComment}
                      disabled={isSubmitting || !newComment.trim()}
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {isSubmitting ? 'Posting...' : 'Post Comment'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-6">
            {comments.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className={`w-12 h-12 mx-auto mb-4 ${
                  theme === 'dark' ? 'text-gray-600' : 'text-gray-300'
                }`} />
                <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                  No comments yet. Be the first to comment!
                </p>
              </div>
            ) : (
              comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  user={user}
                  onVote={handleCommentVote}
                  onDelete={handleDeleteComment}
                  onMarkAsAnswer={handleMarkAsAnswer}
                  onReply={setReplyTo}
                  formatDate={formatDate}
                  canModerate={user?.role === 'admin' || user?.role === 'expert'}
                  theme={theme}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Comment Item Component
const CommentItem = ({ comment, user, onVote, onDelete, onMarkAsAnswer, onReply, formatDate, canModerate, theme }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const canEdit = user?.id === comment.author?._id || canModerate;
  const isAnswer = comment.isAnswer;
  const isExpertAnswer = comment.isExpertAnswer;

  return (
    <div className={`border rounded-lg p-4 transition-colors duration-300 ${
      comment.isReply 
        ? `ml-8 ${
            theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
          }` 
        : theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
    }`}>
      {/* Comment Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          {comment.author?.profilePicture ? (
            <img 
              src={comment.author.profilePicture} 
              alt={comment.author.name}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              theme === 'dark' ? 'bg-green-900' : 'bg-green-100'
            }`}>
              <span className={`font-medium ${
                theme === 'dark' ? 'text-green-300' : 'text-green-600'
              }`}>
                {comment.author?.name?.charAt(0) || 'U'}
              </span>
            </div>
          )}
          <div className="ml-3">
            <div className="flex items-center">
              <span className={`font-medium ${
                theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
              }`}>{comment.author?.name}</span>
              {comment.author?.role === 'expert' && (
                <CheckCircle className="w-4 h-4 text-green-600 ml-1" />
              )}
              {isAnswer && (
                <span className={`ml-2 px-2 py-1 text-xs rounded ${
                  theme === 'dark' 
                    ? 'bg-green-900 text-green-300' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  ✓ Answer
                </span>
              )}
              {isExpertAnswer && (
                <span className={`ml-2 px-2 py-1 text-xs rounded ${
                  theme === 'dark' 
                    ? 'bg-blue-900 text-blue-300' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  Expert Answer
                </span>
              )}
            </div>
            <span className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>{formatDate(comment.createdAt)}</span>
          </div>
        </div>
        
        {/* Comment Actions */}
        <div className="flex items-center space-x-2">
          {canEdit && (
            <>
              {showDeleteConfirm ? (
                <>
                  <button
                    onClick={() => onDelete(comment.id)}
                    className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors duration-200"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className={`text-xs px-2 py-1 rounded transition-colors duration-200 ${
                      theme === 'dark' 
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    } border`}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className={`p-1 rounded transition-colors duration-200 ${
                    theme === 'dark' 
                      ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20' 
                      : 'text-red-600 hover:text-red-900 hover:bg-red-50'
                  }`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </>
          )}
          
          {user && !comment.isReply && (
            <button
              onClick={() => onReply(comment.id)}
              className={`text-sm transition-colors duration-200 ${
                theme === 'dark' 
                  ? 'text-gray-400 hover:text-gray-300' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Reply
            </button>
          )}
          
          {(user?.role === 'expert' || user?.role === 'admin') && !isAnswer && (
            <button
              onClick={() => onMarkAsAnswer(comment.id)}
              className={`text-sm transition-colors duration-200 ${
                theme === 'dark' 
                  ? 'text-green-400 hover:text-green-300' 
                  : 'text-green-600 hover:text-green-700'
              }`}
            >
              Mark as Answer
            </button>
          )}
        </div>
      </div>

      {/* Comment Content */}
      <p className={`mb-4 whitespace-pre-wrap ${
        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
      }`}>{comment.content}</p>

      {/* Comment Attachments */}
      {comment.attachments && comment.attachments.length > 0 && (
        <AttachmentDisplay
          attachments={comment.attachments}
          canDelete={false}
          compact={true}
          theme={theme}
        />
      )}

      {/* Comment Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onVote(comment.id, 'upvote')}
              disabled={!user}
              className={`p-2 rounded transition-all duration-200 ${
                user 
                  ? `hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      comment.userVote === 'upvote'
                        ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
                        : theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }` 
                  : 'opacity-50 cursor-not-allowed'
              }`}
              title={user ? 'Click to upvote or remove vote' : 'Login to vote'}
            >
              <ThumbsUp className="w-4 h-4" />
            </button>
            <span className={`text-sm font-medium min-w-[30px] text-center ${
              theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
            }`}>
              {(comment.votes?.upvotes || 0) - (comment.votes?.downvotes || 0)}
            </span>
            <button
              onClick={() => onVote(comment.id, 'downvote')}
              disabled={!user}
              className={`p-2 rounded transition-all duration-200 ${
                user 
                  ? `hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      comment.userVote === 'downvote'
                        ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
                        : theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }` 
                  : 'opacity-50 cursor-not-allowed'
              }`}
              title={user ? 'Click to downvote or remove vote' : 'Login to vote'}
            >
              <ThumbsDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetailPage;
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { forumAPI } from '../../api';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
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
  File,
  Heart,
  Bookmark,
  Share2
} from 'lucide-react';

const PostDetailPage = () => {
  const { id } = useParams();
  const postId = id;
  const { user, isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const { t } = useTranslation('forumPost');
  const navigate = useNavigate();
  
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [votedComments, setVotedComments] = useState({});
  const [postUserVote, setPostUserVote] = useState(null);
  const [votingPost, setVotingPost] = useState(false);

  useEffect(() => {
    fetchPostDetails();
  }, [postId]);

  const fetchPostDetails = async () => {
    try {
      setIsLoading(true);
      const response = await forumAPI.getPost(postId);
      setPost(response.data.post);
      
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
      setError(t('errors.loadFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = async (voteType) => {
    if (!isAuthenticated()) {
      toast.info(t('vote.loginRequired'), { position: 'top-center' });
      navigate('/login');
      return;
    }

    try {
      setVotingPost(true);

      const currentUserVote = postUserVote || post.userVote || null;

      let newVoteType = voteType;
      if (currentUserVote === voteType) {
        newVoteType = null;
      }

      const oldUpvotes = post.stats?.upvotes || 0;
      const oldDownvotes = post.stats?.downvotes || 0;

      let newUpvotes = oldUpvotes;
      let newDownvotes = oldDownvotes;

      if (currentUserVote === 'upvote') {
        newUpvotes = Math.max(0, newUpvotes - 1);
      } else if (currentUserVote === 'downvote') {
        newDownvotes = Math.max(0, newDownvotes - 1);
      }

      if (newVoteType === 'upvote') {
        newUpvotes++;
      } else if (newVoteType === 'downvote') {
        newDownvotes++;
      }

      setPost(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          upvotes: newUpvotes,
          downvotes: newDownvotes
        },
        userVote: newVoteType
      }));
      setPostUserVote(newVoteType);

      const response = await forumAPI.votePost(postId, newVoteType);

      setPost(prev => ({
        ...prev,
        stats: response.data.stats,
        userVote: response.data.userVote || null
      }));
      setPostUserVote(response.data.userVote || null);

      if (newVoteType === null) {
        toast.info(t('vote.removed'), {
          position: 'top-center',
          autoClose: 1500,
          hideProgressBar: true
        });
      } else if (newVoteType === 'upvote') {
        toast.success(t('vote.upvoted'), {
          position: 'top-center',
          autoClose: 1500,
          hideProgressBar: true
        });
      } else if (newVoteType === 'downvote') {
        toast.info(t('vote.downvoted'), {
          position: 'top-center',
          autoClose: 1500,
          hideProgressBar: true
        });
      }
    } catch (err) {
      console.error('Error voting:', err);
      await fetchPostDetails();
      const errorMsg = err.response?.data?.message || t('vote.error');
      toast.error(errorMsg, {
        position: 'top-center',
        autoClose: 3000
      });
    } finally {
      setVotingPost(false);
    }
  };

  const handleCommentVote = async (commentId, voteType) => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    try {
      const currentVote = votedComments[commentId];
      
      let newVoteType = voteType;
      if (currentVote === voteType) {
        newVoteType = null;
      }
      
      const response = await forumAPI.voteComment(commentId, newVoteType);
      
      setVotedComments(prev => ({
        ...prev,
        [commentId]: newVoteType
      }));
      
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
      const errorMsg = err.response?.data?.message || t('vote.commentError');
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
      
      setPost(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          commentCount: (prev.stats?.commentCount || 0) + 1
        }
      }));
    } catch (err) {
      console.error('Error adding comment:', err);
      setError(t('errors.commentAddFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm(t('delete.confirmPost'))) return;
    
    try {
      await forumAPI.deletePost(postId);
      navigate('/forum');
    } catch (err) {
      console.error('Error deleting post:', err);
      setError(t('errors.deleteFailed'));
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm(t('delete.confirmComment'))) return;
    
    try {
      await forumAPI.deleteComment(commentId);
      setComments(prev => prev.filter(comment => comment.id !== commentId));
      
      setPost(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          commentCount: Math.max(0, (prev.stats?.commentCount || 0) - 1)
        }
      }));
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError(t('errors.commentDeleteFailed'));
    }
  };

  const handleMarkAsAnswer = async (commentId) => {
    try {
      await forumAPI.markAsAnswer(commentId);
      setComments(prev => prev.map(comment => {
        if (comment.id === commentId) {
          return { ...comment, isAnswer: true };
        }
        return comment;
      }));
    } catch (err) {
      console.error('Error marking as answer:', err);
      setError(t('errors.markAnswerFailed'));
    }
  };

  const canEdit = user?.id === post?.author?._id || 
                  user?.role === 'admin' || 
                  user?.role === 'expert';

  const formatDate = (dateString) => {
    if (!dateString) return t('date.unknown');
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
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
              <p className={theme === 'dark' ? 'text-red-300' : 'text-red-700'}>{t('errors.notFound')}</p>
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
        <button
          onClick={() => navigate('/forum')}
          className={`inline-flex items-center mb-6 transition-colors duration-200 ${
            theme === 'dark' 
              ? 'text-gray-400 hover:text-gray-300' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          {t('backToForum')}
        </button>

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

        <div className={`rounded-lg shadow-sm border p-6 mb-6 transition-colors duration-300 ${
          theme === 'dark' 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
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
                        <CheckCircle className="w-4 h-4 text-green-600 ml-1" title={t('badges.expert')} />
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
                    {t('badges.pending')}
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
                  title={t('actions.edit')}
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
                  title={t('actions.delete')}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          <div className="prose max-w-none mb-6">
            <p className={`whitespace-pre-wrap ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>{post.content}</p>
          </div>

          {post.attachments && post.attachments.length > 0 && (
            <AttachmentDisplay
              attachments={post.attachments}
              canDelete={false}
              theme={theme}
            />
          )}

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
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className={`flex items-center justify-between border-t pt-4 ${
            theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleVote('upvote')}
                  disabled={!isAuthenticated() || votingPost}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    isAuthenticated() 
                      ? `hover:bg-gray-100 dark:hover:bg-gray-700 ${
                          postUserVote === 'upvote' || post.userVote === 'upvote'
                            ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
                            : theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        }` 
                      : 'opacity-50 cursor-not-allowed'
                  }`}
                  title={isAuthenticated() ? t('vote.upvote') : t('vote.loginRequired')}
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
                  disabled={!isAuthenticated() || votingPost}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    isAuthenticated() 
                      ? `hover:bg-gray-100 dark:hover:bg-gray-700 ${
                          postUserVote === 'downvote' || post.userVote === 'downvote'
                            ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
                            : theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        }` 
                      : 'opacity-50 cursor-not-allowed'
                  }`}
                  title={isAuthenticated() ? t('vote.downvote') : t('vote.loginRequired')}
                >
                  <ThumbsDown className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex items-center space-x-2">
                <MessageSquare className={`w-5 h-5 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`} />
                <span className={`${
                  theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                }`}>{t('comments.count', { count: post.stats?.commentCount || 0 })}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Eye className={`w-5 h-5 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`} />
                <span className={`${
                  theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                }`}>{t('stats.views', { count: post.stats?.views || 0 })}</span>
              </div>
            </div>
          </div>
        </div>

        <div className={`rounded-lg shadow-sm border p-6 transition-colors duration-300 ${
          theme === 'dark' 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <h2 className={`text-xl font-semibold mb-6 ${
            theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
          }`}>
            {t('comments.title', { count: comments.length })}
          </h2>
          
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
                    placeholder={replyTo ? t('comments.replyPlaceholder') : t('comments.placeholder')}
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
                        {t('comments.replyingTo')}
                        <button
                          onClick={() => setReplyTo(null)}
                          className="ml-2 text-red-600 hover:text-red-700 transition-colors duration-200"
                        >
                          {t('comments.cancelReply')}
                        </button>
                      </div>
                    )}
                    <button
                      onClick={handleAddComment}
                      disabled={isSubmitting || !newComment.trim()}
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {isSubmitting ? t('comments.posting') : t('comments.post')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {comments.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className={`w-12 h-12 mx-auto mb-4 ${
                  theme === 'dark' ? 'text-gray-600' : 'text-gray-300'
                }`} />
                <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                  {t('comments.none')}
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
                  t={t}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const CommentItem = ({ comment, user, onVote, onDelete, onMarkAsAnswer, onReply, formatDate, canModerate, theme, t }) => {
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
                <CheckCircle className="w-4 h-4 text-green-600 ml-1" title={t('badges.expert')} />
              )}
              {isAnswer && (
                <span className={`ml-2 px-2 py-1 text-xs rounded ${
                  theme === 'dark' 
                    ? 'bg-green-900 text-green-300' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  ✓ {t('comments.answer')}
                </span>
              )}
              {isExpertAnswer && (
                <span className={`ml-2 px-2 py-1 text-xs rounded ${
                  theme === 'dark' 
                    ? 'bg-blue-900 text-blue-300' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {t('comments.expertAnswer')}
                </span>
              )}
            </div>
            <span className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>{formatDate(comment.createdAt)}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {canEdit && (
            <>
              {showDeleteConfirm ? (
                <>
                  <button
                    onClick={() => onDelete(comment.id)}
                    className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors duration-200"
                  >
                    {t('common.confirm')}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className={`text-xs px-2 py-1 rounded transition-colors duration-200 ${
                      theme === 'dark' 
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    } border`}
                  >
                    {t('common.cancel')}
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
                  title={t('actions.delete')}
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
              {t('comments.reply')}
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
              {t('comments.markAsAnswer')}
            </button>
          )}
        </div>
      </div>

      <p className={`mb-4 whitespace-pre-wrap ${
        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
      }`}>{comment.content}</p>

      {comment.attachments && comment.attachments.length > 0 && (
        <AttachmentDisplay
          attachments={comment.attachments}
          canDelete={false}
          compact={true}
          theme={theme}
        />
      )}

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
              title={user ? t('vote.upvote') : t('vote.loginRequired')}
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
              title={user ? t('vote.downvote') : t('vote.loginRequired')}
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
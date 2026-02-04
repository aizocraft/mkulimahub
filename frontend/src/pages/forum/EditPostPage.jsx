import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { forumAPI } from '../../api';
import {
  ArrowLeft,
  Plus,
  X,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';

const EditPostPage = () => {
  const { id } = useParams();
  const postId = id; // Map the route param to postId
  const { user, isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: []
  });
  
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    
    fetchPostData();
    fetchCategories();
  }, [postId, isAuthenticated, navigate]);

  const fetchPostData = async () => {
    try {
      setIsLoading(true);
      const response = await forumAPI.getPost(postId);
      const post = response.data.post;
      
      // Check if user can edit
      const canEdit = user?.id === post.author?._id || 
                     user?.role === 'admin' || 
                     user?.role === 'expert';
      
      if (!canEdit) {
        navigate('/forum');
        return;
      }
      
      setFormData({
        title: post.title || '',
        content: post.content || '',
        category: post.category?._id || post.category || '',
        tags: post.tags || []
      });
    } catch (err) {
      console.error('Error fetching post:', err);
      setError('Failed to load post');
      navigate('/forum');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await forumAPI.getCategories();
      setCategories(response.data.categories || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    
    if (!formData.content.trim()) {
      setError('Content is required');
      return;
    }
    
    if (!formData.category) {
      setError('Please select a category');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await forumAPI.updatePost(postId, formData);
      
      if (response.data.requiresReview) {
        setSuccess('Post updated successfully! It will be reviewed by an expert before changes appear publicly.');
      } else {
        setSuccess('Post updated successfully!');
      }
      
      setTimeout(() => {
        navigate(`/forum/posts/${postId}`);
      }, 2000);
      
    } catch (err) {
      console.error('Error updating post:', err);
      setError(err.response?.data?.message || 'Failed to update post');
    } finally {
      setIsSubmitting(false);
    }
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

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Back Button */}
        <button
          onClick={() => navigate(`/forum/posts/${postId}`)}
          className={`inline-flex items-center mb-6 transition-colors duration-200 ${
            theme === 'dark' 
              ? 'text-gray-400 hover:text-gray-300' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Post
        </button>

        {/* Form */}
        <div className={`rounded-lg shadow-sm border p-6 transition-colors duration-300 ${
          theme === 'dark' 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <h1 className={`text-2xl font-bold mb-2 ${
            theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
          }`}>Edit Post</h1>
          <p className={`mb-6 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Update your post content and details.
            {user?.role === 'farmer' && ' Your changes will be reviewed by experts before appearing publicly.'}
          </p>
          
          {/* Error Alert */}
          {error && (
            <div className={`mb-6 p-4 rounded-lg border transition-colors duration-300 ${
              theme === 'dark' 
                ? 'bg-red-900/20 border-red-800' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <p className={theme === 'dark' ? 'text-red-300' : 'text-red-700'}>{error}</p>
              </div>
            </div>
          )}
          
          {/* Success Alert */}
          {success && (
            <div className={`mb-6 p-4 rounded-lg border transition-colors duration-300 ${
              theme === 'dark' 
                ? 'bg-green-900/20 border-green-800' 
                : 'bg-green-50 border-green-200'
            }`}>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                <p className={theme === 'dark' ? 'text-green-300' : 'text-green-700'}>{success}</p>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200 ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300'
                } border`}
                placeholder="Enter a descriptive title for your post"
                required
              />
            </div>
            
            {/* Category */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200 ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300'
                } border`}
                required
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option 
                    key={category._id} 
                    value={category._id}
                    disabled={category.expertOnly && user?.role !== 'expert' && user?.role !== 'admin'}
                  >
                    {category.name}
                    {category.expertOnly && ' (Experts Only)'}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Tags */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Tags (optional)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  className={`flex-1 px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200 ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300'
                  } border`}
                  placeholder="Add a tag and press Enter"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                    theme === 'dark' 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <div
                      key={tag}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                        theme === 'dark' 
                          ? 'bg-green-900 text-green-300' 
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className={`ml-2 transition-colors duration-200 ${
                          theme === 'dark' 
                            ? 'text-green-400 hover:text-green-300' 
                            : 'text-green-800 hover:text-green-900'
                        }`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Content */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Content
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows="12"
                className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200 ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300'
                } border`}
                placeholder="Share your knowledge, ask questions, or discuss farming topics..."
                required
              />
            </div>
            
            {/* Submit Buttons */}
            <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => navigate(`/forum/posts/${postId}`)}
                disabled={isSubmitting}
                className={`px-6 py-2 rounded-lg transition-colors duration-200 disabled:opacity-50 ${
                  theme === 'dark' 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                } border`}
              >
                Cancel
              </button>
              
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Post'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditPostPage;
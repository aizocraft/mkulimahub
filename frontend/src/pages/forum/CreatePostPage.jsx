import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { forumAPI } from '../../api';
import {
  ArrowLeft,
  Plus,
  X,
  AlertCircle,
  Loader2
} from 'lucide-react';
import AttachmentDisplay from '../../components/AttachmentDisplay';
import { uploadAPI } from '../../api';
import { toast } from 'react-toastify';

const CreatePostPage = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: []
  });

  const [tagInput, setTagInput] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState({}); // fileName -> percent

  useEffect(() => {
    if (isLoading) return; // Wait for auth to load

    if (!user) {
      navigate('/login');
      return;
    }

    fetchCategories();
  }, [user, isLoading, navigate]);

  const fetchCategories = async () => {
    try {
      const response = await forumAPI.getCategories();
      setCategories(response.data.categories || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories');
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
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 10) {
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
    
    if (formData.title.trim().length < 5) {
      setError('Title must be at least 5 characters');
      return;
    }
    
    if (!formData.content.trim()) {
      setError('Content is required');
      return;
    }
    
    if (formData.content.trim().length < 10) {
      setError('Content must be at least 10 characters');
      return;
    }
    
    if (!formData.category) {
      setError('Please select a category');
      return;
    }
    
    // Validate category exists
    const selectedCategory = categories.find(c => c._id === formData.category);
    if (!selectedCategory) {
      setError('Selected category not found. Please refresh the page and try again.');
      return;
    }
    
    // Check category permissions
    if (selectedCategory.expertOnly && user?.role !== 'expert' && user?.role !== 'admin') {
      setError('This category is for experts only. Please select a different category.');
      return;
    }
    
    if (!selectedCategory.isActive) {
      setError('This category is not active. Please select a different category.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const postData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        category: formData.category.trim(),
        tags: formData.tags.map(tag => tag.trim().toLowerCase()),
        attachments: attachments.map(a => ({
          fileId: a.fileId,
          filename: a.filename,
          size: a.size,
          fileType: a.fileType
        }))
      };

      const response = await forumAPI.createPost(postData);

      if (response.data.requiresReview) {
        toast.success('Post created successfully! It will be reviewed by an expert before appearing publicly.', {
          position: 'top-center',
          autoClose: 3000
        });
      } else {
        toast.success('Post created successfully!', {
          position: 'top-center',
          autoClose: 2000
        });
      }

      // Reset form
      setFormData({
        title: '',
        content: '',
        category: '',
        tags: []
      });

      setTimeout(() => {
        navigate(`/forum/posts/${response.data.post?.id || response.data.post?._id}`);
      }, 2000);
      
    } catch (err) {
      let errorMessage = 'Failed to create post';

      if (err.response?.data) {
        const errorData = err.response.data;

        if (errorData.errors && Array.isArray(errorData.errors)) {
          errorMessage = errorData.errors.join(', ');
        } else if (errorData.message) {
          errorMessage = errorData.message;
          // Provide more specific error messages
          if (errorData.message.includes('category') || errorData.message.includes('Category')) {
            if (errorData.message.includes('required')) {
              errorMessage = 'Category is required. Please select a valid category.';
            } else if (errorData.message.includes('not found')) {
              errorMessage = 'Selected category not found. Please refresh the page.';
            } else if (errorData.message.includes('invalid')) {
              errorMessage = 'Invalid category selected. Please choose a different category.';
            }
          }
        } else if (errorData.validationErrors) {
          errorMessage = Object.entries(errorData.validationErrors)
            .map(([field, message]) => `${field}: ${message}`)
            .join(', ');
        }
      } else if (!err.response) {
        errorMessage = 'Network error. Please check your connection.';
      } else if (err.response?.status === 400) {
        errorMessage = 'Bad request. Please check your input.';
      } else if (err.response?.status === 403) {
        errorMessage = 'You do not have permission to create this post.';
      } else if (err.response?.status === 404) {
        errorMessage = 'Category not found. Please refresh the page and try again.';
      }

      setError(errorMessage);
      
    } finally {
      setIsSubmitting(false);
    }
  };

  const MAX_FILE_SIZE = 5242880; // 5MB
  const ALLOWED_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ];

  const handleFilesSelected = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} is too large. Max file size is 5MB.`, { position: 'top-center' });
        continue;
      }
      if (ALLOWED_TYPES.length && !ALLOWED_TYPES.includes(file.type)) {
        toast.error(`${file.name} is not an allowed file type.`, { position: 'top-center' });
        continue;
      }

      try {
        setUploading(prev => ({ ...prev, [file.name]: 0 }));
        const resp = await uploadAPI.uploadFile(file, (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total || file.size));
          setUploading(prev => ({ ...prev, [file.name]: percent }));
        });

        const fileData = resp.data.file || resp.data.attachment || resp.data;
        const attachment = {
          fileId: fileData.id || fileData._id,
          filename: fileData.originalName || fileData.filename || file.name,
          size: fileData.size || file.size,
          fileType: fileData.mimeType || file.type || fileData.fileType,
          uploadedAt: fileData.createdAt || new Date().toISOString()
        };

        setAttachments(prev => [...prev, attachment]);
        toast.success(`${attachment.filename} uploaded`, { position: 'top-center', autoClose: 1500, hideProgressBar: true });
      } catch (err) {
        console.error('Upload error:', err);
        toast.error(`Failed to upload ${file.name}`, { position: 'top-center' });
      } finally {
        setUploading(prev => {
          const next = { ...prev };
          delete next[file.name];
          return next;
        });
      }
    }

    e.target.value = '';
  };

  const handleRemoveAttachment = async (index) => {
    const att = attachments[index];
    if (!att) return;
    if (att.fileId) {
      try {
        await uploadAPI.deleteFile(att.fileId);
      } catch (err) {
        console.warn('Failed to delete file on server:', err);
      }
    }
    setAttachments(prev => prev.filter((_, i) => i !== index));
    toast.info(`${att.filename} removed`, { position: 'top-center', autoClose: 1200, hideProgressBar: true });
  };



  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return null; // Let the useEffect handle navigation
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
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

        {/* Form */}
        <div className={`rounded-lg shadow-sm border p-6 transition-colors duration-300 ${
          theme === 'dark' 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <h1 className={`text-2xl font-bold mb-2 ${
            theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
          }`}>Create New Post</h1>
          <p className={`mb-6 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Share your knowledge or ask questions to the community.
            {user?.role === 'farmer' && ' Your post will be reviewed by experts before appearing publicly.'}
          </p>

          {/* Error Alert */}
          {error && (
            <div className={`mb-6 p-4 rounded-lg border transition-colors duration-300 ${
              theme === 'dark'
                ? 'bg-red-900/20 border-red-800'
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className={`font-medium ${theme === 'dark' ? 'text-red-300' : 'text-red-700'}`}>
                    Error creating post
                  </p>
                  <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
                    {error}
                  </p>
                  <div className="mt-2 space-x-2">
                    <button
                      onClick={() => fetchCategories()}
                      className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                    >
                      Refresh Categories
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Title *
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
                minLength="5"
                maxLength="200"
              />
              <div className="flex justify-between mt-1">
                <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                  {formData.title.length < 5 
                    ? `Need ${5 - formData.title.length} more characters`
                    : '✓ Good'
                  }
                </span>
                <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                  {formData.title.length}/200
                </span>
              </div>
            </div>
            
            {/* Category */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Category *
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
                <option value="">-- Select a category --</option>
                {categories.map((category) => {
                  const isDisabled = category.expertOnly && user?.role !== 'expert' && user?.role !== 'admin';
                  return (
                    <option 
                      key={category._id} 
                      value={category._id}
                      disabled={isDisabled}
                      className={isDisabled ? 'text-gray-400' : ''}
                    >
                      {category.name}
                      {category.expertOnly && ' (Experts Only)'}
                      {!category.isActive && ' (Inactive)'}
                    </option>
                  );
                })}
              </select>
              {formData.category && (
                <div className="mt-2">
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Selected: {categories.find(c => c._id === formData.category)?.name || 'Unknown category'}
                    {categories.find(c => c._id === formData.category)?.expertOnly && 
                      (user?.role !== 'expert' && user?.role !== 'admin') && (
                        <span className="ml-2 text-yellow-600 dark:text-yellow-400">
                          ⚠️ Requires expert permissions
                        </span>
                      )}
                    {!categories.find(c => c._id === formData.category)?.isActive && (
                      <span className="ml-2 text-red-600 dark:text-red-400">
                        ⚠️ Category is inactive
                      </span>
                    )}
                  </p>
                </div>
              )}
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
                  maxLength="50"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  disabled={!tagInput.trim() || formData.tags.length >= 10}
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                    theme === 'dark' 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50'
                  }`}
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map((tag, index) => (
                    <div
                      key={`${tag}-${index}`}
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
              <div className="flex justify-between">
                <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                  Add relevant tags (optional)
                </span>
                <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                  {formData.tags.length}/10 tags
                </span>
              </div>
            </div>
            
            {/* Content */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Content *
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows="10"
                className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200 ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300'
                } border`}
                placeholder="Share your knowledge, ask questions, or discuss farming topics..."
                required
                minLength="10"
                maxLength="10000"
              />
              <div className="flex justify-between mt-1">
                <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                  {formData.content.length < 10 
                    ? `Need ${10 - formData.content.length} more characters`
                    : '✓ Good'
                  }
                </span>
                <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                  {formData.content.length}/10000
                </span>
              </div>
            </div>
            
            {/* Attachments */}
            <div className={`mb-4`}> 
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Attachments (optional)</label>
              <div className="flex items-center gap-3 mb-2">
                <input
                  type="file"
                  multiple
                  onChange={handleFilesSelected}
                  className="text-sm"
                />
              </div>

              {/* show uploading progress */}
              {Object.keys(uploading).length > 0 && (
                <div className="space-y-2 mb-2">
                  {Object.entries(uploading).map(([name, percent]) => (
                    <div key={name} className="text-sm">
                      <div className="flex justify-between">
                        <span className="truncate max-w-[60%]">{name}</span>
                        <span className="ml-2">{percent}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded h-2 mt-1 overflow-hidden">
                        <div className="h-2 bg-green-600" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* attachments list */}
              <AttachmentDisplay attachments={attachments} canDelete={true} onDelete={handleRemoveAttachment} theme={theme} />
            </div>

            {/* User Info */}
            <div className={`p-3 rounded-lg ${
              theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
            }`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                <span className="font-medium">Posting as:</span> {user?.name} ({user?.role})
                {user?.role === 'farmer' && (
                  <span className="ml-2 text-yellow-600 dark:text-yellow-400">
                    ⓘ Your posts will be reviewed by experts before appearing publicly
                  </span>
                )}
              </p>
            </div>
            
            {/* Submit Buttons */}
            <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => navigate('/forum')}
                disabled={isSubmitting}
                className={`px-6 py-2 rounded-lg transition-colors duration-200 disabled:opacity-50 ${
                  theme === 'dark'
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                } border`}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting || !formData.category || formData.title.trim().length < 5 || formData.content.trim().length < 10}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Post'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePostPage;
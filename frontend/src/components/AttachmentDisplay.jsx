import React, { useState, useCallback, useRef } from 'react';
import { X, File, Download, FileText, Eye, EyeOff, Upload, Image, Video, FileIcon, AlertCircle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AttachmentDisplay = ({
  attachments,
  canDelete,
  onDelete,
  theme,
  onFilesSelected,
  compact = false,
  showDragDrop = false,
  uploadProgress = {}
}) => {
  const [expandedAttachments, setExpandedAttachments] = useState({});
  const [isDragOver, setIsDragOver] = useState(false);
  const [filePreviews, setFilePreviews] = useState({});
  const fileInputRef = useRef(null);

  const getFileUrl = (attachment) => {
    // Use fileId to construct full API URL for MongoDB stored files
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    return attachment.fileId ? `${baseUrl}/uploads/${attachment.fileId}` : attachment.url || `/uploads/${attachment.filename}`;
  };

  const getDataUrl = (attachment) => {
    return attachment.dataUrl || getFileUrl(attachment);
  };

  const formatFileSize = (size) => {
    if (!size) return '';
    const units = ['B', 'KB', 'MB', 'GB'];
    let i = 0;
    while (size >= 1024 && i < units.length - 1) {
      size /= 1024;
      i++;
    }
    return `${size.toFixed(1)} ${units[i]}`;
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString();
  };

  const getFileIcon = (type) => {
    // Return a generic icon, perhaps from lucide-react
    return <File className="w-8 h-8 text-gray-500" />;
  };

  const toggleAttachmentView = (index) => {
    setExpandedAttachments(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Drag and drop handlers
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && onFilesSelected) {
      onFilesSelected(files);
    }
  }, [onFilesSelected]);

  const handleFileSelect = useCallback((e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0 && onFilesSelected) {
      onFilesSelected(files);
    }
  }, [onFilesSelected]);

  const renderAttachmentContent = (attachment, index) => {
    const fileUrl = getFileUrl(attachment);
    const fileType = attachment.fileType?.toLowerCase();

    if (fileType?.startsWith('image/')) {
      return (
        <div className="mt-3">
          <img
            src={fileUrl}
            alt={attachment.filename}
            className="max-w-full h-auto rounded-lg shadow-sm"
            style={{ maxHeight: '600px', objectFit: 'contain' }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      );
    }

    if (fileType?.startsWith('video/')) {
      return (
        <div className="mt-3">
          <video
            src={fileUrl}
            controls
            className="max-w-full h-auto rounded-lg shadow-sm"
            style={{ maxHeight: '400px' }}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    if (fileType?.includes('pdf')) {
      return (
        <div className="mt-3">
          <iframe
            src={fileUrl}
            className="w-full h-96 border rounded-lg"
            title={attachment.filename}
          >
            <p>Your browser does not support iframes. <a href={fileUrl} target="_blank" rel="noopener noreferrer">Download the PDF</a></p>
          </iframe>
        </div>
      );
    }

    // For other file types, try to embed them
    if (fileType?.includes('text/') || fileType?.includes('json') || fileType?.includes('xml')) {
      return (
        <div className="mt-3">
          <iframe
            src={fileUrl}
            className="w-full h-96 border rounded-lg"
            title={attachment.filename}
          >
            <p>Cannot display this file type inline. <a href={fileUrl} target="_blank" rel="noopener noreferrer">Download the file</a></p>
          </iframe>
        </div>
      );
    }

    return (
      <div className="mt-3 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-center">
        <FileText className="w-12 h-12 mx-auto mb-2 text-gray-500" />
        <p className="text-sm text-gray-600 dark:text-gray-400">
          This file type cannot be displayed inline.
        </p>
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm underline"
        >
          Open in new tab
        </a>
      </div>
    );
  };

  // Drag and drop zone
  const renderDragDropZone = () => {
    if (!showDragDrop) return null;

    return (
      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 cursor-pointer ${
          isDragOver
            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
            : theme === 'dark'
              ? 'border-gray-600 hover:border-gray-500 bg-gray-800/50'
              : 'border-gray-300 hover:border-gray-400 bg-gray-50'
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,.pdf,.doc,.docx,.txt"
          onChange={handleFileSelect}
          className="hidden"
        />

        <motion.div
          animate={{ scale: isDragOver ? 1.1 : 1 }}
          transition={{ duration: 0.2 }}
        >
          <Upload className={`w-12 h-12 mx-auto mb-4 ${
            isDragOver ? 'text-green-500' : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`} />
          <h3 className={`text-lg font-medium mb-2 ${
            theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
          }`}>
            {isDragOver ? 'Drop files here' : 'Drag & drop files here'}
          </h3>
          <p className={`text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            or click to browse files
          </p>
          <p className={`text-xs mt-2 ${
            theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
          }`}>
            Supports images, videos, PDFs, and documents (max 10MB each)
          </p>
        </motion.div>
      </motion.div>
    );
  };

  if (attachments.length === 0 && !showDragDrop) return null;

  // Compact view
  if (compact && attachments.length <= 3) {
    return (
      <div className="flex flex-wrap gap-2">
        {attachments.map((attachment, index) => {
          const fileUrl = getFileUrl(attachment);
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-1"
            >
              <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                <span className="truncate max-w-[150px]">{attachment.filename}</span>
                {canDelete && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.preventDefault();
                      onDelete && onDelete(index);
                    }}
                    className="ml-1 hover:opacity-70"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                )}
              </a>
            </motion.div>
          );
        })}
      </div>
    );
  }

  // Full view - detailed attachment cards
  return (
    <div className="space-y-4">
      {/* Drag and Drop Zone */}
      {renderDragDropZone()}

      {/* Existing Attachments */}
      {attachments.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-lg p-4 space-y-3 mb-4 ${
            theme === 'dark'
              ? 'bg-gray-900/50 border border-gray-700'
              : 'bg-gray-50 border border-gray-200'
          }`}
        >
          <div className="flex items-center gap-2 mb-3">
            <File className={`w-5 h-5 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`} />
            <h4 className={`font-semibold ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
            }`}>
              Attachments ({attachments.length})
            </h4>
          </div>

          <div className="space-y-2">
            <AnimatePresence>
              {attachments.map((attachment, index) => {
                const fileUrl = getFileUrl(attachment);
                const dataUrl = getDataUrl(attachment);
                const isExpanded = expandedAttachments[index];
                const progress = uploadProgress[attachment.filename];

                return (
                  <motion.div
                    key={attachment.filename || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-3 rounded border transition-all ${
                      theme === 'dark'
                        ? 'bg-gray-800 border-gray-700 hover:border-gray-600'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          {attachment.fileType?.toLowerCase().startsWith('image/') ? (
                            <motion.img
                              src={dataUrl || fileUrl}
                              alt={attachment.filename}
                              className="w-16 h-12 rounded object-cover"
                              whileHover={{ scale: 1.05 }}
                            />
                          ) : attachment.fileType?.toLowerCase().startsWith('video/') ? (
                            <motion.div
                              className="w-16 h-12 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center"
                              whileHover={{ scale: 1.05 }}
                            >
                              <Video className="w-6 h-6 text-gray-500" />
                            </motion.div>
                          ) : attachment.fileType?.toLowerCase().includes('pdf') ? (
                            <motion.div
                              className="w-16 h-12 rounded flex items-center justify-center bg-red-100 dark:bg-red-900/20"
                              whileHover={{ scale: 1.05 }}
                            >
                              <FileText className="w-6 h-6 text-red-500" />
                            </motion.div>
                          ) : (
                            <motion.div
                              className="w-16 h-12 rounded flex items-center justify-center bg-gray-100 dark:bg-gray-700"
                              whileHover={{ scale: 1.05 }}
                            >
                              {getFileIcon(attachment.fileType)}
                            </motion.div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`block truncate font-medium hover:underline ${
                              theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                            }`}
                            title={attachment.filename}
                          >
                            {attachment.filename}
                          </a>
                          <div className={`text-xs flex items-center gap-2 ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            <span>{formatFileSize(attachment.size)}</span>
                            <span>•</span>
                            <span>{formatDate(attachment.uploadedAt)}</span>
                            {progress && (
                              <>
                                <span>•</span>
                                <span className="text-green-600 dark:text-green-400">
                                  {progress === 100 ? 'Complete' : `Uploading ${progress}%`}
                                </span>
                              </>
                            )}
                          </div>

                          {/* Progress Bar */}
                          {progress && progress < 100 && (
                            <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                              <motion.div
                                className="bg-green-600 h-1 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.3 }}
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        {/* View/Hide Content Button */}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => toggleAttachmentView(index)}
                          className={`p-2 rounded transition-all ${
                            theme === 'dark'
                              ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                          }`}
                          title={isExpanded ? 'Hide content' : 'View content'}
                        >
                          {isExpanded ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </motion.button>

                        <motion.a
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          href={fileUrl}
                          download={attachment.filename}
                          className={`p-2 rounded transition-all ${
                            theme === 'dark'
                              ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                          }`}
                          title="Download attachment"
                        >
                          <Download className="w-5 h-5" />
                        </motion.a>

                        {canDelete && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onDelete && onDelete(index)}
                            className={`p-2 rounded transition-all ${
                              theme === 'dark'
                                ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20'
                                : 'text-red-600 hover:text-red-700 hover:bg-red-50'
                            }`}
                            title="Delete attachment"
                          >
                            <X className="w-5 h-5" />
                          </motion.button>
                        )}
                      </div>
                    </div>

                    {/* Expanded Content */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="border-t pt-3"
                          style={{ borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}
                        >
                          {renderAttachmentContent(attachment, index)}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AttachmentDisplay;

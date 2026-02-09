import React, { useState } from 'react';
import { X, File, Download, FileText, Eye, EyeOff } from 'lucide-react';

const AttachmentDisplay = ({ attachments, canDelete, onDelete, theme }) => {
  const [expandedAttachments, setExpandedAttachments] = useState({});

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

  if (attachments.length === 0) return null;

  // Compact view
  if (attachments.length <= 3) {
    return (
      <div className="flex flex-wrap gap-2">
        {attachments.map((attachment, index) => {
          const fileUrl = getFileUrl(attachment);
          return (
            <div key={index} className="flex items-center gap-1">
              <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                <span className="truncate max-w-[150px]">{attachment.filename}</span>
                {canDelete && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      onDelete && onDelete(index);
                    }}
                    className="ml-1 hover:opacity-70"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </a>
            </div>
          );
        })}
      </div>
    );
  }

  // Full view - detailed attachment cards
  return (
    <div className={`rounded-lg p-4 space-y-3 mb-4 ${
      theme === 'dark'
        ? 'bg-gray-900/50 border border-gray-700'
        : 'bg-gray-50 border border-gray-200'
    }`}>
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
        {attachments.map((attachment, index) => {
          const fileUrl = getFileUrl(attachment);
          const dataUrl = getDataUrl(attachment);
          const isExpanded = expandedAttachments[index];
          return (
            <div
              key={index}
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
                      <img src={dataUrl || fileUrl} alt={attachment.filename} className="w-16 h-12 rounded object-cover" />
                    ) : attachment.fileType?.toLowerCase().startsWith('video/') ? (
                      <video src={fileUrl} className="w-16 h-12 rounded object-cover" />
                    ) : attachment.fileType?.toLowerCase().includes('pdf') ? (
                      <div className="w-16 h-12 rounded flex items-center justify-center bg-gray-100">
                        <FileText className="w-6 h-6 text-gray-500" />
                      </div>
                    ) : (
                      <div className="w-16 h-12 rounded flex items-center justify-center bg-gray-100">
                        {getFileIcon(attachment.fileType)}
                      </div>
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
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  {/* View/Hide Content Button */}
                  <button
                    onClick={() => toggleAttachmentView(index)}
                    className={`p-2 rounded transition-all ${
                      theme === 'dark'
                        ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                    title={isExpanded ? 'Hide content' : 'View content'}
                  >
                    {isExpanded ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>

                  <a
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
                  </a>

                  {canDelete && (
                    <button
                      onClick={() => onDelete && onDelete(index)}
                      className={`p-2 rounded transition-all ${
                        theme === 'dark'
                          ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20'
                          : 'text-red-600 hover:text-red-700 hover:bg-red-50'
                      }`}
                      title="Delete attachment"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t pt-3" style={{ borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}>
                  {renderAttachmentContent(attachment, index)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AttachmentDisplay;

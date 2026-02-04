import React from 'react';
import { Download, File, FileText, Image as ImageIcon, Music, Video, Archive, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const AttachmentDisplay = ({ attachments = [], onDelete = null, canDelete = false, compact = false }) => {
  const { theme } = useTheme();
  
  if (!attachments || attachments.length === 0) return null;

  const getFileIcon = (fileType) => {
    if (!fileType) return <File className="w-5 h-5" />;
    
    const type = fileType.toLowerCase();
    if (type.startsWith('image/')) return <ImageIcon className="w-5 h-5" />;
    if (type.startsWith('video/')) return <Video className="w-5 h-5" />;
    if (type.startsWith('audio/')) return <Music className="w-5 h-5" />;
    if (type.includes('zip') || type.includes('rar') || type.includes('compress')) 
      return <Archive className="w-5 h-5" />;
    if (type.includes('pdf') || type.includes('word') || type.includes('document'))
      return <FileText className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffHours < 168) return `${Math.floor(diffHours / 24)}d ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  if (compact) {
    // Compact view - show as badges
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {attachments.map((attachment, index) => (
          <a
            key={index}
            href={attachment.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 px-3 py-1 rounded text-sm font-medium transition-all ${
              theme === 'dark'
                ? 'bg-blue-900/30 text-blue-300 hover:bg-blue-900/50'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
            title={`${attachment.filename} - ${formatDate(attachment.uploadedAt)}`}
          >
            {attachment.fileType?.toLowerCase().startsWith('image/') ? (
              <img src={attachment.url} alt={attachment.filename} className="w-8 h-8 rounded object-cover" />
            ) : (
              getFileIcon(attachment.fileType)
            )}
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
        ))}
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
        {attachments.map((attachment, index) => (
          <div
            key={index}
            className={`flex items-center justify-between p-3 rounded border transition-all ${
              theme === 'dark'
                ? 'bg-gray-800 border-gray-700 hover:border-gray-600'
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex-shrink-0">
                {attachment.fileType?.toLowerCase().startsWith('image/') ? (
                  <img src={attachment.url} alt={attachment.filename} className="w-28 h-20 rounded object-cover" />
                ) : attachment.fileType?.toLowerCase().startsWith('video/') ? (
                  <video src={attachment.url} className="w-28 h-20 rounded object-cover" controls />
                ) : attachment.fileType?.toLowerCase().includes('pdf') ? (
                  <div className="w-28 h-20 rounded flex items-center justify-center bg-gray-100">
                    <FileText className="w-8 h-8 text-gray-500" />
                  </div>
                ) : (
                  <div className="w-28 h-20 rounded flex items-center justify-center bg-gray-100">
                    {getFileIcon(attachment.fileType)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <a
                  href={attachment.url}
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
              <a
                href={attachment.url}
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
        ))}
      </div>
    </div>
  );
};

export default AttachmentDisplay;

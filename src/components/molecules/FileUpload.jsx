import React, { useState, useCallback } from 'react';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import { toast } from 'react-toastify';

const FileUpload = ({ files = [], onFilesChange, disabled = false }) => {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  const validateFile = (file) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'text/plain',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/zip'
    ];

    if (file.size > maxSize) {
      toast.error('File size must be less than 10MB');
      return false;
    }

    if (!allowedTypes.includes(file.type)) {
      toast.error('File type not supported');
      return false;
    }

    return true;
  };

  const handleFiles = useCallback(async (fileList) => {
    const validFiles = Array.from(fileList).filter(validateFile);
    if (validFiles.length === 0) return;

    setUploading(true);
    
    try {
      const newFiles = [];
      
      for (const file of validFiles) {
        // Simulate file upload with progress
        const fileData = {
          Id: Date.now() + Math.random(),
          name: file.name,
          size: file.size,
          type: file.type,
          url: URL.createObjectURL(file), // For preview
          uploadedAt: new Date().toISOString()
        };
        
        newFiles.push(fileData);
      }

      onFilesChange([...files, ...newFiles]);
      toast.success(`${validFiles.length} file(s) uploaded successfully`);
    } catch (error) {
      toast.error('Failed to upload files');
    } finally {
      setUploading(false);
    }
  }, [files, onFilesChange]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    
    if (disabled || uploading) return;
    
    const files = e.dataTransfer.files;
    handleFiles(files);
  }, [handleFiles, disabled, uploading]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    if (!disabled && !uploading) {
      setDragOver(true);
    }
  }, [disabled, uploading]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleFileInput = useCallback((e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  }, [handleFiles]);

  const handleDelete = useCallback((fileId) => {
    const updatedFiles = files.filter(file => file.Id !== fileId);
    onFilesChange(updatedFiles);
    toast.success('File removed');
  }, [files, onFilesChange]);

  const handleDownload = useCallback((file) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    link.click();
    toast.success('File downloaded');
  }, []);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return 'Image';
    if (type === 'application/pdf') return 'FileText';
    if (type.includes('word')) return 'FileText';
    if (type.includes('sheet')) return 'FileSpreadsheet';
    if (type.includes('zip')) return 'Archive';
    return 'File';
  };

  const isImage = (type) => type.startsWith('image/');

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-all
          ${dragOver ? 'drop-zone-active' : 'drop-zone'}
          ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary/50'}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && !uploading && document.getElementById('file-upload').click()}
      >
        <input
          id="file-upload"
          type="file"
          multiple
          className="hidden"
          onChange={handleFileInput}
          disabled={disabled || uploading}
        />
        
        <div className="space-y-2">
          <ApperIcon name={uploading ? "Loader" : "Upload"} size={32} className={`mx-auto text-primary ${uploading ? 'animate-spin' : ''}`} />
          <div>
            <p className="text-sm font-medium text-gray-900">
              {uploading ? 'Uploading files...' : 'Drop files here or click to browse'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Supports images, PDFs, documents up to 10MB
            </p>
          </div>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
            <ApperIcon name="Paperclip" size={16} />
            Attached Files ({files.length})
          </h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {files.map((file) => (
              <div
                key={file.Id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover-lift"
              >
                {/* Thumbnail/Icon */}
                <div className="flex-shrink-0">
                  {isImage(file.type) ? (
                    <img
                      src={file.url}
                      alt={file.name}
                      className="w-10 h-10 object-cover rounded border"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-white rounded border flex items-center justify-center">
                      <ApperIcon name={getFileIcon(file.type)} size={20} className="text-primary" />
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate" title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(file)}
                    disabled={disabled}
                    className="p-1"
                  >
                    <ApperIcon name="Download" size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(file.Id)}
                    disabled={disabled}
                    className="p-1 text-error hover:text-error"
                  >
                    <ApperIcon name="Trash2" size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
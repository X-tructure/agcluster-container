'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, X, FileIcon, AlertCircle, CheckCircle } from 'lucide-react';
import { uploadFiles, UploadFilesResponse } from '../lib/api-client';

interface FileUploadModalProps {
  sessionId: string;
  onClose: () => void;
  onUploadComplete: () => void;
  currentPath?: string;
}

export function FileUploadModal({
  sessionId,
  onClose,
  onUploadComplete,
  currentPath = ''
}: FileUploadModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [overwrite, setOverwrite] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<UploadFilesResponse | null>(null);
  const [targetPath, setTargetPath] = useState(currentPath);
  const [pathError, setPathError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const checkDirectoryExists = useCallback(async (path: string): Promise<boolean> => {
    if (!path) return true; // Empty = root, always valid

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const apiKey = localStorage.getItem('anthropic_api_key');

      if (!apiKey) return false;

      // Fetch file tree
      const res = await fetch(`${apiUrl}/api/files/${sessionId}`, {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });

      if (!res.ok) return false;

      const data = await res.json();

      // Recursively search tree for path
      const findPath = (node: any, targetPath: string): boolean => {
        if (node.path === targetPath && node.type === 'directory') return true;
        if (node.children) {
          return node.children.some((child: any) => findPath(child, targetPath));
        }
        return false;
      };

      return findPath(data.tree, path);
    } catch {
      return false;
    }
  }, [sessionId]);

  // Validate target path with debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (targetPath) {
        const exists = await checkDirectoryExists(targetPath);
        if (!exists) {
          setPathError(`Directory "${targetPath}" does not exist`);
        } else {
          setPathError(null);
        }
      } else {
        setPathError(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [targetPath, checkDirectoryExists]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...newFiles]);
      setError(null);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one file');
      return;
    }

    const apiKey = localStorage.getItem('anthropic_api_key');
    if (!apiKey) {
      setError('No API key found. Please launch an agent first.');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await uploadFiles({
        sessionId,
        files: selectedFiles,
        targetPath: targetPath,
        overwrite,
        apiKey
      });

      setSuccess(result);
      setSelectedFiles([]);

      // Wait a moment then close and trigger refresh
      setTimeout(() => {
        onUploadComplete();
        onClose();
      }, 1500);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const totalSize = selectedFiles.reduce((sum, file) => sum + file.size, 0);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[var(--bg-base)] border border-[var(--border-glass)] rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-glass)]">
          <h2 className="text-lg font-semibold">Upload Files</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[var(--btn-secondary-bg)] rounded"
            disabled={uploading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Target Path */}
          <div className="mb-4">
            <label className="block text-sm text-[var(--text-secondary)] mb-1">
              Target Directory (relative to /workspace)
            </label>
            <input
              type="text"
              value={targetPath}
              onChange={(e) => setTargetPath(e.target.value)}
              placeholder="Leave empty for workspace root, or enter folder path (e.g., data, models/bert)"
              disabled={uploading}
              className={`w-full px-3 py-2 bg-[var(--input-bg)] border rounded text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 ${
                pathError ? 'border-red-500 focus:ring-red-500' : 'border-[var(--input-border)] focus:ring-slate-400/50'
              } disabled:opacity-50`}
            />
            {pathError ? (
              <div className="mt-1 flex items-center gap-1 text-xs text-red-500 dark:text-red-400">
                <AlertCircle className="w-3 h-3" />
                {pathError}
              </div>
            ) : (
              <div className="mt-1 text-xs text-[var(--text-secondary)]">
                Files will be uploaded to: /workspace{targetPath ? `/${targetPath}` : ''}
              </div>
            )}
          </div>

          {/* File Input */}
          <div className="mb-4">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-[var(--border-glass-hover)] hover:border-[var(--text-secondary)] rounded-lg transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              disabled={uploading}
            >
              <Upload className="w-5 h-5" />
              <span>Select Files</span>
            </button>
          </div>

          {/* Selected Files List */}
          {selectedFiles.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm text-[var(--text-secondary)]">
                  Selected Files ({selectedFiles.length})
                </label>
                <span className="text-xs text-[var(--text-secondary)]">
                  Total: {formatFileSize(totalSize)}
                </span>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between gap-2 px-3 py-2 bg-[var(--input-bg-secondary)] rounded border border-[var(--border-glass)]"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <FileIcon className="w-4 h-4 text-[var(--text-secondary)] flex-shrink-0" />
                      <span className="text-sm truncate" title={file.name}>
                        {file.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[var(--text-secondary)]">
                        {formatFileSize(file.size)}
                      </span>
                      {!uploading && (
                        <button
                          onClick={() => removeFile(index)}
                          className="p-1 hover:bg-[var(--btn-secondary-bg)] rounded"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Overwrite Option */}
          {selectedFiles.length > 0 && (
            <div className="mb-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={overwrite}
                  onChange={(e) => setOverwrite(e.target.checked)}
                  className="rounded"
                  disabled={uploading}
                />
                <span className="text-[var(--text-secondary)]">
                  Overwrite existing files
                </span>
              </label>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 text-sm text-red-600 dark:text-red-200">
                {error}
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/50 rounded flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 text-sm text-green-700 dark:text-green-200">
                Successfully uploaded {success.total_files} file(s)
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--border-glass)] flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm hover:bg-[var(--btn-secondary-bg)] rounded text-[var(--text-primary)] transition-colors"
            disabled={uploading}
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            className="px-4 py-2 text-sm bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] rounded flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-[var(--text-primary)]"
            disabled={uploading || selectedFiles.length === 0 || pathError !== null}
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-[var(--text-secondary)] border-t-[var(--text-primary)] rounded-full animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Upload</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

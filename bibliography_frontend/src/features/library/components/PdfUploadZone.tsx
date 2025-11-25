import React, { useRef, useState, useCallback } from 'react';
import { DocumentArrowUpIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { cn } from '@/common/utils';

interface PdfUploadZoneProps {
  onFileSelected: (file: File) => void;
  currentPdf?: {
    originalName: string;
    size: number;
  };
  selectedFile?: File | null;
  disabled?: boolean;
}

/**
 * PDF Upload Zone Component (Session 10)
 *
 * Features:
 * - Drag-and-drop file upload
 * - Click-to-browse file input
 * - Visual feedback on drag-over
 * - MIME type validation (PDF only)
 * - Shows current PDF if exists
 * - Shows selected file pending upload
 *
 * Adapted from editor_frontend FileUpload.tsx drag-drop pattern
 */
export const PdfUploadZone: React.FC<PdfUploadZoneProps> = ({
  onFileSelected,
  currentPdf,
  selectedFile,
  disabled = false,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Validate MIME type
    if (file.type !== 'application/pdf') {
      return `Invalid file type: ${file.type}. Only PDF files are allowed.`;
    }

    // Validate file size (50MB max)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Maximum size is 50MB.`;
    }

    return null;
  };

  const handleFile = useCallback(
    (file: File) => {
      if (disabled) return;

      const error = validateFile(file);
      if (error) {
        setValidationError(error);
        return;
      }

      setValidationError(null);
      onFileSelected(file);
    },
    [disabled, onFileSelected]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) {
        setIsDragOver(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      if (disabled) return;

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0 && files[0]) {
        handleFile(files[0]);
      }
    },
    [disabled, handleFile]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0 && files[0]) {
        handleFile(files[0]);
      }
    },
    [handleFile]
  );

  const handleBrowseClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  // Show selected file pending upload
  if (selectedFile) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-app-text-secondary">PDF Attachment</label>
        <div className="flex items-center gap-3 p-3 border border-app-accent bg-app-accent/5 rounded">
          <CheckCircleIcon className="w-5 h-5 text-app-accent flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-app-text-primary truncate">
              {selectedFile.name}
            </p>
            <p className="text-xs text-app-text-secondary">{formatFileSize(selectedFile.size)}</p>
          </div>
          <span className="text-xs text-app-accent font-medium">Pending upload</span>
        </div>
      </div>
    );
  }

  // Show current PDF if exists
  if (currentPdf) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-app-text-secondary">PDF Attachment</label>
        <div className="flex items-center gap-3 p-3 border border-app-border bg-app-surface rounded">
          <DocumentArrowUpIcon className="w-5 h-5 text-app-text-muted flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-app-text-primary truncate">
              {currentPdf.originalName}
            </p>
            <p className="text-xs text-app-text-secondary">{formatFileSize(currentPdf.size)}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={handleBrowseClick}
            disabled={disabled}
          >
            Replace
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled}
          data-testid="pdf-file-input-replace"
        />
      </div>
    );
  }

  // Show drop zone for new upload
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-app-text-secondary">PDF Attachment</label>
      <div
        data-testid="pdf-upload-zone"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
        className={cn(
          'relative border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer',
          isDragOver && !disabled
            ? 'border-app-accent bg-app-accent/5'
            : 'border-app-border hover:border-app-accent/50 hover:bg-app-surface',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <div className="flex flex-col items-center justify-center text-center">
          <DocumentArrowUpIcon
            className={cn(
              'w-10 h-10 mb-3',
              isDragOver ? 'text-app-accent' : 'text-app-text-muted'
            )}
          />
          <p className="text-sm font-medium text-app-text-primary mb-1">
            {isDragOver ? 'Drop PDF here' : 'Drop PDF here or click to browse'}
          </p>
          <p className="text-xs text-app-text-secondary">
            Supports PDF files up to 50MB
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled}
          data-testid="pdf-file-input"
        />
      </div>

      {/* Validation error */}
      {validationError && (
        <div className="flex items-start gap-2 p-3 border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800 rounded">
          <XCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600 dark:text-red-400">{validationError}</p>
        </div>
      )}
    </div>
  );
};

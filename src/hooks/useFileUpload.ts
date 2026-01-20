import { useState, useCallback, useRef } from 'react';

export interface FileWithPreview {
  id: string;
  file: File;
  preview: string | null;
}

interface UseFileUploadOptions {
  accept?: string;
  maxSize?: number; // in bytes
  multiple?: boolean;
}

interface UseFileUploadState {
  files: FileWithPreview[];
  isDragging: boolean;
  errors: string[];
}

interface UseFileUploadActions {
  openFileDialog: () => void;
  removeFile: (id: string) => void;
  handleDragEnter: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  clearFiles: () => void;
}

export function useFileUpload(options: UseFileUploadOptions = {}): [
  UseFileUploadState,
  UseFileUploadActions,
  React.RefObject<HTMLInputElement | null>
] {
  const { accept = 'image/*', maxSize = 5 * 1024 * 1024, multiple = false } = options;

  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const processFiles = useCallback((fileList: FileList | null) => {
    if (!fileList) return;

    const newErrors: string[] = [];
    const newFiles: FileWithPreview[] = [];

    Array.from(fileList).forEach((file) => {
      // Check file size
      if (file.size > maxSize) {
        newErrors.push(`${file.name} exceeds maximum size of ${Math.round(maxSize / 1024 / 1024)}MB`);
        return;
      }

      // Check file type
      if (accept && accept !== '*') {
        const acceptedTypes = accept.split(',').map(t => t.trim());
        const isAccepted = acceptedTypes.some(type => {
          if (type.endsWith('/*')) {
            return file.type.startsWith(type.replace('/*', '/'));
          }
          return file.type === type || file.name.endsWith(type);
        });

        if (!isAccepted) {
          newErrors.push(`${file.name} is not an accepted file type`);
          return;
        }
      }

      // Create preview for images
      const preview = file.type.startsWith('image/')
        ? URL.createObjectURL(file)
        : null;

      newFiles.push({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        preview,
      });
    });

    setErrors(newErrors);

    if (multiple) {
      setFiles(prev => [...prev, ...newFiles]);
    } else {
      // Revoke old previews
      files.forEach(f => {
        if (f.preview) URL.revokeObjectURL(f.preview);
      });
      setFiles(newFiles.slice(0, 1));
    }
  }, [accept, maxSize, multiple, files]);

  const openFileDialog = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file?.preview) URL.revokeObjectURL(file.preview);
      return prev.filter(f => f.id !== id);
    });
    setErrors([]);
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  }, [processFiles]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  }, [processFiles]);

  const clearFiles = useCallback(() => {
    files.forEach(f => {
      if (f.preview) URL.revokeObjectURL(f.preview);
    });
    setFiles([]);
    setErrors([]);
  }, [files]);

  return [
    { files, isDragging, errors },
    {
      openFileDialog,
      removeFile,
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      handleFileChange,
      clearFiles,
    },
    inputRef,
  ];
}

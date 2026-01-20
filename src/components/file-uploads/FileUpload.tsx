import { ImageUp, X, AlertCircle } from 'lucide-react';
import { useFileUpload } from '../../hooks/useFileUpload';

interface FileUploadProps {
  maxSizeMB?: number;
  onFileSelected?: (file: File | null) => void;
}

export function FileUpload({ maxSizeMB = 5, onFileSelected }: FileUploadProps) {
  const maxSize = maxSizeMB * 1024 * 1024;

  const [state, actions, inputRef] = useFileUpload({
    accept: 'image/*',
    maxSize,
  });

  const previewUrl = state.files[0]?.preview || null;

  const handleRemove = () => {
    if (state.files[0]) {
      actions.removeFile(state.files[0].id);
      onFileSelected?.(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    actions.handleFileChange(e);
    const file = e.target.files?.[0] || null;
    onFileSelected?.(file);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        {/* Drop area */}
        <div
          className={`relative flex min-h-52 flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed p-4 transition-colors
            ${previewUrl ? 'border-transparent' : 'border-zinc-700 hover:bg-zinc-800/50'}
            ${state.isDragging ? 'bg-zinc-800/50' : ''}
          `}
          onClick={actions.openFileDialog}
          onDragEnter={actions.handleDragEnter}
          onDragLeave={actions.handleDragLeave}
          onDragOver={actions.handleDragOver}
          onDrop={actions.handleDrop}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              actions.openFileDialog();
            }
          }}
        >
          <input
            ref={inputRef}
            className="sr-only"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            aria-label="Upload file"
          />

          {previewUrl ? (
            <div className="absolute inset-0">
              <img
                className="size-full object-cover"
                src={previewUrl}
                alt="Preview of uploaded image"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
              <div
                className="mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900"
                aria-hidden="true"
              >
                <ImageUp className="size-4 text-zinc-400" />
              </div>
              <p className="mb-1.5 text-sm font-medium text-zinc-200">
                Drop your image here or click to browse
              </p>
              <p className="text-xs text-zinc-500">Max size: {maxSizeMB}MB</p>
            </div>
          )}
        </div>

        {/* Remove button */}
        {previewUrl && (
          <div className="absolute right-4 top-4">
            <button
              className="z-50 flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition-colors outline-none hover:bg-black/80 focus-visible:ring-2 focus-visible:ring-white/50"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              type="button"
              aria-label="Remove image"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      {/* Error message */}
      {state.errors.length > 0 && (
        <div className="flex items-center gap-1 text-xs text-red-400" role="alert">
          <AlertCircle className="size-3 shrink-0" />
          <span>{state.errors[0]}</span>
        </div>
      )}
    </div>
  );
}

import { Upload, Clock, ImageIcon } from 'lucide-react';

interface ImageUploadAreaProps {
  onUpload?: (file: File) => void;
}

/**
 * Drag and drop area for uploading images for Image-to-Video generation
 */
export function ImageUploadArea({ onUpload }: ImageUploadAreaProps) {
  return (
    <div className="w-full rounded-[18px] border border-gray-200 bg-gray-50/50 p-8 transition-colors hover:bg-gray-50/80 cursor-pointer group relative overflow-hidden dark:border-[var(--color-border-container)] dark:bg-[var(--color-bg-primary)]/50 dark:hover:bg-[var(--color-bg-primary)]/80">
      <div className="flex flex-col items-center justify-center gap-4 text-center py-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-[18px] bg-gray-100 flex items-center justify-center mb-2 dark:bg-[var(--color-bg-secondary)]/50">
            <ImageIcon className="w-6 h-6 text-gray-500 dark:text-[var(--color-text-3)]" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[var(--color-theme-2)] rounded-full flex items-center justify-center border-2 border-white dark:border-[var(--color-bg-page)]">
            <span className="text-[10px] font-bold text-white">+</span>
          </div>
        </div>
        
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-900 dark:text-[var(--color-text-1)]">
            Click / Drop / Paste
          </p>
          <button className="text-xs text-gray-500 hover:text-[var(--color-theme-2)] transition-colors dark:text-[var(--color-text-3)] dark:hover:text-[var(--color-theme-2)]">
            Select from History
          </button>
        </div>

        <p className="text-[10px] text-gray-500/60 max-w-[240px] dark:text-[var(--color-text-3)]/60">
          JPG / PNG files up to 10MB with minimum dimensions of 300px
        </p>
      </div>
      
      <input 
        type="file" 
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        accept="image/png, image/jpeg, image/webp"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && onUpload) onUpload(file);
        }}
      />
    </div>
  );
}


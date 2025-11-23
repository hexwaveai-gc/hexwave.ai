import { Upload, Clock, ImageIcon } from 'lucide-react';

interface ImageUploadAreaProps {
  onUpload?: (file: File) => void;
}

/**
 * Drag and drop area for uploading images for Image-to-Video generation
 */
export function ImageUploadArea({ onUpload }: ImageUploadAreaProps) {
  return (
    <div className="w-full rounded-lg border border-border bg-card/50 p-8 transition-colors hover:bg-card/80 cursor-pointer group relative overflow-hidden">
      <div className="flex flex-col items-center justify-center gap-4 text-center py-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-lg bg-muted/50 flex items-center justify-center mb-2">
            <ImageIcon className="w-6 h-6 text-muted-foreground" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center border-2 border-background">
            <span className="text-[10px] font-bold text-primary-foreground">+</span>
          </div>
        </div>
        
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">
            Click / Drop / Paste
          </p>
          <button className="text-xs text-muted-foreground hover:text-primary transition-colors">
            Select from History
          </button>
        </div>

        <p className="text-[10px] text-muted-foreground/60 max-w-[240px]">
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


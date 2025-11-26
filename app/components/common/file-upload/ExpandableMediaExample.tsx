"use client";

/**
 * ExpandableMediaExample Component
 * 
 * This is an example/demo component showing how to use the expandable media feature.
 * You can use this as a reference or delete it if not needed.
 */

import { useState } from "react";
import { FileUploader, ExpandableMedia } from "./index";

export function ExpandableMediaExample() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-12">
      <div>
        <h1 className="text-3xl font-bold mb-2">Expandable Media Feature Demo</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Upload an image or video, then hover and click to expand to full size
        </p>
      </div>

      {/* Example 1: FileUploader with automatic expand */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">1. Image Upload (Auto-Expandable)</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            FileUploader automatically includes expand functionality. Hover over the uploaded image to see the expand icon.
          </p>
        </div>
        
        <FileUploader
          accept="image"
          value={imageUrl}
          onChange={(val) => {
            if (Array.isArray(val)) {
              // Multi-file mode - take first file or null if empty
              setImageUrl(val.length > 0 ? val[0] : null);
            } else {
              // Single file mode
              setImageUrl(val);
            }
          }}
          previewHeight="h-48"
        />
      </section>

      {/* Example 2: Video Upload with expand */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">2. Video Upload (Auto-Expandable)</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Videos are also expandable. Click to view full-size with auto-play.
          </p>
        </div>
        
        <FileUploader
          accept="video"
          value={videoUrl}
          onChange={(val) => {
            if (Array.isArray(val)) {
              // Multi-file mode - take first file or null if empty
              setVideoUrl(val.length > 0 ? val[0] : null);
            } else {
              // Single file mode
              setVideoUrl(val);
            }
          }}
          previewHeight="h-48"
          variant="dropzone"
        />
      </section>

      {/* Example 3: Standalone ExpandableMedia */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">3. Standalone ExpandableMedia Component</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            You can also use ExpandableMedia directly for any image or video.
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <ExpandableMedia
            src="https://images.unsplash.com/photo-1682687220742-aba13b6e50ba"
            mediaType="image"
            fileName="Example Photo"
            className="h-48 rounded-lg overflow-hidden"
          />
          
          <ExpandableMedia
            src="https://images.unsplash.com/photo-1682687221038-404cb8830901"
            mediaType="image"
            fileName="Another Example"
            className="h-48 rounded-lg overflow-hidden"
          />
        </div>
      </section>

      {/* Feature highlights */}
      <section className="border-t pt-8">
        <h2 className="text-xl font-semibold mb-4">Features</h2>
        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li>✅ Hover to show expand icon with smooth animation</li>
          <li>✅ Click to open full-size view in responsive dialog</li>
          <li>✅ Keyboard accessible (Tab, Enter, Space, Escape)</li>
          <li>✅ Videos auto-play when expanded</li>
          <li>✅ Dark mode support</li>
          <li>✅ Mobile responsive</li>
          <li>✅ SSR compatible</li>
        </ul>
      </section>
    </div>
  );
}


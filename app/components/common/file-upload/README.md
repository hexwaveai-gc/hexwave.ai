# File Upload Components

A unified, DRY file upload system supporting images, videos, and PDFs with single and multi-file upload capabilities.

## Components

### `FileUploader`

The main upload component that handles all file types through props.

### `FilePreview`

A preview component that renders appropriate previews based on file type.

---

## Installation

These components require [UploadThing](https://uploadthing.com/) to be configured. Ensure you have:

1. UploadThing API keys in your environment
2. Upload routes configured in `app/api/uploadthing/core.ts`

---

## Quick Start

```tsx
import { FileUploader } from "@/app/components/common/file-upload";

// Single image upload
<FileUploader
  accept="image"
  value={imageUrl}
  onChange={setImageUrl}
/>

// Multiple images (up to 4)
<FileUploader
  accept="image"
  maxFiles={4}
  value={imageUrls}
  onChange={setImageUrls}
/>

// Video upload with dropzone
<FileUploader
  accept="video"
  variant="dropzone"
  value={videoUrl}
  onChange={setVideoUrl}
/>

// PDF upload
<FileUploader
  accept="pdf"
  buttonLabel="Upload Document"
  value={pdfUrl}
  onChange={setPdfUrl}
/>

// All file types
<FileUploader
  accept="all"
  maxFiles={5}
  value={fileUrls}
  onChange={setFileUrls}
/>
```

---

## FileUploader Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `accept` | `"image" \| "video" \| "pdf" \| "all"` | `"image"` | File types to accept |
| `maxFiles` | `number` | `1` | Max files (1 = single, >1 = multi) |
| `variant` | `"button" \| "dropzone"` | `"button"` | Upload UI style |
| `value` | `string \| string[] \| null` | - | Current file URL(s) |
| `fileNames` | `string \| string[]` | - | File names for display |
| `onChange` | `(value, fileNames?) => void` | - | Change handler |
| `onUploadComplete` | `(url, response) => void` | - | Upload success callback |
| `onUploadError` | `(error) => void` | - | Upload error callback |
| `onUploadBegin` | `() => void` | - | Upload start callback |
| `buttonLabel` | `string` | Auto | Custom button text |
| `dropzoneLabel` | `string` | Auto | Custom dropzone text |
| `allowedContent` | `string` | Auto | File type description |
| `disabled` | `boolean` | `false` | Disable upload |
| `hasError` | `boolean` | `false` | Error styling state |
| `className` | `string` | - | Container classes |
| `previewHeight` | `string` | `"h-32"` | Preview height class |
| `showPreview` | `boolean` | `true` | Show preview after upload |
| `accentColor` | `string` | - | Custom button color |
| `icon` | `LucideIcon` | Auto | Custom icon |
| `readOnlyPreview` | `boolean` | `false` | Hide remove button |
| `showVideoControls` | `boolean` | `true` | Show video controls |
| `previewColumns` | `2 \| 3 \| 4` | `3` | Multi-file grid columns |

---

## FilePreview Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | **Required** | File URL |
| `fileType` | `"image" \| "video" \| "pdf" \| "unknown"` | Auto | File type (auto-detected) |
| `alt` | `string` | `"Uploaded file"` | Alt text |
| `fileName` | `string` | - | Display name |
| `onRemove` | `() => void` | - | Remove callback |
| `className` | `string` | - | Container classes |
| `previewHeight` | `string` | `"h-32"` | Height class |
| `rounded` | `"sm" \| "md" \| "lg" \| "xl" \| "2xl"` | `"lg"` | Border radius |
| `showVideoControls` | `boolean` | `true` | Video controls |
| `readOnly` | `boolean` | `false` | Hide remove button |

---

## Usage Patterns

### Single File Upload

```tsx
const [url, setUrl] = useState<string | null>(null);

<FileUploader
  accept="image"
  value={url}
  onChange={setUrl}
/>
```

### Multiple File Upload

```tsx
const [urls, setUrls] = useState<string[]>([]);

<FileUploader
  accept="image"
  maxFiles={6}
  value={urls}
  onChange={(newUrls) => setUrls(newUrls || [])}
  previewColumns={3}
/>
```

### With Form Integration

```tsx
// Using with react-hook-form
<Controller
  name="avatar"
  control={control}
  render={({ field }) => (
    <FileUploader
      accept="image"
      value={field.value}
      onChange={field.onChange}
      hasError={!!errors.avatar}
    />
  )}
/>
```

### Custom Styling

```tsx
<FileUploader
  accept="video"
  variant="dropzone"
  className="border-blue-500"
  previewHeight="h-48"
  accentColor="#3B82F6"
/>
```

### With Callbacks

```tsx
<FileUploader
  accept="image"
  value={url}
  onChange={setUrl}
  onUploadBegin={() => setLoading(true)}
  onUploadComplete={(url, response) => {
    console.log("Uploaded:", response.name, response.size);
    setLoading(false);
  }}
  onUploadError={(error) => {
    toast.error(error.message);
    setLoading(false);
  }}
/>
```

---

## Utility Functions

### `detectFileType(url: string): FileType`

Detects file type from URL extension.

```tsx
import { detectFileType } from "@/app/components/common/file-upload";

detectFileType("https://example.com/image.jpg"); // "image"
detectFileType("https://example.com/video.mp4"); // "video"
detectFileType("https://example.com/doc.pdf");   // "pdf"
```

### `FileTypeIcon`

Renders appropriate icon for file type.

```tsx
import { FileTypeIcon } from "@/app/components/common/file-upload";

<FileTypeIcon type="image" className="h-8 w-8" />
<FileTypeIcon type="video" className="h-8 w-8 text-blue-500" />
```

---

## Upload Routes

The component uses these UploadThing routes (defined in `app/api/uploadthing/core.ts`):

| Route | Type | Max Size | Max Files |
|-------|------|----------|-----------|
| `imageUploader` | Single image | 16MB | 1 |
| `multiImageUploader` | Multiple images | 16MB | 10 |
| `videoUploader` | Single video | 256MB | 1 |
| `multiVideoUploader` | Multiple videos | 256MB | 5 |
| `pdfUploader` | Single PDF | 32MB | 1 |
| `multiPdfUploader` | Multiple PDFs | 32MB | 10 |
| `fileUploader` | All types | Varies | 10 |

---

## Dark Mode

Components automatically support dark mode using CSS variables:

- `--color-bg-primary` - Background
- `--color-bg-secondary` - Secondary background
- `--color-border-container` - Border color
- `--color-text-1` - Primary text
- `--color-text-3` - Muted text
- `--color-theme-2` - Accent color

---

## Accessibility

- Keyboard navigable
- ARIA labels on buttons
- Focus states
- Screen reader friendly
- Proper alt text support



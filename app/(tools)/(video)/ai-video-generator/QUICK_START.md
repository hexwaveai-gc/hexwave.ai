# Quick Start Guide - Dynamic Video Model UI

## 🚀 Getting Started (2 minutes)

### 1. View the Application

The dynamic UI system is now fully integrated. Start the dev server:

```bash
cd /Users/satishsingh/Downloads/hexwave
npm run dev
```

Navigate to: `http://localhost:3000/ai-video-generator`

### 2. How to Use

**Step 1: Select a Tab**
- Text to Video (40 models)
- Image to Video (34 models)
- Video to Video (2 models)

**Step 2: Choose a Model**
- Click "Select Model" button
- Search by name or filter by features
- Star your favorites for quick access

**Step 3: Configure**
- Fields appear automatically based on model
- Fill required fields (marked with *)
- See real-time cost estimate at bottom

**Step 4: Generate**
- Click "Generate Video" button
- Watch progress
- View results in right panel

---

## 📝 Adding Your First Model (5 minutes)

Open `configs/models.constant.ts` and add to appropriate array:

```typescript
{
  id: "MY_NEW_MODEL",
  name: "My New Model",
  url: "fal-ai/my-model",
  provider: "Provider",
  logo: PROVIDER_LOGOS.PROVIDER,
  description: "What this model does",
  features: ["Feature 1", "Feature 2"],
  categories: ["recommended"],
  cost: {
    type: "per_second",
    value: 0.05,  // 0.05M credits per second
  },
  fields: ["prompt", "duration", "aspectRatio"],
  fieldOptions: {
    duration: {
      options: ["5", "10"],
      default: "5",
      label: "Duration",
      userSelectable: true,
    },
    aspectRatio: {
      options: [
        { value: "16:9", label: "Landscape" },
        { value: "9:16", label: "Portrait" },
      ],
      default: "16:9",
      label: "Aspect Ratio",
      userSelectable: true,
    },
  },
  capabilities: {
    supportsEndFrame: false,
    supportsTailImage: false,
    supportsAudioGeneration: false,
    promptCharacterLimit: 1500,
    negativePromptCharacterLimit: 1500,
  },
}
```

Save the file. **Done!** UI automatically updates.

---

## 🎯 Key Features

### Zero Configuration Needed
✅ No component creation  
✅ No route updates  
✅ No state management  
✅ Just edit one file

### Smart Features
✅ Real-time cost calculation  
✅ Auto-save every 2 seconds  
✅ Search & filter models  
✅ Favorites & recent models  
✅ Offline support  
✅ Form validation  

### Developer Friendly
✅ TypeScript strict mode  
✅ Zero linting errors  
✅ Self-documenting  
✅ Error boundaries  
✅ Accessible (ARIA)  

---

## 🐛 Troubleshooting

### Model not showing
**Check**: Is it in the correct array? (TEXT_MODELS, IMAGE_MODELS, or VIDEO_MODELS)

### Fields not appearing
**Check**: Does `fields` array match field names in registry?

### Cost shows "Unknown"
**Check**: Is `cost` object correctly configured?

### Type errors
**Check**: Run `npm run type-check` to see TypeScript errors

---

## 📚 Next Steps

1. **Read**: Full architecture in `README.md`
2. **Understand**: Implementation details in `IMPLEMENTATION_SUMMARY.md`
3. **Customize**: Add your own models
4. **Extend**: Add new field types if needed

---

## 💡 Architecture at a Glance

```
models.constant.ts (76 models)
        ↓
  Zustand Store (state management)
        ↓
  DynamicFieldRenderer (reads model.fields)
        ↓
  Field Components (render UI)
        ↓
  User sees perfect form ✨
```

**That's it!** One file to rule them all.

---

## 🎉 What You Get

- 76 models working out of the box
- Add models in 5 minutes
- No code duplication
- Production-ready
- Fully typed
- Accessible
- Fast performance

Enjoy building! 🚀


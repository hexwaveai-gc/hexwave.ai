// Logo image paths (strings) instead of importing binary files so that this file can be executed in plain Node environments as well as within Next.js.
const stableDiffusionLogo = "/image-logos/stable-diffusion.webp";
const fluxLogo = "/image-logos/flux.png";
const dalleLogo = "/image-logos/dalle.webp";
const gptImage1Logo = "/image-logos/gpt-image-1.webp";
const ideogramLogo = "/image-logos/ideogram.webp";
const recraftLogo = "/image-logos/recraft.webp";
const midjourneyLogo = "/image-logos/midjourney.webp";
const lumaLogo = "/image-logos/luma.webp";
const googleLogo = "/image-logos/google.png";
const leonardoLogo = "/image-logos/leonardo.webp";
const grokLogo = "/image-logos/grok.webp";
const seedreamLogo = "/bytedance.webp";
const runwayLogo = "/runway.webp";
const qwenLogo = "https://blog.galaxy.ai/logos/qwen.webp";
const wanLogo = qwenLogo;
const tencentLogo = "/image-logos/tencent.webp";
const reveLogo = "/image-logos/reve.webp";

export const MODEL_CATEGORIES = [
  { id: "all", label: "All Models", icon: "Grid3x3" },
  { id: "popular", label: "Popular", icon: "TrendingUp" },
  { id: "recommended", label: "Recommended", icon: "Star" },
  { id: "img2img", label: "Supports Image to Image", icon: "Layers" },
];

// Provider mapping based on logo paths
export const MODEL_PROVIDERS = [
  { id: "all", label: "All Providers" },
  { id: dalleLogo, label: "OpenAI" },

  { id: googleLogo, label: "Google" },
  { id: midjourneyLogo, label: "Midjourney" },
  { id: fluxLogo, label: "FLUX" },
  { id: runwayLogo, label: "Runway" },

  { id: ideogramLogo, label: "Ideogram" },

  { id: stableDiffusionLogo, label: "Stable Diffusion" },
  { id: recraftLogo, label: "Recraft" },
  { id: lumaLogo, label: "Luma" },
  { id: leonardoLogo, label: "Leonardo" },
  { id: grokLogo, label: "Grok" },
  { id: seedreamLogo, label: "ByteDance" },
  { id: qwenLogo, label: "Alibaba" },
  { id: tencentLogo, label: "Tencent" },
  { id: reveLogo, label: "Reve" },
];

export const sampleImages = [
  "https://res.cloudinary.com/duhygs5ck/image/upload/v1752490575/InAppImages/photo_generator/image_sqcrva.jpg",
  "https://res.cloudinary.com/duhygs5ck/image/upload/v1752490585/InAppImages/photo_generator/image_kqq4hv.jpg",
  "https://res.cloudinary.com/duhygs5ck/image/upload/v1752490592/InAppImages/photo_generator/image_ywn4vu.webp",
  "https://res.cloudinary.com/duhygs5ck/image/upload/v1752490596/InAppImages/photo_generator/image_fs5xaj.jpg",
];

export const modelOptions = [
  {
    value: "nano-banana-pro",
    label: "Nano-Banana Pro",
    logo: googleLogo,
    description:
      "Google's state-of-the-art model with thinking mode & Google Search grounding 🍌",
    previewImage:
      "https://res.cloudinary.com/duhygs5ck/image/upload/v1756378298/gemini_2.5_flash_nano_banana_xoxnjn.webp",
    categories: ["popular", "recommended"],
    img2img: true,
  },
  {
    value: "gemini-25-flash-image",
    label: "Nano-Banana",
    logo: googleLogo,
    description: "Google's state-of-the-art image model 🍌 (Gemini 2.5 Flash)",
    previewImage:
      "https://res.cloudinary.com/duhygs5ck/image/upload/v1756378298/gemini_2.5_flash_nano_banana_xoxnjn.webp",
    categories: ["popular", "recommended"],
    img2img: true,
  },
  {
    value: "wan-v2-2-a14b",
    label: "Wan v2.2",
    logo: wanLogo,
    description:
      "High-fidelity images with enhanced prompt alignment and style adaptability",
    previewImage:
      "https://res.cloudinary.com/duhygs5ck/image/upload/v1757438128/wan_images_qirazj.webp",
    categories: [,],
  },
  {
    value: "wan-25",
    label: "Wan 2.5",
    logo: wanLogo,
    description:
      "Enhanced aesthetics, smart charts, precise text, and complex prompt understanding",
    previewImage:
      "https://res.cloudinary.com/duhygs5ck/image/upload/v1758882696/Wan_2.5_wkfdnl.webp",
    categories: ["popular", "recommended", "img2img"],
    img2img: true,
  },
  {
    value: "hunyuan-v3",
    label: "Hunyuan 3.0",
    logo: tencentLogo,
    description: "Tencent's state-of-the-art model for image generation",
    previewImage:
      "https://res.cloudinary.com/duhygs5ck/image/upload/v1759217661/Hunyuan_Image_3_osyhvc.webp",
    categories: [,],
  },
  {
    value: "midjourney",
    label: "Midjourney",
    logo: midjourneyLogo,
    description:
      "Renowned for creating stunning artistic and imaginative imagery",
    previewImage:
      "https://res.cloudinary.com/duhygs5ck/image/upload/f_auto,q_auto/f_auto,q_auto/v1745314139/midjourney_j3cv7k.webp",
    categories: ["popular", "recommended"],
    img2img: true,
  },
  {
    value: "ideogram-v3",
    label: "Ideogram [v3]",
    logo: ideogramLogo,
    description: "Stunning realism, text rendering, and consistent styles",
    previewImage:
      "https://res.cloudinary.com/duhygs5ck/image/upload/f_auto,q_auto/f_auto,q_auto/v1746427903/ideogram-v3_jtj9y0.webp",
    categories: ["popular", "recommended"],
    img2img: true,
  },
  {
    value: "ideogram-v2",
    label: "Ideogram [v2]",
    logo: ideogramLogo,
    description:
      "High-quality image generation with advanced style control and inpainting capabilities",
    previewImage:
      "https://framerusercontent.com/images/QlUWJlYBvikprARDc1LHgfKZyAY.png?scale-down-to=1024",
    categories: [,],
  },
  {
    value: "ideogram-v2a",
    label: "Ideogram [v2a]",
    logo: ideogramLogo,
    description: "Like Ideogram v2, but faster and cheaper",
    previewImage:
      "https://tjzk.replicate.delivery/models_models_featured_image/6e45e974-f381-435a-b9dd-23f3e6801c19/replicate-prediction-1yv65m0q.webp",
    categories: [,],
  },

  {
    value: "imagen-4",
    label: "Imagen 4",
    logo: googleLogo,
    description: "Google’s highest quality image generation model",
    previewImage:
      "https://res.cloudinary.com/duhygs5ck/image/upload/f_auto,q_auto/f_auto,q_auto/v1750502897/imagen4_m7rjmg.webp",
    categories: ["popular", "recommended"],
  },
  {
    value: "gpt-image-1",
    label: "GPT Image 1",
    logo: gptImage1Logo,
    description: "OpenAI's state-of-the-art image generation model",
    previewImage:
      "https://res.cloudinary.com/duhygs5ck/image/upload/f_auto,q_auto/f_auto,q_auto/v1745657529/gpt-image-1_nk7yho.webp",
    categories: ["popular", "recommended"],
    img2img: true,
  },
  {
    value: "gpt-image-1-mini",
    label: "GPT Image 1 Mini",
    logo: gptImage1Logo,
    description: "Faster, 80% less expensive version of GPT Image 1",
    previewImage:
      "https://res.cloudinary.com/duhygs5ck/image/upload/f_auto,q_auto/f_auto,q_auto/v1745657529/gpt-image-1_nk7yho.webp",
    categories: ["popular", "recommended"],
    img2img: true,
  },
  {
    value: "leonardo-phoenix",
    label: "Leonardo Phoenix",
    logo: leonardoLogo,
    description: "High-quality images with precise style control",
    previewImage:
      "https://leonardo.ai/wp-content/uploads/2024/06/phoenix-hero-img-o.jpg",
    categories: ["popular"],
  },
  {
    value: "runwaygen4",
    label: "Runway Gen-4",
    logo: runwayLogo,
    description:
      "Generate consistent characters and scenes with coherent style",
    previewImage:
      "https://res.cloudinary.com/duhygs5ck/image/upload/v1753258378/runway_gen4_xfz1ap.webp",
    categories: ["popular", "recommended"],
    img2img: true,
  },
  {
    value: "seedream-v4",
    label: "Seedream V4",
    logo: seedreamLogo,
    description:
      "Record-breaking 4K resolution image generation model by ByteDance",
    previewImage:
      "https://res.cloudinary.com/duhygs5ck/image/upload/v1757593046/seedream4_0_j7lc3a.webp",
    categories: ["popular", "recommended"],
    img2img: true,
  },
  {
    value: "reve",
    label: "Reve",
    logo: reveLogo,
    description:
      "Detailed visual output with strong aesthetic quality and accurate text rendering",
    previewImage:
      "https://res.cloudinary.com/duhygs5ck/image/upload/v1760786731/reve_vu5bew.webp",
    categories: ["popular", "recommended"],
    img2img: true,
  },
  {
    value: "seedream-v3",
    label: "Seedream V3",
    logo: seedreamLogo,
    description: "ByteDance's advanced model with high-resolution (2K) support",
    previewImage:
      "https://res.cloudinary.com/duhygs5ck/image/upload/f_auto,q_auto/f_auto,q_auto/v1751877912/seed.bytedance.com_en_tech_seedream3_0_weezyc.webp",
    categories: [,],
  },
  {
    value: "dreamina-v31",
    label: "Dreamina V3.1",
    logo: seedreamLogo,
    description:
      "ByteDance's model with superior picture effects, precise styles, and rich details",
    previewImage:
      "https://res.cloudinary.com/duhygs5ck/image/upload/v1756465464/Dreamina_3.1_buo7kt.webp",
    categories: [,],
  },
  {
    value: "qwen-image",
    label: "Qwen Image",
    logo: qwenLogo,
    description:
      "Advanced image generation with great text generation and prompt adherence",
    previewImage:
      "https://res.cloudinary.com/duhygs5ck/image/upload/v1755763013/qwen_image_vfwbbx.webp",
    categories: ["popular", "recommended"],
    img2img: true,
  },
  {
    value: "leonardo-photoreal-v2",
    label: "Leonardo Photoreal v2",
    logo: leonardoLogo,
    description:
      "Photorealistic image generation with advanced lighting and composition control",
    previewImage:
      "https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/778d49fb-926b-4629-b49e-c943c96968a2/anim=false,width=450/64334842.jpeg",
    categories: ["popular"],
  },
  {
    value: "leonardo-transparency",
    label: "Leonardo Transparency",
    logo: leonardoLogo,
    description:
      "Generate transparency style images using the Leonardo Transparency model",
    previewImage: "https://files.readme.io/7c410f3-Default_an_orange_cat_1.png",
    categories: [],
  },
  {
    value: "ideogram-v2-turbo",
    label: "Ideogram [v2 Turbo]",
    logo: ideogramLogo,
    description: "Fast version of Ideogram optimized for rapid generation",
    previewImage:
      "https://framerusercontent.com/images/DhI90wXFhTetfHA3xr95nFfjVe0.webp?scale-down-to=1024",
    categories: [,],
  },
  {
    value: "ideogram-v2a-turbo",
    label: "Ideogram [v2a turbo]",
    logo: ideogramLogo,
    description: "Like Ideogram v2 turbo, but now faster and cheaper",
    previewImage:
      "https://replicate.delivery/xezq/0MOOj7UCadZdCJ5UrIcqZT6Kieg4e2D4Pt9HvDfXtLetWAORB/tmpdiuv41kb.png",
    categories: [,],
  },
  {
    value: "grok-2-image",
    label: "Grok 2 Image",
    logo: grokLogo,
    description: "Generate high-quality images using Grok-2-image model by xAI",
    previewImage:
      "https://x.ai/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FSR17Abstract.366f3d38.webp&w=2048&q=75",
    categories: [],
  },
  {
    value: "flux-1.1-pro-ultra",
    label: "FLUX [1.1 pro ultra]",
    logo: fluxLogo,
    description:
      "Ultimate FLUX model with maximum quality and advanced features",
    previewImage:
      "https://replicate.delivery/czjl/jqtNvxYHcnLELpszvkVf0APhMkBnwzrdo205RaVB7MttqU6JA/tmppokfymld.jpg",
    categories: ["popular", "recommended"],
  },
  {
    value: "flux-1.1-pro",
    label: "FLUX [1.1 pro]",
    logo: fluxLogo,
    description: "Updated pro version with improved detail and consistency",
    previewImage:
      "https://tjzk.replicate.delivery/models_models_featured_image/bd872eff-363a-4e10-8cc1-84057afa9f57/flux-1.1-cover.webp",
    categories: ["popular"],
  },
  {
    value: "flux-pro",
    label: "FLUX [pro]",
    logo: fluxLogo,
    description:
      "Professional model specializing in realistic and artistic compositions",
    previewImage:
      "https://tjzk.replicate.delivery/models_models_cover_image/a36275e2-34d4-4b3d-83cd-f9aaf73c9386/https___replicate.delive_o40qpZl.webp",
    categories: [,],
  },
  {
    value: "flux-pro-kontext",
    label: "FLUX Kontext",
    logo: fluxLogo,
    description:
      "Advanced image generation with character consistency and photorealistic rendering",
    previewImage:
      "https://res.cloudinary.com/duhygs5ck/image/upload/f_auto,q_auto/f_auto,q_auto/v1748617363/flux_kontext_mvmhmn.webp",
    categories: [,],
  },
  {
    value: "flux-pro-kontext-max",
    label: "FLUX Kontext Max",
    logo: fluxLogo,
    description:
      "High-performance model with enhanced prompt adherence and typography generation",
    previewImage:
      "https://res.cloudinary.com/duhygs5ck/image/upload/f_auto,q_auto/f_auto,q_auto/v1748617363/flux_kontext_mvmhmn.webp",
    categories: ["popular"],
  },
  {
    value: "dall-e-3",
    label: "DALL-E 3",
    logo: dalleLogo,
    description: "Latest version of DALL-E with enhanced capabilities",
    previewImage:
      "https://images.ctfassets.net/kftzwdyauwt9/4xRSuCnoKAT9ZGfMYFcRZ1/de6f1364124ed36428ab136266e33795/plategirl.png?w=3840&q=80&fm=webp",
    categories: [],
  },

  {
    value: "imagen-3",
    label: "Imagen 3",
    description:
      "Google's text-to-image model with high quality and photorealistic outputs",
    logo: googleLogo,
    previewImage:
      "https://res.cloudinary.com/duhygs5ck/image/upload/f_auto,q_auto/f_auto,q_auto/v1750502939/imagen3_trtw2i.webp",
    categories: [],
  },
  {
    value: "recraft-v3",
    label: "Recraft V3",
    logo: recraftLogo,
    description:
      "Specialized in creating consistent, high-quality artistic illustrations",
    previewImage:
      "https://res.cloudinary.com/duhygs5ck/image/upload/f_auto,q_auto/f_auto,q_auto/v1750502985/recraft_v3_vsipp9.webp",
    categories: ["popular"],
  },
  {
    value: "luma-photon",
    label: "Luma Photon",
    logo: lumaLogo,
    description:
      "High-quality creative, intelligent and personalizable image generation",
    previewImage:
      "https://replicate.delivery/czjl/ZtBmm4Yw98KoJBz3Z7PnpFmgga42Skq8pL3ILGjnmDfAl87JA/tmpjbj2iy5z.jpg",
    categories: ["popular"],
  },
  {
    value: "luma-photon-flash",
    label: "Luma Photon Flash",
    logo: lumaLogo,
    description: "Faster, cost-effective version of Luma Photon",
    previewImage:
      "https://replicate.delivery/czjl/6iZ89qakg74mCVjFYeDk0GljoYQReoV0k7WwSjxXmCLcV53TA/tmpyf9dx02r.jpg",
    categories: [],
  },
  {
    value: "stable-diffusion-3.5-large",
    label: "Stable Diffusion 3.5 Large",
    logo: stableDiffusionLogo,
    description:
      "Enhanced version with superior detail and artistic capabilities",
    previewImage:
      "https://tjzk.replicate.delivery/models_models_featured_image/4b03d178-eaf3-4458-a752-dbc76098396b/replicate-prediction-_ycGb1jN.webp",
    categories: [],
    img2img: true,
  },
  {
    value: "stable-diffusion-3.5-large-turbo",
    label: "Stable Diffusion 3.5 Large Turbo",
    logo: stableDiffusionLogo,
    description:
      "Fast, high-performance version optimized for quick generation",
    previewImage:
      "https://tjzk.replicate.delivery/models_models_featured_image/9e1b4258-22bd-4a59-ba4a-ecac220a8a9b/replicate-prediction-_WU4XtaV.webp",
    categories: [],
    img2img: true,
  },
  {
    value: "stable-diffusion-3",
    label: "Stable Diffusion 3",
    logo: stableDiffusionLogo,
    description: "Advanced model with improved composition and visual quality",
    previewImage:
      "https://images.squarespace-cdn.com/content/v1/6213c340453c3f502425776e/1708563364236-12JCC98CUARGPPDOGMKB/image-90.png?format=2500w",
    categories: [],
  },
  {
    value: "sdxl",
    label: "Stable Diffusion XL",
    logo: stableDiffusionLogo,
    description: "Legacy base model for straightforward image generation",
    previewImage:
      "https://images.squarespace-cdn.com/content/v1/6213c340453c3f502425776e/eba39670-66c6-4921-bdb9-19dce66f0a46/sdxl+coverimage+milkyweights.png?format=2500w",
    categories: [],
  },
];

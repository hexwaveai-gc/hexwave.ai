import { ModelsType } from "../types/index.types";
import { PROVIDER_LOGOS } from "./provider-logos.constants";

export const MODELS: ModelsType = {
  VIDEO_MODELS: [
    {
      id: "WAN_ANIMATE_REPLACE",
      name: "Wan-2.2 Replace",
      url: "fal-ai/wan/v2.2-14b/animate/replace",
      provider: "Wan",
      logo: PROVIDER_LOGOS.WAN,
      description: "Character swap in video",
      features: ["Character Replace", "Scene Preservation"],
      categories: ["recommended", "wan"],
      cost: {
        type: "per_second",
        value: 0.08, // 0.08M credits per second
      },
      fields: ["videoBase64", "imageBase64", "resolution", "shift"],
      // Note: Duration is not accepted by this model - output duration matches input video
      fieldOptions: {
        resolution: {
          options: [
            { value: "720p", label: "720p (HD)" },
            { value: "1080p", label: "1080p (Full HD)" },
          ],
          default: "720p",
          label: "Resolution",
          userSelectable: true,
        },
        shift: {
          default: "5",
          label: "Shift",
          userSelectable: true,
          min: 0,
          max: 10,
          step: 1,
          helpText: "Control the transformation intensity",
        },
      },
      capabilities: {
        supportsEndFrame: false,
        supportsTailImage: false,
        supportsAudioGeneration: false,
        promptCharacterLimit: 1500,
        negativePromptCharacterLimit: 1500,
      },
    },
    {
      id: "WAN_ANIMATE_MOVE",
      name: "Wan-2.2 Animate",
      url: "fal-ai/wan/v2.2-14b/animate/move",
      provider: "Wan",
      logo: PROVIDER_LOGOS.WAN,
      description: "Motion replication in video",
      features: ["Motion Transfer", "Expression Replication"],
      categories: ["wan"],
      cost: {
        type: "per_second",
        value: 0.08, // 0.08M credits per second
      },
      fields: ["videoBase64", "imageBase64", "resolution", "shift"],
      // Note: Duration is not accepted by this model - output duration matches input video
      fieldOptions: {
        resolution: {
          options: [
            { value: "720p", label: "720p (HD)" },
            { value: "1080p", label: "1080p (Full HD)" },
          ],
          default: "720p",
          label: "Resolution",
          userSelectable: true,
        },
        shift: {
          default: "5",
          label: "Shift",
          userSelectable: true,
          min: 0,
          max: 10,
          step: 1,
          helpText: "Control the transformation intensity",
        },
      },
      capabilities: {
        supportsEndFrame: false,
        supportsTailImage: false,
        supportsAudioGeneration: false,
        promptCharacterLimit: 1500,
        negativePromptCharacterLimit: 1500,
      },
    },
  ],
  TEXT_MODELS: [
    {
      id: "VEO3_1",
      name: "Veo 3.1",
      url: "fal-ai/veo3.1",
      provider: "Veo",
      logo: PROVIDER_LOGOS.VEO,
      description:
        "The most advanced AI video generation model by Google. With sound on!",

      features: ["Audio Generation", "1080p"],
      categories: ["recommended", "veo"],
      cost: {
        type: "per_second",
        value: 0.4,
      },
      fields: [
        "prompt",
        "aspectRatio",
        "duration",
        "negativePrompt",
        "enhancePrompt",
        "seed",
        "resolution",
      ],
      // ✨ ENHANCED: Complete field metadata (generated from utils)
      fieldOptions: {
        duration: {
          options: ["4", "6", "8"],
          default: "8",
          label: "Duration",
          userSelectable: true,
        },
        aspectRatio: {
          options: [
            { value: "16:9", label: "Landscape (16:9)" },
            { value: "9:16", label: "Portrait (9:16)" },
            { value: "1:1", label: "Square (1:1)" },
          ],
          default: "16:9",
          label: "Aspect Ratio",
          userSelectable: true,
        },
        resolution: {
          options: [
            { value: "720p", label: "720p (HD)" },
            { value: "1080p", label: "1080p (Full HD)" },
          ],
          default: "720p",
          label: "Resolution",
          userSelectable: true,
        },
        negativePrompt: {
          default: "",
          label: "Negative Prompt",
          userSelectable: true,
          placeholder: "Describe what you don't want in the video...",
          helpText:
            "Optional: Specify elements to avoid in the generated video",
        },
        enhancePrompt: {
          default: true,
          label: "Enhance prompt automatically",
          userSelectable: true,
        },
        seed: {
          default: null,
          label: "Seed",
          userSelectable: false,
          helpText: "Random seed for reproducible results",
        },
      },
      capabilities: {
        supportsEndFrame: false,
        supportsTailImage: false,
        supportsAudioGeneration: true,
        promptCharacterLimit: 10000,
        negativePromptCharacterLimit: 10000,
      },
    },
    {
      id: "VEO3_1_FAST",
      name: "Veo 3.1 Fast",
      url: "fal-ai/veo3.1/fast",
      provider: "Veo",
      logo: PROVIDER_LOGOS.VEO,
      description:
        "Faster and more cost effective version of Google's Veo 3.1!",

      features: ["Fast", "Audio Generation", "1080p"],
      categories: ["veo", "recommended"],
      cost: {
        type: "per_second",
        value: 0.15,
      },
      fields: [
        "prompt",
        "aspectRatio",
        "duration",
        "negativePrompt",
        "enhancePrompt",
        "seed",
        "resolution",
      ],
      // ✨ ENHANCED: Complete field metadata
      fieldOptions: {
        duration: {
          options: ["4", "6", "8"],
          default: "8",
          label: "Duration",
          userSelectable: true,
        },
        aspectRatio: {
          options: [
            { value: "16:9", label: "Landscape (16:9)" },
            { value: "9:16", label: "Portrait (9:16)" },
            { value: "1:1", label: "Square (1:1)" },
          ],
          default: "16:9",
          label: "Aspect Ratio",
          userSelectable: true,
        },
        resolution: {
          options: [
            { value: "720p", label: "720p (HD)" },
            { value: "1080p", label: "1080p (Full HD)" },
          ],
          default: "720p",
          label: "Resolution",
          userSelectable: true,
        },
        negativePrompt: {
          default: "",
          label: "Negative Prompt",
          userSelectable: true,
          placeholder: "Describe what you don't want in the video...",
          helpText:
            "Optional: Specify elements to avoid in the generated video",
        },
        enhancePrompt: {
          default: true,
          label: "Enhance prompt automatically",
          userSelectable: true,
        },
        seed: {
          default: null,
          label: "Seed",
          userSelectable: false,
          helpText: "Random seed for reproducible results",
        },
      },
      capabilities: {
        supportsEndFrame: false,
        supportsTailImage: false,
        supportsAudioGeneration: true,
        promptCharacterLimit: 10000,
        negativePromptCharacterLimit: 10000,
      },
    },
    {
      id: "SORA_2_TEXT",
      name: "Sora 2",
      url: "fal-ai/sora-2/text-to-video",
      provider: "OpenAI",
      logo: PROVIDER_LOGOS.OPENAI,
      description:
        "OpenAI's SOTA video model capable of creating richly detailed, dynamic clips with audio from natural language. Tuned for speed and everyday creation.",
      features: ["Audio Generation", "720p"],
      categories: ["recommended", "sora", "openai"],
      cost: {
        type: "per_second",
        value: 0.1, // 0.1M credits per second (720p only)
      },
      fields: ["prompt", "duration", "aspectRatio", "resolution"],
      // ✨ ENHANCED: Complete field metadata
      fieldOptions: {
        duration: {
          options: ["4", "8", "12"],
          default: "8",
          label: "Duration",
          userSelectable: true,
        },
        aspectRatio: {
          options: [
            { value: "16:9", label: "Landscape (16:9)" },
            { value: "9:16", label: "Portrait (9:16)" },
          ],
          default: "16:9",
          label: "Aspect Ratio",
          userSelectable: true,
        },
        resolution: {
          options: [{ value: "720p", label: "720p (HD)" }],
          default: "720p",
          label: "Resolution",
          userSelectable: false,
        },
      },
      capabilities: {
        supportsEndFrame: false,
        supportsTailImage: false,
        supportsAudioGeneration: true,
        promptCharacterLimit: 1500,
        negativePromptCharacterLimit: 1500,
      },
    },
    {
      id: "SORA_2_PRO_TEXT",
      name: "Sora 2 Pro",
      url: "fal-ai/sora-2/text-to-video/pro",
      provider: "OpenAI",
      logo: PROVIDER_LOGOS.OPENAI,
      description:
        "Higher fidelity version of Sora 2 for complex scenes and tougher shots. Takes longer to generate but delivers enhanced detail and quality. ",
      features: ["Audio Generation", "1080p"],
      categories: ["recommended", "sora", "openai"],
      cost: {
        type: "tiered",
        base_value: 0.3, // 0.3M credits per second default (720p)
        tiers: [
          { resolution: "720p", value: 0.3 },
          { resolution: "1080p", value: 0.5 },
        ],
      },
      fields: ["prompt", "duration", "aspectRatio", "resolution"],
      // ✨ ENHANCED: Complete field metadata
      fieldOptions: {
        duration: {
          options: ["4", "8", "12"],
          default: "8",
          label: "Duration",
          userSelectable: true,
        },
        aspectRatio: {
          options: [
            { value: "16:9", label: "Landscape (16:9)" },
            { value: "9:16", label: "Portrait (9:16)" },
          ],
          default: "16:9",
          label: "Aspect Ratio",
          userSelectable: true,
        },
        resolution: {
          options: [
            { value: "720p", label: "720p (HD)" },
            { value: "1080p", label: "1080p (Full HD)" },
          ],
          default: "720p",
          label: "Resolution",
          userSelectable: true,
        },
      },
      capabilities: {
        supportsEndFrame: false,
        supportsTailImage: false,
        supportsAudioGeneration: true,
        promptCharacterLimit: 1500,
        negativePromptCharacterLimit: 1500,
      },
    },
    {
      id: "KLING_V2_5_TURBO_PRO",
      name: "Kling 2.5 Turbo",
      url: "fal-ai/kling-video/v2.5-turbo/pro/text-to-video",
      provider: "Kling",
      logo: PROVIDER_LOGOS.KLING,
      description:
        "Top-tier video generation with motion fluidity, cinematic visuals, and exceptional prompt precision.",
      features: ["1080p"],
      categories: ["recommended", "kling"],
      cost: {
        type: "per_second",
        value: 0.07, // 0.07M credits per second
      },
      fields: ["prompt", "duration", "aspectRatio", "negativePrompt"],
      // ✨ ENHANCED: Complete field metadata
      fieldOptions: {
        duration: {
          options: ["5", "10"],
          default: "5",
          label: "Duration",
          userSelectable: true,
        },
        aspectRatio: {
          options: [
            { value: "16:9", label: "Landscape (16:9)" },
            { value: "9:16", label: "Portrait (9:16)" },
            { value: "1:1", label: "Square (1:1)" },
          ],
          default: "16:9",
          label: "Aspect Ratio",
          userSelectable: true,
        },
        negativePrompt: {
          default: "",
          label: "Negative Prompt",
          userSelectable: true,
          placeholder: "Describe what you don't want in the video...",
          helpText:
            "Optional: Specify elements to avoid in the generated video",
        },
      },
      capabilities: {
        supportsEndFrame: false,
        supportsTailImage: false,
        supportsAudioGeneration: false,
        promptCharacterLimit: 1500,
        negativePromptCharacterLimit: 1500,
      },
    },
    {
      id: "KLING_V2.1_MASTER",
      name: "Kling v2.1 Master",
      url: "fal-ai/kling-video/v2.1/master/text-to-video",
      provider: "Kling",
      logo: PROVIDER_LOGOS.KLING,
      description: "Advanced Kling 2.1 model for text-to-video generation.",

      features: [],
      categories: ["recommended", "kling"],
      cost: {
        type: "per_second",
        value: 0.28,
      },
      fields: ["prompt", "duration", "aspectRatio", "negativePrompt"],
      fieldOptions: {
        duration: {
          options: ["5", "10"],
          default: "5",
          label: "Duration",
          userSelectable: true,
        },
        aspectRatio: {
          options: [
            { value: "16:9", label: "Landscape (16:9)" },
            { value: "9:16", label: "Portrait (9:16)" },
            { value: "1:1", label: "Square (1:1)" },
          ],
          default: "16:9",
          label: "Aspect Ratio",
          userSelectable: true,
        },
        negativePrompt: {
          default: "",
          label: "Negative Prompt",
          userSelectable: true,
          placeholder: "Describe what you don't want in the video...",
          helpText:
            "Optional: Specify elements to avoid in the generated video",
        },
      },
      capabilities: {
        supportsEndFrame: false,
        supportsTailImage: false,
        supportsAudioGeneration: false,
        promptCharacterLimit: 1500,
        negativePromptCharacterLimit: 1500,
      },
    },
    {
      id: "LUMA",
      name: "Luma Dream Machine",
      url: "fal-ai/luma-dream-machine",
      provider: "Luma",
      logo: PROVIDER_LOGOS.LUMA,
      description: "High-quality text-to-video generation by Luma Labs.",

      features: ["Loop"],
      categories: ["luma"],
      cost: {
        type: "fixed",
        value: 0.5, // $0.5 per video (in credits)
      },
      fields: ["prompt", "aspectRatio", "loop", "addAudioToVideo"],
      fieldOptions: {
        aspectRatio: {
          options: [
            { value: "16:9", label: "Landscape (16:9)" },
            { value: "9:16", label: "Portrait (9:16)" },
            { value: "4:3", label: "Standard (4:3)" },
            { value: "3:4", label: "Portrait (3:4)" },
            { value: "21:9", label: "Ultrawide (21:9)" },
            { value: "9:21", label: "Vertical (9:21)" },
          ],
          default: "16:9",
          label: "Aspect Ratio",
          userSelectable: true,
        },
        loop: {
          default: false,
          label: "Loop video (blend end with beginning)",
          userSelectable: true,
        },
        addAudioToVideo: {
          default: false,
          label: "Add audio to video",
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
    },

    {
      id: "MINIMAX",
      name: "Minimax",
      url: "fal-ai/minimax/video-01-live",
      provider: "Minimax",
      logo: PROVIDER_LOGOS.MINIMAX,
      description:
        "Live2D‑ready clips with built‑in prompt optimizer, facial control and smooth animation flow.",

      features: ["Prompt Optimizer"],
      categories: ["minimax"],
      cost: {
        type: "fixed",
        value: 0.5, // $0.5 per video (in credits)
      },
      fields: ["prompt", "promptOptimizer"],
      fieldOptions: {
        promptOptimizer: {
          default: true,
          label: "Use prompt optimizer",
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
    },
    {
      id: "MINIMAX_DIRECTOR",
      name: "Minimax Director",
      url: "fal-ai/minimax/video-01-director",
      provider: "Minimax",
      logo: PROVIDER_LOGOS.MINIMAX,
      description:
        "Director mode for enhanced shot control using camera movement instructions.",

      features: ["Advanced"],
      categories: ["minimax"],
      cost: {
        type: "fixed",
        value: 0.5, // $0.5 per video (in credits)
      },
      fields: ["prompt"],
      capabilities: {
        supportsEndFrame: false,
        supportsTailImage: false,
        supportsAudioGeneration: false,
        promptCharacterLimit: 1500,
        negativePromptCharacterLimit: 1500,
      },
    },
    {
      id: "KLING_V1_6",
      name: "Kling v1.6 Pro",
      url: "fal-ai/kling-video/v1.6/pro/text-to-video",
      provider: "Kling",
      logo: PROVIDER_LOGOS.KLING,
      description:
        "Prompt‑faithful videos in sharp 1080p, capturing complex camera moves with convincing realism.",

      features: ["1080p"],
      categories: ["recommended", "kling"],
      cost: {
        type: "per_second",
        value: 0.095,
      },
      fields: ["prompt", "duration", "aspectRatio", "negativePrompt"],
      fieldOptions: {
        duration: {
          options: ["5", "10"],
          default: "5",
          label: "Duration",
          userSelectable: true,
        },
        aspectRatio: {
          options: [
            { value: "16:9", label: "Landscape (16:9)" },
            { value: "9:16", label: "Portrait (9:16)" },
            { value: "1:1", label: "Square (1:1)" },
          ],
          default: "16:9",
          label: "Aspect Ratio",
          userSelectable: true,
        },
        negativePrompt: {
          default: "",
          label: "Negative Prompt",
          userSelectable: true,
          placeholder: "Describe what you don't want in the video...",
          helpText:
            "Optional: Specify elements to avoid in the generated video",
        },
      },
      capabilities: {
        supportsEndFrame: false,
        supportsTailImage: false,
        supportsAudioGeneration: false,
        promptCharacterLimit: 1500,
        negativePromptCharacterLimit: 1500,
      },
    },
    {
      id: "KLING_MASTER",
      name: "Kling 2.0 Master",
      url: "fal-ai/kling-video/v2/master/text-to-video",
      provider: "Kling",
      logo: PROVIDER_LOGOS.KLING,
      description: "Advanced Kling 2.0 model for text-to-video generation.",

      features: [],
      categories: ["recommended", "kling"],
      cost: {
        type: "per_second",
        value: 0.3,
      },
      fields: ["prompt", "duration", "aspectRatio", "negativePrompt"],
      fieldOptions: {
        duration: {
          options: ["5", "10"],
          default: "5",
          label: "Duration",
          userSelectable: true,
        },
        aspectRatio: {
          options: [
            { value: "16:9", label: "Landscape (16:9)" },
            { value: "9:16", label: "Portrait (9:16)" },
            { value: "1:1", label: "Square (1:1)" },
          ],
          default: "16:9",
          label: "Aspect Ratio",
          userSelectable: true,
        },
        negativePrompt: {
          default: "",
          label: "Negative Prompt",
          userSelectable: true,
          placeholder: "Describe what you don't want in the video...",
          helpText:
            "Optional: Specify elements to avoid in the generated video",
        },
      },
      capabilities: {
        supportsEndFrame: false,
        supportsTailImage: false,
        supportsAudioGeneration: false,
        promptCharacterLimit: 1500,
        negativePromptCharacterLimit: 1500,
      },
    },

    {
      id: "VEO2",
      name: "Veo 2",
      url: "fal-ai/veo2",
      provider: "Veo",
      logo: PROVIDER_LOGOS.VEO,
      description:
        "High-resolution (up to 4K), detailed videos with cinematic realism",

      features: [],
      categories: ["veo"],
      cost: {
        type: "tiered",
        base_value: 2.5, // $2.50 for 5s video
        additional_value: 0.5, // $0.50 per additional second
      },
      fields: ["prompt", "duration", "aspectRatio"],
      fieldOptions: {
        duration: {
          options: ["5", "6", "7", "8"],
          default: "5",
          label: "Duration",
          userSelectable: true,
        },
        aspectRatio: {
          options: [
            { value: "16:9", label: "Landscape (16:9)" },
            { value: "9:16", label: "Portrait (9:16)" },
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
    },
    {
      id: "PIXVERSE",
      name: "Pixverse",
      url: "fal-ai/pixverse/v5/text-to-video",
      provider: "Pixverse",
      logo: PROVIDER_LOGOS.PIXVERSE,
      description: "Pixverse v5 text-to-video model.",

      features: ["Styles"],
      categories: ["pixverse"],
      cost: {
        type: "per_second",
        value: 0.16,
      },
      fields: ["pixverseStyles", "prompt", "aspectRatio"],
      fieldOptions: {
        aspectRatio: {
          options: [
            { value: "16:9", label: "Landscape (16:9)" },
            { value: "4:3", label: "Standard (4:3)" },
            { value: "1:1", label: "Square (1:1)" },
            { value: "9:16", label: "Portrait (9:16)" },
            { value: "3:4", label: "Portrait (3:4)" },
          ],
          default: "16:9",
          label: "Aspect Ratio",
          userSelectable: true,
        },
        pixverseStyles: {
          options: [
            { value: "default", label: "Default" },
            { value: "anime", label: "Anime" },
            { value: "3d_animation", label: "3D Animation" },
            { value: "clay", label: "Clay" },
            { value: "comic", label: "Comic" },
            { value: "cyberpunk", label: "Cyberpunk" },
          ],
          default: "default",
          label: "Style",
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
    },
    {
      id: "WAN_PRO",
      name: "Wan Pro",
      url: "fal-ai/wan-pro/text-to-video",
      provider: "Wan",
      logo: PROVIDER_LOGOS.WAN,
      description:
        "Open‑source 1080 p model topping VBench, delivering exceptional visual quality and motion diversity.",

      features: [],
      categories: ["wan"],
      cost: {
        type: "fixed",
        value: 0.8, // $0.80 per video (in credits)
      },
      fields: ["prompt"],
      capabilities: {
        supportsEndFrame: false,
        supportsTailImage: false,
        supportsAudioGeneration: false,
        promptCharacterLimit: 1500,
        negativePromptCharacterLimit: 1500,
      },
    },
    {
      id: "PIKA_EFFECT_TEXT_V22",
      name: "Pika v2.2",
      url: "fal-ai/pika/v2.2/text-to-video",
      provider: "Pika",
      logo: PROVIDER_LOGOS.PIKA,
      description:
        "Smooth 1080p video generation with extended duration control and heightened realism.",

      features: [],
      categories: ["pika"],
      cost: {
        type: "per_second",
        value: 0.09,
      },
      fields: ["prompt", "negativePrompt", "duration", "aspectRatio"],
      fieldOptions: {
        duration: {
          options: ["5", "10"],
          default: "5",
          label: "Duration",
          userSelectable: true,
        },
        aspectRatio: {
          options: [
            { value: "16:9", label: "Landscape (16:9)" },
            { value: "9:16", label: "Portrait (9:16)" },
            { value: "1:1", label: "Square (1:1)" },
            { value: "4:5", label: "Portrait (4:5)" },
            { value: "5:4", label: "Landscape (5:4)" },
            { value: "3:2", label: "Landscape (3:2)" },
            { value: "2:3", label: "Portrait (2:3)" },
          ],
          default: "16:9",
          label: "Aspect Ratio",
          userSelectable: true,
        },
        negativePrompt: {
          default: "",
          label: "Negative Prompt",
          userSelectable: true,
          placeholder: "Describe what you don't want in the video...",
          helpText:
            "Optional: Specify elements to avoid in the generated video",
        },
      },
      capabilities: {
        supportsEndFrame: false,
        supportsTailImage: false,
        supportsAudioGeneration: false,
        promptCharacterLimit: 1500,
        negativePromptCharacterLimit: 1500,
      },
    },
    {
      id: "PIKA_EFFECT_TEXT_TURBO_V2",
      name: "Pika Turbo V2",
      url: "fal-ai/pika/v2/turbo/text-to-video",
      provider: "Pika",
      logo: PROVIDER_LOGOS.PIKA,
      description: "Faster (and cheaper) version of Pika v2.2.",

      features: ["Fast"],
      categories: ["pika"],
      cost: {
        type: "fixed",
        value: 0.2,
      },
      fields: ["prompt", "negativePrompt", "duration", "aspectRatio"],
      fieldOptions: {
        duration: {
          options: ["5"],
          default: "5",
          label: "Duration",
          userSelectable: false,
        },
        aspectRatio: {
          options: [
            { value: "16:9", label: "Landscape (16:9)" },
            { value: "9:16", label: "Portrait (9:16)" },
            { value: "1:1", label: "Square (1:1)" },
            { value: "4:5", label: "Portrait (4:5)" },
            { value: "5:4", label: "Landscape (5:4)" },
            { value: "3:2", label: "Landscape (3:2)" },
            { value: "2:3", label: "Portrait (2:3)" },
          ],
          default: "16:9",
          label: "Aspect Ratio",
          userSelectable: true,
        },
        negativePrompt: {
          default: "",
          label: "Negative Prompt",
          userSelectable: true,
          placeholder: "Describe what you don't want in the video...",
          helpText:
            "Optional: Specify elements to avoid in the generated video",
        },
      },
      capabilities: {
        supportsEndFrame: false,
        supportsTailImage: false,
        supportsAudioGeneration: false,
        promptCharacterLimit: 1500,
        negativePromptCharacterLimit: 1500,
        fixedDuration: 5,
      },
    },
    {
      id: "VEO3",
      name: "Veo 3",
      url: "fal-ai/veo3",
      provider: "Veo",
      logo: PROVIDER_LOGOS.VEO,
      description: "High-resolution, detailed videos with cinematic realism",

      features: ["Audio Generation"],
      categories: ["recommended", "veo"],
      cost: {
        type: "per_second",
        value: 0.4,
      },
      fields: ["prompt", "aspectRatio"],
      fieldOptions: {
        aspectRatio: {
          options: [
            { value: "16:9", label: "Landscape (16:9)" },
            { value: "9:16", label: "Portrait (9:16)" },
            { value: "1:1", label: "Square (1:1)" },
          ],
          default: "16:9",
          label: "Aspect Ratio",
          userSelectable: true,
        },
      },
      capabilities: {
        supportsEndFrame: false,
        supportsTailImage: false,
        supportsAudioGeneration: true,
        promptCharacterLimit: 10000,
        negativePromptCharacterLimit: 10000,
        fixedDuration: 8,
      },
    },
    {
      id: "VEO3_FAST",
      name: "Veo 3 Fast",
      url: "fal-ai/veo3/fast",
      provider: "Veo",
      logo: PROVIDER_LOGOS.VEO,
      description: "Fast and cost effective version of Google's Veo 3",

      features: ["Fast", "Audio Generation"],
      categories: ["veo", "recommended"],
      cost: {
        type: "per_second",
        value: 0.15,
      },
      fields: [
        "prompt",
        "aspectRatio",
        "negativePrompt",
        "enhancePrompt",
        "seed",
      ],
      fieldOptions: {
        aspectRatio: {
          options: [
            { value: "16:9", label: "Landscape (16:9)" },
            { value: "9:16", label: "Portrait (9:16)" },
            { value: "1:1", label: "Square (1:1)" },
          ],
          default: "16:9",
          label: "Aspect Ratio",
          userSelectable: true,
        },
        negativePrompt: {
          default: "",
          label: "Negative Prompt",
          userSelectable: true,
          placeholder: "Describe what you don't want in the video...",
          helpText:
            "Optional: Specify elements to avoid in the generated video",
        },
        enhancePrompt: {
          default: true,
          label: "Enhance prompt automatically",
          userSelectable: true,
        },
        seed: {
          default: null,
          label: "Seed",
          userSelectable: false,
          helpText: "Random seed for reproducible results",
        },
      },
      capabilities: {
        supportsEndFrame: false,
        supportsTailImage: false,
        supportsAudioGeneration: true,
        promptCharacterLimit: 10000,
        negativePromptCharacterLimit: 10000,
        fixedDuration: 8,
      },
    },
    {
      id: "HAILUO_2_3_STANDARD_TEXT",
      name: "Hailuo 2.3 [Standard]",
      url: "fal-ai/minimax/hailuo-2.3/standard/text-to-video",
      provider: "Minimax",
      logo: PROVIDER_LOGOS.MINIMAX,
      description:
        "Advanced text-to-video generation model with 768p resolution. Balanced quality and speed.",
      features: ["Prompt Optimizer", "768p"],
      categories: ["minimax", "recommended"],
      cost: {
        type: "per_second",
        value: 0.047,
      },
      fields: ["prompt", "duration", "promptOptimizer"],
      fieldOptions: {
        duration: {
          options: ["6", "10"],
          default: "6",
          label: "Duration",
          userSelectable: true,
        },
        promptOptimizer: {
          default: true,
          label: "Use prompt optimizer",
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
    },
    {
      id: "HAILUO_TEXT",
      name: "Hailuo 02 Pro",
      url: "fal-ai/minimax/hailuo-02/pro/text-to-video",
      provider: "Minimax",
      logo: PROVIDER_LOGOS.MINIMAX,
      description:
        "High-quality text-to-video generation with Hailuo 02 Pro model.",

      features: ["Prompt Optimizer", "1080p"],
      categories: ["minimax", "recommended"],
      cost: {
        type: "fixed",
        value: 0.48,
      },
      fields: ["prompt", "promptOptimizer"],
      fieldOptions: {
        promptOptimizer: {
          default: true,
          label: "Use prompt optimizer",
          userSelectable: true,
        },
      },
      capabilities: {
        supportsEndFrame: false,
        supportsTailImage: false,
        supportsAudioGeneration: false,
        promptCharacterLimit: 1500,
        negativePromptCharacterLimit: 1500,
        fixedDuration: 6,
      },
    },
    {
      id: "SEEDANCE_TEXT",
      name: "Seedance 1.0 Pro",
      url: "fal-ai/bytedance/seedance/v1/pro/text-to-video",
      provider: "ByteDance",
      logo: PROVIDER_LOGOS.BYTEDANCE,
      description:
        "High-quality text-to-video generation with ByteDance Seedance Pro model.",

      features: ["1080p", "Fast"],
      categories: ["bytedance", "recommended"],
      cost: {
        type: "per_second",
        value: 0.125, // 0.125 credits per second
      },
      fields: ["prompt", "duration", "aspectRatio", "cameraFixed", "seed"],
      fieldOptions: {
        duration: {
          options: ["3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
          default: "12",
          label: "Duration",
          userSelectable: true,
        },
        aspectRatio: {
          options: [
            { value: "21:9", label: "Ultrawide (21:9)" },
            { value: "16:9", label: "Landscape (16:9)" },
            { value: "4:3", label: "Standard (4:3)" },
            { value: "1:1", label: "Square (1:1)" },
            { value: "3:4", label: "Portrait (3:4)" },
            { value: "9:16", label: "Portrait (9:16)" },
          ],
          default: "21:9",
          label: "Aspect Ratio",
          userSelectable: true,
        },
        cameraFixed: {
          default: false,
          label: "Fix camera position",
          userSelectable: true,
          helpText: "Lock camera to prevent movement",
        },
        seed: {
          default: null,
          label: "Seed",
          userSelectable: false,
          helpText: "Random seed for reproducible results",
        },
      },
      capabilities: {
        supportsEndFrame: false,
        supportsTailImage: false,
        supportsAudioGeneration: false,
        promptCharacterLimit: 1500,
        negativePromptCharacterLimit: 1500,
      },
    },
    {
      id: "LUMA_RAY2",
      name: "Luma Ray 2",
      url: "fal-ai/luma-dream-machine/ray-2",
      provider: "Luma",
      logo: PROVIDER_LOGOS.LUMA,
      description: "Ultra‑realistic detail and fast, coherent scene motion.",

      features: [],
      categories: ["recommended", "luma"],
      cost: {
        type: "fixed",
        value: 1, // $1.5 per video (in credits)
      },
      fields: ["prompt", "addAudioToVideo"],
      fieldOptions: {
        addAudioToVideo: {
          default: false,
          label: "Add audio to video",
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
    },
    {
      id: "SEEDANCE_V1_LITE",
      name: "Seedance 1.0 Lite",
      url: "fal-ai/bytedance/seedance/v1/lite/text-to-video",
      provider: "ByteDance",
      logo: PROVIDER_LOGOS.BYTEDANCE,
      description:
        "High-quality text-to-video generation by ByteDance with flexible duration control.",
      features: ["Fast", "1080p"],
      categories: ["bytedance"],
      cost: {
        type: "per_second",
        value: 0.036, // $0.036 per second
      },
      fields: ["prompt", "duration", "aspectRatio", "cameraFixed"],
      fieldOptions: {
        duration: {
          options: ["3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
          default: "5",
          label: "Duration",
          userSelectable: true,
        },
        aspectRatio: {
          options: [
            { value: "16:9", label: "Landscape (16:9)" },
            { value: "4:3", label: "Standard (4:3)" },
            { value: "1:1", label: "Square (1:1)" },
            { value: "3:4", label: "Portrait (3:4)" },
            { value: "9:16", label: "Portrait (9:16)" },
            { value: "9:21", label: "Vertical (9:21)" },
          ],
          default: "16:9",
          label: "Aspect Ratio",
          userSelectable: true,
        },
        cameraFixed: {
          default: false,
          label: "Fix camera position",
          userSelectable: true,
          helpText: "Lock camera to prevent movement",
        },
      },
      capabilities: {
        supportsEndFrame: false,
        supportsTailImage: false,
        supportsAudioGeneration: false,
        promptCharacterLimit: 1500,
        negativePromptCharacterLimit: 1500,
      },
    },

    {
      id: "WAN_2_2_TURBO",
      name: "Wan-2.2 Turbo",
      url: "fal-ai/wan/v2.2-a14b/text-to-video/turbo",
      provider: "Wan",
      logo: PROVIDER_LOGOS.WAN,
      description:
        "High-quality videos with high visual quality and motion diversity from text prompts.",
      features: ["Fast", "720p"],
      categories: ["wan"],
      cost: {
        type: "per_second",
        value: 0.02, // $0.02 per second
      },
      fields: ["prompt", "aspectRatio"],
      fieldOptions: {
        aspectRatio: {
          options: [
            { value: "16:9", label: "Landscape (16:9)" },
            { value: "9:16", label: "Portrait (9:16)" },
            { value: "1:1", label: "Square (1:1)" },
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
        fixedDuration: 5,
      },
    },

    {
      id: "WAN_2_5_TEXT",
      name: "Wan 2.5",
      url: "fal-ai/wan-25-preview/text-to-video",
      provider: "Wan",
      logo: PROVIDER_LOGOS.WAN,
      description: "Lastest frontier model from Alibaba with sound.",
      features: ["Audio Generation", "1080p", "Prompt Optimizer"],
      categories: ["recommended", "wan"],
      cost: {
        type: "fixed",
        value: 0.7, // 0.7M credits per video
      },
      fields: [
        "prompt",
        "aspectRatio",
        "negativePrompt",
        "enhancePrompt",
        "seed",
      ],
      fieldOptions: {
        aspectRatio: {
          options: [
            { value: "16:9", label: "Landscape (16:9)" },
            { value: "9:16", label: "Portrait (9:16)" },
            { value: "1:1", label: "Square (1:1)" },
          ],
          default: "16:9",
          label: "Aspect Ratio",
          userSelectable: true,
        },
        negativePrompt: {
          default: "",
          label: "Negative Prompt",
          userSelectable: true,
          placeholder: "Describe what you don't want in the video...",
          helpText:
            "Optional: Specify elements to avoid in the generated video",
        },
        enhancePrompt: {
          default: true,
          label: "Enhance prompt automatically",
          userSelectable: true,
        },
        seed: {
          default: null,
          label: "Seed",
          userSelectable: false,
          helpText: "Random seed for reproducible results",
        },
      },
      capabilities: {
        supportsEndFrame: false,
        supportsTailImage: false,
        supportsAudioGeneration: true,
        promptCharacterLimit: 1500,
        negativePromptCharacterLimit: 1500,
        fixedDuration: 5,
      },
    },
    {
      id: "LTXV_2_TEXT",
      name: "LTX Video 2.0",
      url: "fal-ai/ltxv-2/text-to-video",
      provider: "Lightricks",
      logo: PROVIDER_LOGOS.LIGHTRICKS,
      description:
        "Create high-fidelity video with audio from text using Lightricks LTX Video 2.0.",
      features: ["Audio Generation", "2160p"],
      categories: ["lightricks"],
      cost: {
        type: "tiered",
        base_value: 0.06, // 0.06M credits per second for 1080p (normal version)
        tiers: [
          { resolution: "1080p", value: 0.06 },
          { resolution: "1440p", value: 0.12 },
          { resolution: "2160p", value: 0.24 },
        ],
      },
      fields: ["prompt", "duration", "resolution", "aspectRatio"],
      fieldOptions: {
        duration: {
          options: ["6", "8", "10"],
          default: "6",
          label: "Duration",
          userSelectable: true,
        },
        aspectRatio: {
          options: [{ value: "16:9", label: "Landscape (16:9)" }],
          default: "16:9",
          label: "Aspect Ratio",
          userSelectable: false,
        },
        resolution: {
          options: [
            { value: "1080p", label: "1080p (Full HD)" },
            { value: "1440p", label: "1440p (2K)" },
            { value: "2160p", label: "2160p (4K)" },
          ],
          default: "1080p",
          label: "Resolution",
          userSelectable: true,
        },
      },
      capabilities: {
        supportsEndFrame: false,
        supportsTailImage: false,
        supportsAudioGeneration: true,
        promptCharacterLimit: 1500,
        negativePromptCharacterLimit: 1500,
      },
    },
    {
      id: "LTXV_2_FAST_TEXT",
      name: "LTX Video 2.0 Fast",
      url: "fal-ai/ltxv-2/text-to-video/fast",
      provider: "Lightricks",
      logo: PROVIDER_LOGOS.LIGHTRICKS,
      description:
        "Fast high-fidelity video with audio from text using Lightricks LTX Video 2.0.",
      features: ["Audio Generation", "2160p", "Fast"],
      categories: ["lightricks"],
      cost: {
        type: "tiered",
        base_value: 0.04, // 0.04M credits per second for 1080p (fast version)
        tiers: [
          { resolution: "1080p", value: 0.04 },
          { resolution: "1440p", value: 0.08 },
          { resolution: "2160p", value: 0.16 },
        ],
      },
      fields: ["prompt", "duration", "resolution", "aspectRatio"],
      fieldOptions: {
        duration: {
          options: ["6", "8", "10", "12", "14", "16", "18", "20"],
          default: "6",
          label: "Duration",
          userSelectable: true,
        },
        aspectRatio: {
          options: [{ value: "16:9", label: "Landscape (16:9)" }],
          default: "16:9",
          label: "Aspect Ratio",
          userSelectable: false,
        },
        resolution: {
          options: [
            { value: "1080p", label: "1080p (Full HD)" },
            { value: "1440p", label: "1440p (2K)" },
            { value: "2160p", label: "2160p (4K)" },
          ],
          default: "1080p",
          label: "Resolution",
          userSelectable: true,
        },
      },
      capabilities: {
        supportsEndFrame: false,
        supportsTailImage: false,
        supportsAudioGeneration: true,
        promptCharacterLimit: 1500,
        negativePromptCharacterLimit: 1500,
      },
    },
    {
      id: "BYTEDANCE_SEEDANCE_PRO_FAST_TEXT",
      name: "Seedance 1.0 Pro Fast",
      url: "fal-ai/bytedance/seedance/v1/pro/fast/text-to-video",
      provider: "ByteDance",
      logo: PROVIDER_LOGOS.BYTEDANCE,
      description:
        "Next-generation video model designed to deliver maximum performance at minimal cost.",
      features: ["Fast", "1080p"],
      categories: ["recommended", "bytedance"],
      cost: {
        type: "tiered",
        base_value: 0.026, // ~$0.13 for 5s 1080p video = 0.026M credits per second
        tiers: [
          { resolution: "480p", value: 0.006 },
          { resolution: "720p", value: 0.013 },
          { resolution: "1080p", value: 0.026 },
        ],
      },
      fields: [
        "prompt",
        "duration",
        "aspectRatio",
        "resolution",
        "cameraFixed",
        "seed",
      ],
      fieldOptions: {
        duration: {
          options: ["3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
          default: "5",
          label: "Duration",
          userSelectable: true,
        },
        aspectRatio: {
          options: [
            { value: "21:9", label: "Ultrawide (21:9)" },
            { value: "16:9", label: "Landscape (16:9)" },
            { value: "4:3", label: "Standard (4:3)" },
            { value: "1:1", label: "Square (1:1)" },
            { value: "3:4", label: "Portrait (3:4)" },
            { value: "9:16", label: "Portrait (9:16)" },
          ],
          default: "21:9",
          label: "Aspect Ratio",
          userSelectable: true,
        },
        resolution: {
          options: [
            { value: "480p", label: "480p (SD)" },
            { value: "720p", label: "720p (HD)" },
            { value: "1080p", label: "1080p (Full HD)" },
          ],
          default: "1080p",
          label: "Resolution",
          userSelectable: true,
        },
        cameraFixed: {
          default: false,
          label: "Fix camera position",
          userSelectable: true,
          helpText: "Lock camera to prevent movement",
        },
        seed: {
          default: null,
          label: "Seed",
          userSelectable: false,
          helpText: "Random seed for reproducible results",
        },
      },
      capabilities: {
        supportsEndFrame: false,
        supportsTailImage: false,
        supportsAudioGeneration: false,
        promptCharacterLimit: 1500,
        negativePromptCharacterLimit: 1500,
      },
    },
  ],
  IMAGE_MODELS: [
    {
      id: "VEO3_1_IMAGE",
      name: "Veo 3.1 (Image)",
      url: "fal-ai/veo3.1/image-to-video",
      provider: "Veo",
      logo: PROVIDER_LOGOS.VEO,
      description:
        "The most advanced AI video generation model by Google. With sound on!",
      features: ["Audio Generation", "1080p", "End Frame"],
      categories: ["recommended", "veo"],
      cost: {
        type: "per_second",
        value: 0.4, // 0.4M credits per second
      },
      fields: [
        "prompt",
        "imageBase64",
        "aspectRatio",
        "duration",
        "resolution",
        "endFrameImageBase64",
      ],
      fieldOptions: {
        duration: {
          options: ["8"],
          default: "8",
          label: "Duration",
          userSelectable: false,
        },
        aspectRatio: {
          options: [
            { value: "16:9", label: "Landscape (16:9)" },
            { value: "9:16", label: "Portrait (9:16)" },
          ],
          default: "16:9",
          label: "Aspect Ratio",
          userSelectable: true,
        },
        resolution: {
          options: [
            { value: "720p", label: "720p (HD)" },
            { value: "1080p", label: "1080p (Full HD)" },
          ],
          default: "720p",
          label: "Resolution",
          userSelectable: true,
        },
      },
      capabilities: {
        supportsEndFrame: true,
        supportsTailImage: false,
        supportsAudioGeneration: true,
        promptCharacterLimit: 10000,
        negativePromptCharacterLimit: 10000,
        fixedDuration: 8,
      },
    },
    {
      id: "VEO3_1_FAST_IMAGE",
      name: "Veo 3.1 Fast (Image)",
      url: "fal-ai/veo3.1/fast/image-to-video",
      provider: "Veo",
      logo: PROVIDER_LOGOS.VEO,
      description:
        "Fast and cost-effective version of Google's Veo 3.1 for image-to-video generation.",
      features: ["Fast", "Audio Generation", "1080p", "End Frame"],
      categories: ["recommended", "veo"],
      cost: {
        type: "per_second",
        value: 0.15, // 0.15M credits per second
      },
      fields: [
        "prompt",
        "imageBase64",
        "aspectRatio",
        "duration",
        "resolution",
        "endFrameImageBase64",
      ],
      fieldOptions: {
        duration: {
          options: ["8"],
          default: "8",
          label: "Duration",
          userSelectable: false,
        },
        aspectRatio: {
          options: [
            { value: "16:9", label: "Landscape (16:9)" },
            { value: "9:16", label: "Portrait (9:16)" },
          ],
          default: "16:9",
          label: "Aspect Ratio",
          userSelectable: true,
        },
        resolution: {
          options: [
            { value: "720p", label: "720p (HD)" },
            { value: "1080p", label: "1080p (Full HD)" },
          ],
          default: "720p",
          label: "Resolution",
          userSelectable: true,
        },
      },
      capabilities: {
        supportsEndFrame: true,
        supportsTailImage: false,
        supportsAudioGeneration: true,
        promptCharacterLimit: 10000,
        negativePromptCharacterLimit: 10000,
        fixedDuration: 8,
      },
    },
    {
      id: "VEO3_1_REFERENCE",
      name: "Veo 3.1 (Ingredients)",
      url: "fal-ai/veo3.1/reference-to-video",
      provider: "Veo",
      logo: PROVIDER_LOGOS.VEO,
      description:
        "Generate videos from multiple reference images (ingredients) using Google's Veo 3.1 for consistent subject appearance.",
      features: ["Multi-Image Reference", "Audio Generation", "1080p"],
      categories: ["recommended", "veo"],
      cost: {
        type: "per_second",
        value: 0.4, // 0.4M credits per second
      },
      fields: ["prompt", "referenceImageUrls", "duration", "resolution"],
      fieldOptions: {
        duration: {
          options: ["8"],
          default: "8",
          label: "Duration",
          userSelectable: false,
        },
        resolution: {
          options: [
            { value: "720p", label: "720p (HD)" },
            { value: "1080p", label: "1080p (Full HD)" },
          ],
          default: "720p",
          label: "Resolution",
          userSelectable: true,
        },
      },
      capabilities: {
        supportsEndFrame: false,
        supportsTailImage: false,
        supportsAudioGeneration: true,
        promptCharacterLimit: 10000,
        negativePromptCharacterLimit: 10000,
        fixedDuration: 8,
      },
    },
    {
      id: "SORA_2_PRO_IMAGE",
      name: "Sora 2 Pro",
      url: "fal-ai/sora-2/image-to-video/pro",
      provider: "OpenAI",
      logo: PROVIDER_LOGOS.OPENAI,
      description:
        "Higher fidelity version of Sora 2. Takes longer to generate but delivers enhanced detail and quality for complex scenes. ",
      features: ["Audio Generation", "1080p"],
      categories: ["recommended", "sora", "openai"],
      cost: {
        type: "tiered",
        base_value: 0.3, // 0.3M credits per second default (720p)
        tiers: [
          { resolution: "720p", value: 0.3 },
          { resolution: "1080p", value: 0.5 },
        ],
      },
      fields: [
        "prompt",
        "imageBase64",
        "duration",
        "aspectRatio",
        "resolution",
      ],
      fieldOptions: {
        duration: {
          options: ["4", "8", "12"],
          default: "8",
          label: "Duration",
          userSelectable: true,
        },
        aspectRatio: {
          options: [
            { value: "16:9", label: "Landscape (16:9)" },
            { value: "9:16", label: "Portrait (9:16)" },
          ],
          default: "16:9",
          label: "Aspect Ratio",
          userSelectable: true,
        },
        resolution: {
          options: [
            { value: "720p", label: "720p (HD)" },
            { value: "1080p", label: "1080p (Full HD)" },
          ],
          default: "720p",
          label: "Resolution",
          userSelectable: true,
        },
      },
      capabilities: {
        supportsEndFrame: false,
        supportsTailImage: false,
        supportsAudioGeneration: true,
        promptCharacterLimit: 1500,
        negativePromptCharacterLimit: 1500,
      },
    },
    {
      id: "SORA_2_IMAGE",
      name: "Sora 2",
      url: "fal-ai/sora-2/image-to-video",
      provider: "OpenAI",
      logo: PROVIDER_LOGOS.OPENAI,
      description:
        "OpenAI's SOTA video model capable of creating richly detailed, dynamic clips with audio from natural language. Tuned for speed and everyday creation.",
      features: ["Audio Generation", "720p"],
      categories: ["recommended", "sora", "openai"],
      cost: {
        type: "tiered",
        base_value: 0.1, // 0.1M credits per second (720p only)
        tiers: [{ resolution: "720p", value: 0.1 }],
      },
      fields: [
        "prompt",
        "imageBase64",
        "duration",
        "aspectRatio",
        "resolution",
      ],
      fieldOptions: {
        duration: {
          options: ["4", "8", "12"],
          default: "8",
          label: "Duration",
          userSelectable: true,
        },
        aspectRatio: {
          options: [
            { value: "16:9", label: "Landscape (16:9)" },
            { value: "9:16", label: "Portrait (9:16)" },
          ],
          default: "16:9",
          label: "Aspect Ratio",
          userSelectable: true,
        },
        resolution: {
          options: [{ value: "720p", label: "720p (HD)" }],
          default: "720p",
          label: "Resolution",
          userSelectable: false,
        },
      },
      capabilities: {
        supportsEndFrame: false,
        supportsTailImage: false,
        supportsAudioGeneration: true,
        promptCharacterLimit: 1500,
        negativePromptCharacterLimit: 1500,
      },
    },
    {
      id: "VEO3_IMAGE",
      name: "Veo 3 (Image)",
      url: "fal-ai/veo3/image-to-video",
      provider: "Veo",
      logo: PROVIDER_LOGOS.VEO,
      description:
        "High-quality video generation model from Google. With sound on!",
      features: ["Audio Generation", "1080p"],
      categories: ["recommended", "veo"],
      cost: {
        type: "per_second",
        value: 0.4, // $0.4 per second (in credits)
      },
      fields: ["prompt", "imageBase64", "aspectRatio"],
      fieldOptions: {
        aspectRatio: {
          options: [
            { value: "auto", label: "Auto (Best Match)" },
            { value: "16:9", label: "Landscape (16:9)" },
            { value: "9:16", label: "Portrait (9:16)" },
          ],
          default: "auto",
          label: "Aspect Ratio",
          userSelectable: true,
        },
      },
      capabilities: {
        supportsEndFrame: false,
        supportsTailImage: false,
        supportsAudioGeneration: true,
        promptCharacterLimit: 10000,
        negativePromptCharacterLimit: 10000,
        fixedDuration: 8,
      },
    },
    {
      id: "VEO3_FAST_IMAGE",
      name: "Veo 3 Fast (Image)",
      url: "fal-ai/veo3/fast/image-to-video",
      provider: "Veo",
      logo: PROVIDER_LOGOS.VEO,
      description: "Fast and cost-effective version of Veo 3.",
      features: ["Fast", "Audio Generation", "1080p"],
      categories: ["recommended", "veo"],
      cost: {
        type: "per_second",
        value: 0.15, // $0.15 per second (in credits)
      },
      fields: ["prompt", "imageBase64", "aspectRatio"],
      fieldOptions: {
        aspectRatio: {
          options: [
            { value: "auto", label: "Auto (Best Match)" },
            { value: "16:9", label: "Landscape (16:9)" },
            { value: "9:16", label: "Portrait (9:16)" },
          ],
          default: "auto",
          label: "Aspect Ratio",
          userSelectable: true,
        },
      },
      capabilities: {
        supportsEndFrame: false,
        supportsTailImage: false,
        supportsAudioGeneration: true,
        promptCharacterLimit: 10000,
        negativePromptCharacterLimit: 10000,
        fixedDuration: 8,
      },
    },
    {
      id: "WAN_2_5_IMAGE",
      name: "Wan 2.5 (Image)",
      url: "fal-ai/wan-25-preview/image-to-video",
      provider: "Wan",
      logo: PROVIDER_LOGOS.WAN,
      description: "Lastest frontier model from Alibaba with sound.",
      features: ["Audio Generation", "1080p", "Prompt Optimizer"],
      categories: ["recommended", "wan"],
      cost: {
        type: "fixed",
        value: 0.7, // 0.7M credits per video
      },
      fields: [
        "prompt",
        "imageBase64",
        "negativePrompt",
        "enhancePrompt",
        "seed",
      ],
      fieldOptions: {
        negativePrompt: {
          default: "",
          label: "Negative Prompt",
          userSelectable: true,
          placeholder: "Describe what you don't want in the video...",
          helpText:
            "Optional: Specify elements to avoid in the generated video",
        },
        enhancePrompt: {
          default: true,
          label: "Enhance prompt automatically",
          userSelectable: true,
        },
        seed: {
          default: null,
          label: "Seed",
          userSelectable: false,
          helpText: "Random seed for reproducible results",
        },
      },
      capabilities: {
        supportsEndFrame: false,
        supportsTailImage: false,
        supportsAudioGeneration: true,
        promptCharacterLimit: 1500,
        negativePromptCharacterLimit: 1500,
        fixedDuration: 5,
      },
    },
    {
      id: "HIGGSFIELD_DOP",
      name: "Higgsfield",
      url: "higgsfield/dop-preview",
      provider: "Higgsfield",
      logo: PROVIDER_LOGOS.HIGGSFIELD,
      description:
        "Cinematic visual effects, from explosions to surreal transformations.",
      features: ["Motion Presets"],
      categories: ["recommended", "higgsfield"],
      cost: {
        type: "fixed",
        value: 0.74, // $0.74 per video (in credits) - adjust based on actual pricing
      },
      fields: ["prompt", "imageBase64"],
      capabilities: {
        supportsEndFrame: false,
        supportsTailImage: false,
        supportsAudioGeneration: false,
        promptCharacterLimit: 1500,
        negativePromptCharacterLimit: 1500,
      },
    },
    {
      id: "LUMA_IMAGE",
      name: "Luma Dream Machine (Image)",
      url: "fal-ai/luma-dream-machine/image-to-video",
      provider: "Luma",
      logo: PROVIDER_LOGOS.LUMA,
      description: "Animate static images using Luma Dream Machine.",

      features: ["Loop", "End Frame"],
      categories: ["luma"],
      cost: {
        type: "fixed",
        value: 0.5, // $0.5 per video (in credits)
      },
      fields: [
        "prompt",
        "imageBase64",
        "aspectRatio",
        "endFrameImageBase64",
        "loop",
        "addAudioToVideo",
      ],
      fieldOptions: {
        aspectRatio: {
          options: [
            { value: "16:9", label: "Landscape (16:9)" },
            { value: "9:16", label: "Portrait (9:16)" },
            { value: "4:3", label: "Standard (4:3)" },
            { value: "3:4", label: "Portrait (3:4)" },
            { value: "21:9", label: "Ultrawide (21:9)" },
            { value: "9:21", label: "Vertical (9:21)" },
          ],
          default: "16:9",
          label: "Aspect Ratio",
          userSelectable: true,
        },
        loop: {
          default: false,
          label: "Loop video (blend end with beginning)",
          userSelectable: true,
        },
        addAudioToVideo: {
          default: false,
          label: "Add audio to video",
          userSelectable: true,
        },
      },
      capabilities: {
        supportsEndFrame: true,
        supportsTailImage: false,
        supportsAudioGeneration: false,
        promptCharacterLimit: 1500,
        negativePromptCharacterLimit: 1500,
      },
    },
    {
      id: "LUMA_RAY2_IMAGE",
      name: "Luma Ray 2 (Image)",
      url: "fal-ai/luma-dream-machine/ray-2/image-to-video",
      provider: "Luma",
      logo: PROVIDER_LOGOS.LUMA,
      description: "Ultra‑realistic detail and fast, coherent scene motion.",

      features: ["End Frame"],
      categories: ["recommended", "luma"],
      cost: {
        type: "per_second",
        value: 0.2, // $0.2 per second for 1080p (in credits)
      },
      fields: [
        "prompt",
        "imageBase64",
        "endFrameImageBase64",
        "addAudioToVideo",
      ],
      fieldOptions: {
        addAudioToVideo: {
          default: false,
          label: "Add audio to video",
          userSelectable: true,
        },
      },
      capabilities: {
        supportsEndFrame: true,
        supportsTailImage: false,
        supportsAudioGeneration: false,
        promptCharacterLimit: 1500,
        negativePromptCharacterLimit: 1500,
      },
    },
    {
      id: "MINIMAX_IMAGE",
      name: "Minimax (Image)",
      url: "fal-ai/minimax/video-01-live/image-to-video",
      provider: "Minimax",
      logo: PROVIDER_LOGOS.MINIMAX,
      description:
        "Live2D‑ready clips with built‑in prompt optimizer, facial control and smooth animation flow.",

      features: ["Prompt Optimizer"],
      categories: ["minimax"],
      cost: {
        type: "fixed",
        value: 0.5, // $0.5 per video (in credits)
      },
      fields: ["prompt", "imageBase64", "promptOptimizer"],
      fieldOptions: {
        promptOptimizer: {
          default: true,
          label: "Use prompt optimizer",
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
    },
    {
      id: "MINIMAX_IMAGE_SUBJECT",
      name: "Minimax Subject Reference (Image)",
      url: "fal-ai/minimax/video-01-subject-reference",
      provider: "Minimax",
      logo: PROVIDER_LOGOS.MINIMAX,
      description:
        "Subject reference with built‑in prompt optimizer, facial control and smooth animation flow.",

      features: ["Subject Reference"],
      categories: ["minimax"],
      cost: {
        type: "fixed",
        value: 0.5, // $0.5 per video (in credits)
      },
      fields: ["prompt", "imageBase64"],
      capabilities: {
        supportsEndFrame: false,
        supportsTailImage: false,
        supportsAudioGeneration: false,
        promptCharacterLimit: 1500,
        negativePromptCharacterLimit: 1500,
      },
    },
    {
      id: "KLING_V2_5_TURBO_PRO_IMAGE",
      name: "Kling 2.5 Turbo (Image)",
      url: "fal-ai/kling-video/v2.5-turbo/pro/image-to-video",
      provider: "Kling",
      logo: PROVIDER_LOGOS.KLING,
      description:
        "Top-tier video generation with motion fluidity, cinematic visuals, and exceptional prompt precision.",
      features: ["1080p"],
      categories: ["recommended", "kling"],
      cost: {
        type: "per_second",
        value: 0.07, // 0.07M credits per second
      },
      fields: ["prompt", "imageBase64", "duration", "negativePrompt"],
      fieldOptions: {
        duration: {
          options: ["5", "10"],
          default: "5",
          label: "Duration",
          userSelectable: true,
        },
        negativePrompt: {
          default: "",
          label: "Negative Prompt",
          userSelectable: true,
          placeholder: "Describe what you don't want in the video...",
          helpText:
            "Optional: Specify elements to avoid in the generated video",
        },
      },
      capabilities: {
        supportsEndFrame: false,
        supportsTailImage: false,
        supportsAudioGeneration: false,
        promptCharacterLimit: 1500,
        negativePromptCharacterLimit: 1500,
      },
    },
    {
      id: "KLING_V2.1_PRO_IMAGE",
      name: "Kling v2.1 Pro (Image)",
      url: "fal-ai/kling-video/v2.1/pro/image-to-video",
      provider: "Kling",
      logo: PROVIDER_LOGOS.KLING,
      description:
        "Advanced Kling 2.1 Pro model for Image-to-video generation.",

      features: ["1080p", "End Frame"],
      categories: ["recommended", "kling"],
      cost: {
        type: "per_second",
        value: 0.09,
      },
      fields: [
        "prompt",
        "imageBase64",
        "tail_image_url",
        "duration",
        "aspectRatio",
        "negativePrompt",
      ],
      fieldOptions: {
        duration: {
          options: ["5", "10"],
          default: "5",
          label: "Duration",
          userSelectable: true,
        },
        aspectRatio: {
          options: [
            { value: "16:9", label: "Landscape (16:9)" },
            { value: "9:16", label: "Portrait (9:16)" },
            { value: "1:1", label: "Square (1:1)" },
          ],
          default: "16:9",
          label: "Aspect Ratio",
          userSelectable: true,
        },
        negativePrompt: {
          default: "",
          label: "Negative Prompt",
          userSelectable: true,
          placeholder: "Describe what you don't want in the video...",
          helpText:
            "Optional: Specify elements to avoid in the generated video",
        },
      },
      capabilities: {
        supportsEndFrame: false,
        supportsTailImage: true,
        supportsAudioGeneration: false,
        promptCharacterLimit: 1500,
        negativePromptCharacterLimit: 1500,
      },
    },
    {
      id: "KLING_IMAGE_V1_6",
      name: "Kling v1.6 Pro (Image)",
      url: "fal-ai/kling-video/v1.6/pro/image-to-video",
      provider: "Kling",
      logo: PROVIDER_LOGOS.KLING,
      description:
        "Prompt‑faithful videos in sharp 1080p, capturing complex camera moves with convincing realism.",

      features: ["End Frame", "1080p"],
      categories: ["recommended", "kling"],
      cost: {
        type: "per_second",
        value: 0.095,
      },
      fields: [
        "prompt",
        "imageBase64",
        "tail_image_url",
        "duration",
        "aspectRatio",
        "negativePrompt",
      ],
      fieldOptions: {
        duration: {
          options: ["5", "10"],
          default: "5",
          label: "Duration",
          userSelectable: true,
        },
        aspectRatio: {
          options: [
            { value: "16:9", label: "Landscape (16:9)" },
            { value: "9:16", label: "Portrait (9:16)" },
            { value: "1:1", label: "Square (1:1)" },
          ],
          default: "16:9",
          label: "Aspect Ratio",
          userSelectable: true,
        },
        negativePrompt: {
          default: "",
          label: "Negative Prompt",
          userSelectable: true,
          placeholder: "Describe what you don't want in the video...",
          helpText:
            "Optional: Specify elements to avoid in the generated video",
        },
      },
      capabilities: {
        supportsEndFrame: false,
        supportsTailImage: true,
        supportsAudioGeneration: false,
        promptCharacterLimit: 1500,
        negativePromptCharacterLimit: 1500,
      },
    },
    {
      id: "KLING_V2.1_MASTER_VIDEO",
      name: "Kling v2.1 Master (Image)",
      url: "fal-ai/kling-video/v2.1/master/image-to-video",
      provider: "Kling",
      logo: PROVIDER_LOGOS.KLING,
      description: "Advanced Kling 2.1 model for Image-to-video generation.",

      features: [],
      categories: ["recommended", "kling"],
      cost: {
        type: "per_second",
        value: 0.28,
      },
      fields: [
        "prompt",
        "imageBase64",
        "duration",
        "aspectRatio",
        "negativePrompt",
      ],
      fieldOptions: {
        duration: {
          options: ["5", "10"],
          default: "5",
          label: "Duration",
          userSelectable: true,
        },
        aspectRatio: {
          options: [
            { value: "16:9", label: "Landscape (16:9)" },
            { value: "9:16", label: "Portrait (9:16)" },
            { value: "1:1", label: "Square (1:1)" },
          ],
          default: "16:9",
          label: "Aspect Ratio",
          userSelectable: true,
        },
        negativePrompt: {
          default: "",
          label: "Negative Prompt",
          userSelectable: true,
          placeholder: "Describe what you don't want in the video...",
          helpText:
            "Optional: Specify elements to avoid in the generated video",
        },
      },
      capabilities: {
        supportsEndFrame: false,
        supportsTailImage: false,
        supportsAudioGeneration: false,
        promptCharacterLimit: 1500,
        negativePromptCharacterLimit: 1500,
      },
    },
    {
      id: "KLING_IMAGE_MASTER",
      name: "Kling 2.0 Master (Image)",
      url: "fal-ai/kling-video/v2/master/image-to-video",
      provider: "Kling",
      logo: PROVIDER_LOGOS.KLING,
      description: "Advanced Kling 2.0 model for image-to-video.",

      features: [],
      categories: ["recommended", "kling"],
      cost: {
        type: "per_second",
        value: 0.3, // $0.3 per second for 1080p (in credits)
      },
      fields: ["prompt", "imageBase64", "aspectRatio", "negativePrompt"],
      fieldOptions: {
        aspectRatio: {
          options: [
            { value: "16:9", label: "Landscape (16:9)" },
            { value: "9:16", label: "Portrait (9:16)" },
            { value: "1:1", label: "Square (1:1)" },
          ],
          default: "16:9",
          label: "Aspect Ratio",
          userSelectable: true,
        },
        negativePrompt: {
          default: "",
          label: "Negative Prompt",
          userSelectable: true,
          placeholder: "Describe what you don't want in the video...",
          helpText:
            "Optional: Specify elements to avoid in the generated video",
        },
      },
      capabilities: {
        supportsEndFrame: false,
        supportsTailImage: false,
        supportsAudioGeneration: false,
        promptCharacterLimit: 1500,
        negativePromptCharacterLimit: 1500,
        fixedDuration: 5,
      },
    },
    {
      id: "VEO2_IMAGE",
      name: "Veo 2 (Image)",
      url: "fal-ai/veo2/image-to-video",
      provider: "Veo",
      logo: PROVIDER_LOGOS.VEO,
      description:
        "High-resolution (up to 4K), detailed videos with cinematic realism",

      features: [],
      categories: ["veo"],
      cost: {
        type: "tiered",
        base_value: 2.5, // $2.50 for 5s video
        additional_value: 0.5, // $0.50 per additional second
      },
      fields: ["prompt", "imageBase64", "duration", "aspectRatio"],
      fieldOptions: {
        duration: {
          options: ["5", "6", "7", "8"],
          default: "5",
          label: "Duration",
          userSelectable: true,
        },
        aspectRatio: {
          options: [
            { value: "16:9", label: "Landscape (16:9)" },
            { value: "9:16", label: "Portrait (9:16)" },
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
    },
    {
      id: "PIXVERSE_IMAGE",
      name: "Pixverse (Image)",
      url: "fal-ai/pixverse/v5/image-to-video",
      provider: "Pixverse",
      logo: PROVIDER_LOGOS.PIXVERSE,
      description: "Pixverse v5 image-to-video model.",

      features: ["Styles"],
      categories: ["pixverse"],
      cost: {
        type: "per_second",
        value: 0.16, // $0.16 per second for 1080p (in credits)
      },
      fields: ["pixverseStyles", "prompt", "imageBase64", "aspectRatio"],
      fieldOptions: {
        aspectRatio: {
          options: [
            { value: "16:9", label: "Landscape (16:9)" },
            { value: "4:3", label: "Standard (4:3)" },
            { value: "1:1", label: "Square (1:1)" },
            { value: "3:4", label: "Portrait (3:4)" },
            { value: "9:16", label: "Portrait (9:16)" },
          ],
          default: "16:9",
          label: "Aspect Ratio",
          userSelectable: true,
        },
        pixverseStyles: {
          options: [
            { value: "default", label: "Default" },
            { value: "anime", label: "Anime" },
            { value: "3d_animation", label: "3D Animation" },
            { value: "clay", label: "Clay" },
            { value: "comic", label: "Comic" },
            { value: "cyberpunk", label: "Cyberpunk" },
          ],
          default: "default",
          label: "Style",
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
    },
    {
      id: "PIXVERSE_IMAGE_TRANSITION",
      name: "Pixverse Transition (Image)",
      url: "fal-ai/pixverse/v5/transition",
      provider: "Pixverse",
      logo: PROVIDER_LOGOS.PIXVERSE,
      description: "Create transitions between images using Pixverse.",

      features: ["Image Transition", "End Frame", "Styles"],
      categories: ["pixverse"],
      cost: {
        type: "per_second",
        value: 0.32, // $0.32 per second for 1080p (in credits)
      },
      fields: [
        "endFrameImageBase64",
        "pixverseStyles",
        "prompt",
        "imageBase64",
        "negativePrompt",
        "aspectRatio",
      ],
      fieldOptions: {
        aspectRatio: {
          options: [
            { value: "16:9", label: "Landscape (16:9)" },
            { value: "4:3", label: "Standard (4:3)" },
            { value: "1:1", label: "Square (1:1)" },
            { value: "3:4", label: "Portrait (3:4)" },
            { value: "9:16", label: "Portrait (9:16)" },
          ],
          default: "16:9",
          label: "Aspect Ratio",
          userSelectable: true,
        },
        negativePrompt: {
          default: "",
          label: "Negative Prompt",
          userSelectable: true,
          placeholder: "Describe what you don't want in the video...",
          helpText:
            "Optional: Specify elements to avoid in the generated video",
        },
        pixverseStyles: {
          options: [
            { value: "default", label: "Default" },
            { value: "anime", label: "Anime" },
            { value: "3d_animation", label: "3D Animation" },
            { value: "clay", label: "Clay" },
            { value: "comic", label: "Comic" },
            { value: "cyberpunk", label: "Cyberpunk" },
          ],
          default: "default",
          label: "Style",
          userSelectable: true,
        },
      },
      capabilities: {
        supportsEndFrame: true,
        supportsTailImage: false,
        supportsAudioGeneration: false,
        promptCharacterLimit: 1500,
        negativePromptCharacterLimit: 1500,
        fixedDuration: 5,
      },
    },
    {
      id: "WAN_PRO_IMAGE",
      name: "Wan Pro (Image)",
      url: "fal-ai/wan-pro/image-to-video",
      provider: "Wan",
      logo: PROVIDER_LOGOS.WAN,
      description:
        "Open‑source 1080 p model topping VBench, delivering exceptional visual quality and motion diversity.",

      features: [],
      categories: ["wan"],
      cost: {
        type: "fixed",
        value: 0.8, // $0.80 per video (in credits)
      },
      fields: ["prompt", "imageBase64"],
      capabilities: {
        supportsEndFrame: false,
        supportsTailImage: false,
        supportsAudioGeneration: false,
        promptCharacterLimit: 1500,
        negativePromptCharacterLimit: 1500,
      },
    },

    // -------------- RUNWAYML MODELS --------------
    {
      id: "GEN4_TURBO",
      name: "Gen 4 Turbo",
      url: "gen4_turbo",
      provider: "RunwayML",
      logo: PROVIDER_LOGOS.RUNWAYML,
      description:
        "Fast and efficient video generation with RunwayML's Gen 4 Turbo model.",

      features: ["Adv Aspect Ratios", "Fast Generation"],
      categories: ["runwayml", "recommended"],
      cost: {
        type: "per_second",
        value: 0.05,
      },
      fields: ["prompt", "imageBase64", "duration", "aspectRatio"],
      fieldOptions: {
        duration: {
          options: ["5", "10"],
          default: "5",
          label: "Duration",
          userSelectable: true,
        },
        aspectRatio: {
          options: [
            { value: "1280:720", label: "HD (1280:720)" },
            { value: "720:1280", label: "HD Portrait (720:1280)" },
            { value: "1104:832", label: "1104:832" },
            { value: "832:1104", label: "832:1104" },
            { value: "960:960", label: "Square (960:960)" },
            { value: "1584:672", label: "Ultra Wide (1584:672)" },
          ],
          default: "1280:720",
          label: "Aspect Ratio",
          userSelectable: true,
        },
      },
      capabilities: {
        supportsEndFrame: false,
        supportsTailImage: false,
        supportsAudioGeneration: false,
        promptCharacterLimit: 1000,
        negativePromptCharacterLimit: 1000,
      },
    },
    {
      id: "GEN3A_TURBO",
      name: "Gen 3A Turbo",
      url: "gen3a_turbo",
      provider: "RunwayML",
      logo: PROVIDER_LOGOS.RUNWAYML,
      description:
        "Advanced video generation with RunwayML's Gen 3A Turbo model featuring high-quality output and fast processing.",

      features: ["End Frame"],
      categories: ["runwayml"],
      cost: {
        type: "per_second",
        value: 0.05,
      },
      fields: [
        "prompt",
        "imageBase64",
        "endFrameImageBase64",
        "duration",
        "aspectRatio",
      ],
      fieldOptions: {
        duration: {
          options: ["5", "10"],
          default: "5",
          label: "Duration",
          userSelectable: true,
        },
        aspectRatio: {
          options: [
            { value: "1280:768", label: "1280:768" },
            { value: "768:1280", label: "768:1280" },
          ],
          default: "1280:768",
          label: "Aspect Ratio",
          userSelectable: true,
        },
      },
      capabilities: {
        supportsEndFrame: true,
        supportsTailImage: false,
        supportsAudioGeneration: false,
        promptCharacterLimit: 1000,
        negativePromptCharacterLimit: 1000,
      },
    },
    {
      id: "HAILUO_2_3_PRO_IMAGE",
      name: "Hailuo 2.3 [Pro]",
      url: "fal-ai/minimax/hailuo-2.3/pro/image-to-video",
      provider: "Minimax",
      logo: PROVIDER_LOGOS.MINIMAX,
      description:
        "Advanced image-to-video generation model with 1080p resolution. Highest quality with optimal speed.",
      features: ["Prompt Optimizer", "1080p"],
      categories: ["minimax", "recommended"],
      cost: {
        type: "fixed",
        value: 0.49, // $0.49 per video
      },
      fields: ["prompt", "imageBase64", "promptOptimizer"],
      fieldOptions: {
        promptOptimizer: {
          default: true,
          label: "Use prompt optimizer",
          userSelectable: true,
        },
      },
      capabilities: {
        supportsEndFrame: false,
        supportsTailImage: false,
        supportsAudioGeneration: false,
        promptCharacterLimit: 1500,
        negativePromptCharacterLimit: 1500,
        fixedDuration: 6,
      },
    },
    {
      id: "HAILUO_IMAGE",
      name: "Hailuo 02 Pro (Image)",
      url: "fal-ai/minimax/hailuo-02/pro/image-to-video",
      provider: "Minimax",
      logo: PROVIDER_LOGOS.MINIMAX,
      description:
        "High-quality image-to-video generation with Hailuo 02 Pro model.",

      features: ["Prompt Optimizer", "1080p", "End Frame"],
      categories: ["minimax", "recommended"],
      cost: {
        type: "fixed",
        value: 0.48,
      },
      fields: [
        "prompt",
        "imageBase64",
        "endFrameImageBase64",
        "promptOptimizer",
      ],
      fieldOptions: {
        promptOptimizer: {
          default: true,
          label: "Use prompt optimizer",
          userSelectable: true,
        },
      },
      capabilities: {
        supportsEndFrame: true,
        supportsTailImage: false,
        supportsAudioGeneration: false,
        promptCharacterLimit: 1500,
        negativePromptCharacterLimit: 1500,
        fixedDuration: 6,
      },
    },
    {
      id: "SEEDANCE_IMAGE",
      name: "Seedance 1.0 Pro (Image)",
      url: "fal-ai/bytedance/seedance/v1/pro/image-to-video",
      provider: "ByteDance",
      logo: PROVIDER_LOGOS.BYTEDANCE,
      description:
        "High-quality image-to-video generation with ByteDance Seedance Pro model.",

      features: ["1080p", "Fast", "End Frame"],
      categories: ["bytedance", "recommended"],
      cost: {
        type: "per_second",
        value: 0.125, // 0.125 credits per second
      },
      fields: [
        "prompt",
        "imageBase64",
        "duration",
        "aspectRatio",
        "endFrameImageBase64",
        "cameraFixed",
        "seed",
      ],
      fieldOptions: {
        duration: {
          options: ["3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
          default: "12",
          label: "Duration",
          userSelectable: true,
        },
        aspectRatio: {
          options: [
            { value: "auto", label: "Auto (Best Match)" },
            { value: "21:9", label: "Ultrawide (21:9)" },
            { value: "16:9", label: "Landscape (16:9)" },
            { value: "4:3", label: "Standard (4:3)" },
            { value: "1:1", label: "Square (1:1)" },
            { value: "3:4", label: "Portrait (3:4)" },
            { value: "9:16", label: "Portrait (9:16)" },
          ],
          default: "auto",
          label: "Aspect Ratio",
          userSelectable: true,
        },
        cameraFixed: {
          default: false,
          label: "Fix camera position",
          userSelectable: true,
          helpText: "Lock camera to prevent movement",
        },
        seed: {
          default: null,
          label: "Seed",
          userSelectable: false,
          helpText: "Random seed for reproducible results",
        },
      },
      capabilities: {
        supportsEndFrame: true,
        supportsTailImage: false,
        supportsAudioGeneration: false,
        promptCharacterLimit: 1500,
        negativePromptCharacterLimit: 1500,
      },
    },
    {
      id: "BYTEDANCE_SEEDANCE_LITE_REFERENCE",
      name: "Seedance Lite Reference",
      url: "fal-ai/bytedance/seedance/v1/lite/reference-to-video",
      provider: "ByteDance",
      logo: PROVIDER_LOGOS.BYTEDANCE,
      description:
        "Use 1 to 4 images as reference to create a high-quality video.",
      features: ["Multi-Image Reference", "Camera Control", "720p"],
      categories: ["recommended", "bytedance"],
      cost: {
        type: "per_second",
        value: 0.036, // 0.036M credits per second
      },
      fields: ["prompt", "referenceImageUrls", "duration", "cameraFixed"],
      fieldOptions: {
        duration: {
          options: ["3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
          default: "5",
          label: "Duration",
          userSelectable: true,
        },
        cameraFixed: {
          default: false,
          label: "Fix camera position",
          userSelectable: true,
          helpText: "Lock camera to prevent movement",
        },
      },
      capabilities: {
        supportsEndFrame: false,
        supportsTailImage: false,
        supportsAudioGeneration: false,
        promptCharacterLimit: 1500,
        negativePromptCharacterLimit: 1500,
      },
    },
    {
      id: "SEEDANCE_LITE_IMAGE",
      name: "Seedance 1.0 Lite (Image)",
      url: "fal-ai/bytedance/seedance/v1/lite/image-to-video",
      provider: "ByteDance",
      logo: PROVIDER_LOGOS.BYTEDANCE,
      description:
        "Fast and efficient image-to-video generation with Seedance 1.0 Lite.",
      features: ["Fast", "Camera Control", "End Frame", "1080p"],
      categories: ["recommended", "bytedance"],
      cost: {
        type: "per_second",
        value: 0.036, // 0.036M credits per second
      },
      fields: [
        "prompt",
        "imageBase64",
        "duration",
        "cameraFixed",
        "endFrameImageBase64",
      ],
      fieldOptions: {
        duration: {
          options: ["3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
          default: "5",
          label: "Duration",
          userSelectable: true,
        },
        cameraFixed: {
          default: false,
          label: "Fix camera position",
          userSelectable: true,
          helpText: "Lock camera to prevent movement",
        },
      },
      capabilities: {
        supportsEndFrame: true,
        supportsTailImage: false,
        supportsAudioGeneration: false,
        promptCharacterLimit: 1500,
        negativePromptCharacterLimit: 1500,
      },
    },

    {
      id: "WAN_2_2_TURBO_IMAGE",
      name: "Wan-2.2 Turbo (Image)",
      url: "fal-ai/wan/v2.2-a14b/image-to-video/turbo",
      provider: "Wan",
      logo: PROVIDER_LOGOS.WAN,
      description:
        "High-quality videos with high visual quality and motion diversity from images.",
      features: ["Fast", "End Frame", "720p"],
      categories: ["recommended", "wan"],
      cost: {
        type: "per_second",
        value: 0.02, // $0.02 per second (in credits)
      },
      fields: ["prompt", "imageBase64", "aspectRatio", "endFrameImageBase64"],
      fieldOptions: {
        aspectRatio: {
          options: [
            { value: "16:9", label: "Landscape (16:9)" },
            { value: "9:16", label: "Portrait (9:16)" },
            { value: "1:1", label: "Square (1:1)" },
          ],
          default: "16:9",
          label: "Aspect Ratio",
          userSelectable: true,
        },
      },
      capabilities: {
        supportsEndFrame: true,
        supportsTailImage: false,
        supportsAudioGeneration: false,
        promptCharacterLimit: 1500,
        negativePromptCharacterLimit: 1500,
        fixedDuration: 5,
      },
    },
    {
      id: "LTXV_2_IMAGE",
      name: "LTX Video 2.0",
      url: "fal-ai/ltxv-2/image-to-video",
      provider: "Lightricks",
      logo: PROVIDER_LOGOS.LIGHTRICKS,
      description:
        "Create high-fidelity video with audio from images using Lightricks LTX Video 2.0.",
      features: ["Audio Generation", "2160p"],
      categories: ["lightricks"],
      cost: {
        type: "tiered",
        base_value: 0.06,
        tiers: [
          { resolution: "1080p", value: 0.06 },
          { resolution: "1440p", value: 0.12 },
          { resolution: "2160p", value: 0.24 },
        ],
      },
      fields: [
        "prompt",
        "imageBase64",
        "duration",
        "resolution",
        "aspectRatio",
      ],
      fieldOptions: {
        duration: {
          options: ["6", "8", "10"],
          default: "6",
          label: "Duration",
          userSelectable: true,
        },
        aspectRatio: {
          options: [{ value: "16:9", label: "Landscape (16:9)" }],
          default: "16:9",
          label: "Aspect Ratio",
          userSelectable: false,
        },
        resolution: {
          options: [
            { value: "1080p", label: "1080p (Full HD)" },
            { value: "1440p", label: "1440p (2K)" },
            { value: "2160p", label: "2160p (4K)" },
          ],
          default: "1080p",
          label: "Resolution",
          userSelectable: true,
        },
      },
      capabilities: {
        supportsEndFrame: false,
        supportsTailImage: false,
        supportsAudioGeneration: true,
        promptCharacterLimit: 1500,
        negativePromptCharacterLimit: 1500,
      },
    },
    {
      id: "LTXV_2_FAST_IMAGE",
      name: "LTX Video 2.0 Fast",
      url: "fal-ai/ltxv-2/image-to-video/fast",
      provider: "Lightricks",
      logo: PROVIDER_LOGOS.LIGHTRICKS,
      description:
        "Fast high-fidelity video with audio from images using Lightricks LTX Video 2.0.",
      features: ["Audio Generation", "2160p", "Fast"],
      categories: ["lightricks"],
      cost: {
        type: "tiered",
        base_value: 0.04,
        tiers: [
          { resolution: "1080p", value: 0.04 },
          { resolution: "1440p", value: 0.08 },
          { resolution: "2160p", value: 0.16 },
        ],
      },
      fields: [
        "prompt",
        "imageBase64",
        "duration",
        "resolution",
        "aspectRatio",
      ],
      fieldOptions: {
        duration: {
          options: ["6", "8", "10", "12", "14", "16", "18", "20"],
          default: "6",
          label: "Duration",
          userSelectable: true,
        },
        aspectRatio: {
          options: [{ value: "16:9", label: "Landscape (16:9)" }],
          default: "16:9",
          label: "Aspect Ratio",
          userSelectable: false,
        },
        resolution: {
          options: [
            { value: "1080p", label: "1080p (Full HD)" },
            { value: "1440p", label: "1440p (2K)" },
            { value: "2160p", label: "2160p (4K)" },
          ],
          default: "1080p",
          label: "Resolution",
          userSelectable: true,
        },
      },
      capabilities: {
        supportsEndFrame: false,
        supportsTailImage: false,
        supportsAudioGeneration: true,
        promptCharacterLimit: 1500,
        negativePromptCharacterLimit: 1500,
      },
    },
    {
      id: "BYTEDANCE_SEEDANCE_PRO_FAST_IMAGE",
      name: "Seedance 1.0 Pro Fast",
      url: "fal-ai/bytedance/seedance/v1/pro/fast/image-to-video",
      provider: "ByteDance",
      logo: PROVIDER_LOGOS.BYTEDANCE,
      description:
        "Next-generation video model designed to deliver maximum performance at minimal cost.",
      features: ["Fast", "1080p"],
      categories: ["recommended", "bytedance"],
      cost: {
        type: "per_second",
        value: 0.026, // ~$0.13 for 5s video = 0.026M credits per second
      },
      fields: [
        "prompt",
        "imageBase64",
        "duration",
        "aspectRatio",
        "resolution",
        "cameraFixed",
        "seed",
      ],
      fieldOptions: {
        duration: {
          options: ["3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
          default: "5",
          label: "Duration",
          userSelectable: true,
        },
        aspectRatio: {
          options: [
            { value: "21:9", label: "Ultrawide (21:9)" },
            { value: "16:9", label: "Landscape (16:9)" },
            { value: "4:3", label: "Standard (4:3)" },
            { value: "1:1", label: "Square (1:1)" },
            { value: "3:4", label: "Portrait (3:4)" },
            { value: "9:16", label: "Portrait (9:16)" },
          ],
          default: "21:9",
          label: "Aspect Ratio",
          userSelectable: true,
        },
        resolution: {
          options: [
            { value: "480p", label: "480p (SD)" },
            { value: "720p", label: "720p (HD)" },
            { value: "1080p", label: "1080p (Full HD)" },
          ],
          default: "1080p",
          label: "Resolution",
          userSelectable: true,
        },
        cameraFixed: {
          default: false,
          label: "Fix camera position",
          userSelectable: true,
          helpText: "Lock camera to prevent movement",
        },
        seed: {
          default: null,
          label: "Seed",
          userSelectable: false,
          helpText: "Random seed for reproducible results",
        },
      },
      capabilities: {
        supportsEndFrame: false,
        supportsTailImage: false,
        supportsAudioGeneration: false,
        promptCharacterLimit: 1500,
        negativePromptCharacterLimit: 1500,
      },
    },
    {
      id: "KLING_V2_5_TURBO_STANDARD_IMAGE",
      name: "Kling 2.5 Turbo Standard",
      url: "fal-ai/kling-video/v2.5-turbo/standard/image-to-video",
      provider: "Kling",
      logo: PROVIDER_LOGOS.KLING,
      description:
        "Top-tier image-to-video generation with unparalleled motion fluidity, cinematic visuals, and exceptional prompt precision.",
      features: ["1080p"],
      categories: ["recommended", "kling"],
      cost: {
        type: "per_second",
        value: 0.042,
      },
      fields: ["prompt", "imageBase64", "duration", "negativePrompt"],
      fieldOptions: {
        duration: {
          options: ["5", "10"],
          default: "5",
          label: "Duration",
          userSelectable: true,
        },
        negativePrompt: {
          default: "",
          label: "Negative Prompt",
          userSelectable: true,
          placeholder: "Describe what you don't want in the video...",
          helpText:
            "Optional: Specify elements to avoid in the generated video",
        },
      },
      capabilities: {
        supportsEndFrame: false,
        supportsTailImage: false,
        supportsAudioGeneration: false,
        promptCharacterLimit: 1500,
        negativePromptCharacterLimit: 1500,
      },
    },
    {
      id: "HAILUO_2_3_FAST_STANDARD_IMAGE",
      name: "Hailuo 2.3 Fast [Standard]",
      url: "fal-ai/minimax/hailuo-2.3-fast/standard/image-to-video",
      provider: "Minimax",
      logo: PROVIDER_LOGOS.MINIMAX,
      description:
        "Advanced fast image-to-video generation model with 768p resolution. Fast and efficient.",
      features: ["Fast", "Prompt Optimizer", "768p"],
      categories: ["minimax"],
      cost: {
        type: "per_second",
        value: 0.032,
      },
      fields: ["prompt", "imageBase64", "duration", "promptOptimizer"],
      fieldOptions: {
        duration: {
          options: ["6", "10"],
          default: "6",
          label: "Duration",
          userSelectable: true,
        },
        promptOptimizer: {
          default: true,
          label: "Use prompt optimizer",
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
    },
    {
      id: "HAILUO_2_3_FAST_PRO_IMAGE",
      name: "Hailuo 2.3 Fast [Pro]",
      url: "fal-ai/minimax/hailuo-2.3-fast/pro/image-to-video",
      provider: "Minimax",
      logo: PROVIDER_LOGOS.MINIMAX,
      description:
        "Advanced fast image-to-video generation model with 1080p resolution. Premium quality at high speed.",
      features: ["Fast", "Prompt Optimizer", "1080p"],
      categories: ["minimax"],
      cost: {
        type: "fixed",
        value: 0.33, // $0.33 per video
      },
      fields: ["prompt", "imageBase64", "promptOptimizer"],
      fieldOptions: {
        promptOptimizer: {
          default: true,
          label: "Use prompt optimizer",
          userSelectable: true,
        },
      },
      capabilities: {
        supportsEndFrame: false,
        supportsTailImage: false,
        supportsAudioGeneration: false,
        promptCharacterLimit: 1500,
        negativePromptCharacterLimit: 1500,
        fixedDuration: 6,
      },
    },

    {
      id: "HAILUO_2_3_STANDARD_IMAGE",
      name: "Hailuo 2.3 [Standard]",
      url: "fal-ai/minimax/hailuo-2.3/standard/image-to-video",
      provider: "Minimax",
      logo: PROVIDER_LOGOS.MINIMAX,
      description:
        "Advanced image-to-video generation model with 768p resolution. Balanced quality and speed.",
      features: ["Prompt Optimizer", "768p"],
      categories: ["minimax"],
      cost: {
        type: "per_second",
        value: 0.047,
      },
      fields: ["prompt", "imageBase64", "duration", "promptOptimizer"],
      fieldOptions: {
        duration: {
          options: ["6", "10"],
          default: "6",
          label: "Duration",
          userSelectable: true,
        },
        promptOptimizer: {
          default: true,
          label: "Use prompt optimizer",
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
    },
    {
      id: "PIKA_EFFECT_IMAGE_V22",
      name: "Pika v2.2 (Image)",
      url: "fal-ai/pika/v2.2/image-to-video",
      provider: "Pika",
      logo: PROVIDER_LOGOS.PIKA,
      description:
        "Smooth 1080p video generation with extended duration control and heightened realism.",

      features: [],
      categories: ["pika"],
      cost: {
        type: "per_second",
        value: 0.09, // $0.09 per second for 1080p (in credits)
      },
      fields: ["prompt", "negativePrompt", "imageBase64", "duration"],
      fieldOptions: {
        duration: {
          options: ["5", "10"],
          default: "5",
          label: "Duration",
          userSelectable: true,
        },
        negativePrompt: {
          default: "",
          label: "Negative Prompt",
          userSelectable: true,
          placeholder: "Describe what you don't want in the video...",
          helpText:
            "Optional: Specify elements to avoid in the generated video",
        },
      },
      capabilities: {
        supportsEndFrame: false,
        supportsTailImage: false,
        supportsAudioGeneration: false,
        promptCharacterLimit: 1500,
        negativePromptCharacterLimit: 1500,
      },
    },
    {
      id: "PIKA_EFFECT_IMAGE_TURBO_V2",
      name: "Pika Turbo v2 (Image)",
      url: "fal-ai/pika/v2/turbo/image-to-video",
      provider: "Pika",
      logo: PROVIDER_LOGOS.PIKA,
      description: "Faster (and cheaper) version of Pika v2.2.",

      features: ["Fast"],
      categories: ["pika"],
      cost: {
        type: "fixed",
        value: 0.2, // $0.2 per video (in credits)
      },
      fields: ["prompt", "negativePrompt", "imageBase64", "duration"],
      fieldOptions: {
        duration: {
          options: ["5"],
          default: "5",
          label: "Duration",
          userSelectable: false,
        },
        negativePrompt: {
          default: "",
          label: "Negative Prompt",
          userSelectable: true,
          placeholder: "Describe what you don't want in the video...",
          helpText:
            "Optional: Specify elements to avoid in the generated video",
        },
      },
      capabilities: {
        supportsEndFrame: false,
        supportsTailImage: false,
        supportsAudioGeneration: false,
        promptCharacterLimit: 1500,
        negativePromptCharacterLimit: 1500,
        fixedDuration: 5,
      },
    },
    {
      id: "PIKA_EFFECT_SCENES_V22",
      name: "Pika Scenes v2.2",
      url: "fal-ai/pika/v2.2/pikascenes",
      provider: "Pika",
      logo: PROVIDER_LOGOS.PIKA,
      description:
        "Generate videos from multiple scene images using Pika v2.2.",

      features: ["Multi-Image Input", "Scene Styles"],
      categories: ["pika"],
      cost: {
        type: "per_second",
        value: 0.09, // $0.09 per second for 1080p (in credits)
      },
      fields: [
        "prompt",
        "negativePrompt",
        "pikaScenesIngredient",
        "duration",
        "aspectRatio",
        "scenesImages",
      ],
      fieldOptions: {
        duration: {
          options: ["5", "10"],
          default: "5",
          label: "Duration",
          userSelectable: true,
        },
        aspectRatio: {
          options: [
            { value: "16:9", label: "Landscape (16:9)" },
            { value: "9:16", label: "Portrait (9:16)" },
            { value: "1:1", label: "Square (1:1)" },
            { value: "4:5", label: "Portrait (4:5)" },
            { value: "5:4", label: "Landscape (5:4)" },
            { value: "3:2", label: "Landscape (3:2)" },
            { value: "2:3", label: "Portrait (2:3)" },
          ],
          default: "16:9",
          label: "Aspect Ratio",
          userSelectable: true,
        },
        negativePrompt: {
          default: "",
          label: "Negative Prompt",
          userSelectable: true,
          placeholder: "Describe what you don't want in the video...",
          helpText:
            "Optional: Specify elements to avoid in the generated video",
        },
        pikaScenesIngredient: {
          options: [
            { value: "creative", label: "Creative" },
            { value: "precise", label: "Precise" },
          ],
          default: "creative",
          label: "Mode",
          userSelectable: true,
          helpText:
            "Creative mode for artistic results, Precise for accurate interpretation",
        },
      },
      capabilities: {
        supportsEndFrame: false,
        supportsTailImage: false,
        supportsAudioGeneration: false,
        promptCharacterLimit: 1500,
        negativePromptCharacterLimit: 1500,
      },
    },
    {
      id: "VIDU_IMAGE",
      name: "Vidu (Image)",
      url: "fal-ai/vidu/image-to-video",
      provider: "Vidu",
      logo: PROVIDER_LOGOS.VIDU,
      description: "Vidu image-to-video generation with movement control.",

      features: ["Movement Control"],
      categories: ["vidu"],
      cost: {
        type: "per_second",
        value: 0.05, // $0.05 per second for 1080p (in credits)
      },
      fields: ["prompt", "imageBase64", "movementAmplitude"],
      fieldOptions: {
        movementAmplitude: {
          options: ["auto", "low", "medium", "high"],
          default: "auto",
          label: "Movement Amplitude",
          userSelectable: true,
          helpText: "Control the intensity of motion in the video",
        },
      },
      capabilities: {
        supportsEndFrame: false,
        supportsTailImage: false,
        supportsAudioGeneration: false,
        promptCharacterLimit: 1500,
        negativePromptCharacterLimit: 1500,
      },
    },
    {
      id: "VIDU_REFERENCE",
      name: "Vidu Reference",
      url: "fal-ai/vidu/reference-to-video",
      provider: "Vidu",
      logo: PROVIDER_LOGOS.VIDU,
      description: "Generate video using reference images with Vidu.",

      features: ["Multi-Image Reference", "Movement Control"],
      categories: ["vidu"],
      cost: {
        type: "per_second",
        value: 0.1, // $0.1 per second for 1080p (in credits)
      },
      fields: ["prompt", "imageBase64", "movementAmplitude", "aspectRatio"],
      fieldOptions: {
        aspectRatio: {
          options: [
            { value: "16:9", label: "Landscape (16:9)" },
            { value: "9:16", label: "Portrait (9:16)" },
            { value: "1:1", label: "Square (1:1)" },
          ],
          default: "16:9",
          label: "Aspect Ratio",
          userSelectable: true,
        },
        movementAmplitude: {
          options: ["auto", "low", "medium", "high"],
          default: "auto",
          label: "Movement Amplitude",
          userSelectable: true,
          helpText: "Control the intensity of motion in the video",
        },
      },
      capabilities: {
        supportsEndFrame: false,
        supportsTailImage: false,
        supportsAudioGeneration: false,
        promptCharacterLimit: 1500,
        negativePromptCharacterLimit: 1500,
      },
    },
    {
      id: "VIDU_START_END",
      name: "Vidu Start-End",
      url: "fal-ai/vidu/start-end-to-video",
      provider: "Vidu",
      logo: PROVIDER_LOGOS.VIDU,
      description:
        "Create video transitions between start and end images using Vidu.",

      features: ["Image Transition", "Movement Control", "End Frame"],
      categories: ["vidu"],
      cost: {
        type: "per_second",
        value: 0.5, // $0.5 per second for 1080p (in credits)
      },
      fields: [
        "prompt",
        "imageBase64",
        "movementAmplitude",
        "endFrameImageBase64",
      ], // Added endFrame field
      fieldOptions: {
        movementAmplitude: {
          options: ["auto", "low", "medium", "high"],
          default: "auto",
          label: "Movement Amplitude",
          userSelectable: true,
          helpText: "Control the intensity of motion in the video",
        },
      },
      capabilities: {
        supportsEndFrame: true,
        supportsTailImage: false,
        supportsAudioGeneration: false,
        promptCharacterLimit: 1500,
        negativePromptCharacterLimit: 1500,
      },
    },
    {
      id: "VIDU_TEMPLATE",
      name: "Vidu Template",
      url: "fal-ai/vidu/template-to-video",
      provider: "Vidu",
      logo: PROVIDER_LOGOS.VIDU,
      description: "Generate videos using pre-defined templates with Vidu.",

      features: ["Templates", "Multi-Image Input"],
      categories: ["vidu"],
      cost: {
        type: "tiered_template",
        standard_value: 0.2,
        premium_value: 0.3,
        advanced_value: 0.5,
      },
      fields: ["prompt", "imageBase64", "template", "aspectRatio"],
      fieldOptions: {
        aspectRatio: {
          options: [
            { value: "16:9", label: "Landscape (16:9)" },
            { value: "9:16", label: "Portrait (9:16)" },
            { value: "1:1", label: "Square (1:1)" },
          ],
          default: "16:9",
          label: "Aspect Ratio",
          userSelectable: true,
        },
        template: {
          default: "hug",
          label: "Template",
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
    },
    {
      id: "VIDU_Q2_TURBO",
      name: "Vidu Q2 Turbo (Image)",
      url: "fal-ai/vidu/q2/image-to-video/turbo",
      provider: "Vidu",
      logo: PROVIDER_LOGOS.VIDU,
      description:
        "Use the latest Vidu Q2 Turbo model with much better quality and control on your videos.",
      features: ["Movement Control", "720p"],
      categories: ["vidu", "recommended"],
      cost: {
        type: "per_second",
        value: 0.05, // 0.05M credits per second
      },
      fields: [
        "prompt",
        "imageBase64",
        "duration",
        "resolution",
        "movementAmplitude",
        "seed",
      ],
    },
    {
      id: "VIDU_Q2_PRO",
      name: "Vidu Q2 Pro (Image)",
      url: "fal-ai/vidu/q2/image-to-video/pro",
      provider: "Vidu",
      logo: PROVIDER_LOGOS.VIDU,
      description:
        "Use the latest Vidu Q2 Pro model with much better quality and control on your videos.",
      features: ["Movement Control", "1080p"],
      categories: ["vidu", "recommended"],
      cost: {
        type: "per_second",
        value: 0.08, // 0.08M credits per second
      },
      fields: [
        "prompt",
        "imageBase64",
        "duration",
        "resolution",
        "movementAmplitude",
        "seed",
      ],
    },
  ],
};

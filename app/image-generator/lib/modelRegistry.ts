import runwaygen4Settings, { ModelSettings } from "./models/runwaygen4/settings";
import fluxSettings from "./models/flux/settings";

export interface Model {
  id: string;
  name: string;
  description: string;
  settings: ModelSettings;
}

export const MODEL_REGISTRY: Record<string, Model> = {
  runwaygen4: {
    id: "runwaygen4",
    name: "Runway Gen-4",
    description: "High-quality image generation with reference support",
    settings: runwaygen4Settings,
  },
  flux: {
    id: "flux",
    name: "Flux Pro",
    description: "Fast and flexible image generation",
    settings: fluxSettings,
  },
};

export const getModelById = (modelId: string): Model | undefined => {
  return MODEL_REGISTRY[modelId];
};

export const getAllModels = (): Model[] => {
  return Object.values(MODEL_REGISTRY);
};


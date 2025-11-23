"use client";

import { Label } from "../../components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../components/ui/select";
import { getAllModels } from "../lib/modelRegistry";

interface ModelSelectorProps {
  value: string;
  onChange: (modelId: string) => void;
}

/**
 * Dropdown selector for choosing image generation model
 */
export default function ModelSelector({ value, onChange }: ModelSelectorProps) {
  const models = getAllModels();

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium text-gray-900 dark:text-[#f9fbfc]">
        Model
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="rounded-[18px]">
          <SelectValue placeholder="Select a model" />
        </SelectTrigger>
        <SelectContent className="rounded-[18px]">
          {models.map((model) => (
            <SelectItem
              key={model.id}
              value={model.id}
              className="rounded-[18px]"
            >
              <div className="flex flex-col">
                <span className="font-medium">{model.name}</span>
                <span className="text-xs text-gray-500 dark:text-[#6c727a]">
                  {model.description}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}


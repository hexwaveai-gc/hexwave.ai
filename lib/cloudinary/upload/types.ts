import { z } from "zod";
import { RetryOptions } from "@/utils/retry-operation";

export const MediaTypeSchema = z.enum(["image", "video", "audio", "auto"]);
export type MediaType = z.infer<typeof MediaTypeSchema>;

export const UploadOptionsSchema = z.object({
  folder: z.string().optional().default("hexwave_uploads"),
  publicId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  resourceType: MediaTypeSchema.optional().default("auto"),
  timeout: z.number().optional().describe("Timeout in milliseconds"),
  retries: z.custom<RetryOptions>().optional(),
}).passthrough();

// The input type (what the user provides, allowing undefined for defaulted fields)
export type UploadOptions = z.input<typeof UploadOptionsSchema>;

// The output type (what the schema produces, with defaults applied)
export type ParsedUploadOptions = z.output<typeof UploadOptionsSchema>;

export interface UploadResult {
  publicId: string;
  url: string;
  secureUrl: string;
  format: string;
  width?: number;
  height?: number;
  duration?: number;
  resourceType: string;
  bytes: number;
  createdAt: string;
}

export interface UploadError {
  message: string;
  name: string;
  http_code?: number;
  [key: string]: any;
}

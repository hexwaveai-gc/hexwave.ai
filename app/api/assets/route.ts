/**
 * Assets API Route
 * 
 * GET /api/assets - Fetch user's assets (generations)
 * 
 * Query params:
 * - type: "image" | "video" | "audio" | "all"
 * - status: "completed" | "pending" | "processing" | "failed"
 * - search: string (search in prompt/title)
 * - sortBy: "createdAt" | "likes" | "views"
 * - sortOrder: "asc" | "desc"
 * - page: number
 * - limit: number
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { dbConnect } from "@/lib/db";
import { ProcessJob } from "@/app/models/ProcessJob";
import type { Asset, AssetsWithStats, AssetType } from "@/types/assets";
import type { ToolCategory } from "@/app/models/ProcessJob";

// Map tool categories to asset types
function categoryToAssetType(category: ToolCategory): AssetType {
  switch (category) {
    case "image":
      return "image";
    case "video":
    case "avatar":
      return "video";
    case "audio":
      return "audio";
    default:
      return "image";
  }
}

// Extract thumbnail from job response
function extractThumbnail(job: any): string | undefined {
  const data = job.response?.data;
  if (!data) return undefined;
  
  // Try common thumbnail fields
  return (
    data.thumbnail ||
    data.thumbnailUrl ||
    data.thumbnail_url ||
    data.preview ||
    data.previewUrl ||
    // Fallback to first image in images array
    (Array.isArray(data.images) ? data.images[0] : undefined) ||
    // Or the main URL for images
    (job.category === "image" ? extractUrl(job) : undefined)
  );
}

// Extract main URL from job response
function extractUrl(job: any): string {
  const data = job.response?.data;
  if (!data) return "";
  
  // Try common URL fields
  return (
    data.url ||
    data.videoUrl ||
    data.video_url ||
    data.audioUrl ||
    data.audio_url ||
    data.imageUrl ||
    data.image_url ||
    data.output ||
    data.outputUrl ||
    // Array responses
    (Array.isArray(data.images) ? data.images[0] : "") ||
    (Array.isArray(data.videos) ? data.videos[0] : "") ||
    (Array.isArray(data.outputs) ? data.outputs[0] : "") ||
    ""
  );
}

// Extract metadata from job
function extractMetadata(job: any): Asset["metadata"] {
  const params = job.request?.params || {};
  const data = job.response?.data || {};
  
  return {
    prompt: params.prompt || params.text || data.prompt,
    model: params.model || job.toolId,
    duration: data.duration,
    width: params.width || data.width,
    height: params.height || data.height,
    fileSize: data.fileSize || data.file_size,
    extra: {
      ...params,
      ...data,
    },
  };
}

// Transform ProcessJob to Asset
function jobToAsset(job: any): Asset {
  return {
    id: job._id.toString(),
    jobId: job.jobId,
    userId: job.userId,
    type: categoryToAssetType(job.category),
    category: job.category,
    toolId: job.toolId,
    toolName: job.toolName,
    url: extractUrl(job),
    thumbnailUrl: extractThumbnail(job),
    title: job.response?.data?.title || job.request?.params?.prompt?.substring(0, 50),
    description: job.request?.params?.prompt,
    isShared: job.metadata?.get?.("isShared") || false,
    sharedAt: job.metadata?.get?.("sharedAt"),
    likes: job.metadata?.get?.("likes") || 0,
    views: job.metadata?.get?.("views") || 0,
    metadata: extractMetadata(job),
    status: job.status,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
  };
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();

    // Parse query params
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") as AssetType | null;
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 50);

    // Build query
    const query: Record<string, unknown> = { userId };

    // Filter by type (map to categories)
    if (type && type !== "all") {
      const categoryMap: Record<string, string[]> = {
        image: ["image"],
        video: ["video", "avatar"],
        audio: ["audio"],
      };
      query.category = { $in: categoryMap[type] || [type] };
    }

    // Filter by status
    if (status) {
      query.status = status;
    } else {
      // Default to completed jobs only
      query.status = "completed";
    }

    // Search in prompt
    if (search) {
      query.$or = [
        { "request.params.prompt": { $regex: search, $options: "i" } },
        { "request.params.text": { $regex: search, $options: "i" } },
        { toolName: { $regex: search, $options: "i" } },
      ];
    }

    // Build sort
    const sortField = sortBy === "likes" 
      ? "metadata.likes" 
      : sortBy === "views" 
        ? "metadata.views" 
        : "createdAt";
    const sort: Record<string, 1 | -1> = { 
      [sortField]: sortOrder === "asc" ? 1 : -1 
    };

    // Execute query with pagination
    const skip = (page - 1) * limit;
    
    const [jobs, total, imageCount, videoCount, audioCount, sharedCount] = await Promise.all([
      ProcessJob.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      ProcessJob.countDocuments(query),
      ProcessJob.countDocuments({ userId, category: "image", status: "completed" }),
      ProcessJob.countDocuments({ userId, category: { $in: ["video", "avatar"] }, status: "completed" }),
      ProcessJob.countDocuments({ userId, category: "audio", status: "completed" }),
      ProcessJob.countDocuments({ userId, status: "completed", "metadata.isShared": true }),
    ]);

    // Transform jobs to assets
    const assets = jobs.map(jobToAsset);

    // Calculate stats
    const stats = {
      totalImages: imageCount,
      totalVideos: videoCount,
      totalAudio: audioCount,
      totalShared: sharedCount,
      totalLikes: 0, // Would need aggregation
      totalViews: 0, // Would need aggregation
    };

    const response: AssetsWithStats = {
      assets,
      stats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[Assets API Error]:", error);
    return NextResponse.json(
      { error: "Failed to fetch assets" },
      { status: 500 }
    );
  }
}


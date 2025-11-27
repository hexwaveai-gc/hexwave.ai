/**
 * Library API Route
 * 
 * GET /api/assets/library - Fetch shared assets from other users
 * 
 * Query params:
 * - type: "image" | "video" | "audio" | "all"
 * - search: string
 * - sortBy: "createdAt" | "likes" | "views"
 * - sortOrder: "asc" | "desc"
 * - trending: boolean
 * - authorId: string (filter by specific user)
 * - page: number
 * - limit: number
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { dbConnect } from "@/lib/db";
import { ProcessJob } from "@/app/models/ProcessJob";
import type { Asset, AssetsResponse, AssetType } from "@/types/assets";
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
  
  return (
    data.thumbnail ||
    data.thumbnailUrl ||
    data.thumbnail_url ||
    data.preview ||
    data.previewUrl ||
    (Array.isArray(data.images) ? data.images[0] : undefined) ||
    (job.category === "image" ? extractUrl(job) : undefined)
  );
}

// Extract main URL from job response
function extractUrl(job: any): string {
  const data = job.response?.data;
  if (!data) return "";
  
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
  };
}

// Transform ProcessJob to Asset with author info
async function jobToAssetWithAuthor(job: any, usersMap: Map<string, any>): Promise<Asset> {
  const user = usersMap.get(job.userId);
  
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
    title: job.metadata?.get?.("shareTitle") || job.response?.data?.title || job.request?.params?.prompt?.substring(0, 50),
    description: job.metadata?.get?.("shareDescription") || job.request?.params?.prompt,
    isShared: true,
    sharedAt: job.metadata?.get?.("sharedAt"),
    likes: job.metadata?.get?.("likes") || 0,
    views: job.metadata?.get?.("views") || 0,
    metadata: extractMetadata(job),
    author: user ? {
      userId: job.userId,
      name: user.firstName 
        ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`
        : user.username || "Anonymous",
      avatar: user.imageUrl,
      verified: false,
    } : {
      userId: job.userId,
      name: "Anonymous",
      verified: false,
    },
    status: job.status,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
  };
}

export async function GET(request: NextRequest) {
  try {
    // Auth is optional for library - but we might use it to exclude own assets
    const { userId } = await auth();

    await dbConnect();

    // Parse query params
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") as AssetType | null;
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const trending = searchParams.get("trending") === "true";
    const authorId = searchParams.get("authorId");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 50);

    // Build query - only shared, completed assets
    const query: Record<string, unknown> = {
      status: "completed",
      "metadata.isShared": true,
    };

    // Optionally exclude current user's assets from library
    if (userId && !authorId) {
      query.userId = { $ne: userId };
    }

    // Filter by specific author
    if (authorId) {
      query.userId = authorId;
    }

    // Filter by type
    if (type && type !== "all") {
      const categoryMap: Record<string, string[]> = {
        image: ["image"],
        video: ["video", "avatar"],
        audio: ["audio"],
      };
      query.category = { $in: categoryMap[type] || [type] };
    }

    // Search in prompt/title
    if (search) {
      query.$or = [
        { "request.params.prompt": { $regex: search, $options: "i" } },
        { "request.params.text": { $regex: search, $options: "i" } },
        { "metadata.shareTitle": { $regex: search, $options: "i" } },
        { toolName: { $regex: search, $options: "i" } },
      ];
    }

    // Build sort
    let sort: Record<string, 1 | -1>;
    if (trending) {
      // Trending: sort by likes + views + recency
      sort = { 
        "metadata.likes": -1, 
        "metadata.views": -1, 
        "metadata.sharedAt": -1 
      };
    } else {
      const sortField = sortBy === "likes" 
        ? "metadata.likes" 
        : sortBy === "views" 
          ? "metadata.views" 
          : "metadata.sharedAt";
      sort = { [sortField]: sortOrder === "asc" ? 1 : -1 };
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    
    const [jobs, total] = await Promise.all([
      ProcessJob.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      ProcessJob.countDocuments(query),
    ]);

    // Get unique user IDs and fetch user info
    const userIds = [...new Set(jobs.map((job: any) => job.userId))];
    const usersMap = new Map<string, any>();
    
    if (userIds.length > 0) {
      try {
        const client = await clerkClient();
        const usersResponse = await client.users.getUserList({
          userId: userIds,
          limit: userIds.length,
        });
        
        usersResponse.data.forEach((user) => {
          usersMap.set(user.id, user);
        });
      } catch (error) {
        console.error("[Library API] Failed to fetch users:", error);
        // Continue without user info
      }
    }

    // Transform jobs to assets with author info
    const assets = await Promise.all(
      jobs.map((job) => jobToAssetWithAuthor(job, usersMap))
    );

    const response: AssetsResponse = {
      assets,
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
    console.error("[Library API Error]:", error);
    return NextResponse.json(
      { error: "Failed to fetch library" },
      { status: 500 }
    );
  }
}


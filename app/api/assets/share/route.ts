/**
 * Share Asset API Route
 * 
 * POST /api/assets/share - Share an asset to the library
 * DELETE /api/assets/share - Unshare an asset from the library
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { dbConnect } from "@/lib/db";
import { ProcessJob } from "@/app/models/ProcessJob";
import type { ShareAssetResponse, UnshareAssetResponse } from "@/types/assets";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();

    const body = await request.json();
    const { jobId, title, description } = body;

    if (!jobId) {
      return NextResponse.json(
        { error: "Job ID is required" },
        { status: 400 }
      );
    }

    // Find the job and verify ownership
    const job = await ProcessJob.findOne({ jobId, userId });

    if (!job) {
      return NextResponse.json(
        { error: "Asset not found or unauthorized" },
        { status: 404 }
      );
    }

    // Only allow sharing completed jobs
    if (job.status !== "completed") {
      return NextResponse.json(
        { error: "Only completed generations can be shared" },
        { status: 400 }
      );
    }

    // Check if already shared
    if (job.metadata?.get("isShared")) {
      return NextResponse.json(
        { error: "Asset is already shared" },
        { status: 400 }
      );
    }

    // Update job metadata to mark as shared
    if (!job.metadata) {
      job.metadata = new Map();
    }
    
    job.metadata.set("isShared", true);
    job.metadata.set("sharedAt", new Date());
    job.metadata.set("likes", 0);
    job.metadata.set("views", 0);
    
    if (title) {
      job.metadata.set("shareTitle", title);
    }
    if (description) {
      job.metadata.set("shareDescription", description);
    }

    await job.save();

    const response: ShareAssetResponse = {
      success: true,
      asset: {
        id: job._id.toString(),
        jobId: job.jobId,
        userId: job.userId,
        type: job.category === "audio" ? "audio" : job.category === "video" || job.category === "avatar" ? "video" : "image",
        category: job.category,
        toolId: job.toolId,
        toolName: job.toolName,
        url: "",
        isShared: true,
        sharedAt: new Date(),
        likes: 0,
        views: 0,
        metadata: {},
        status: job.status,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[Share API Error]:", error);
    return NextResponse.json(
      { error: "Failed to share asset" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");

    if (!jobId) {
      return NextResponse.json(
        { error: "Job ID is required" },
        { status: 400 }
      );
    }

    // Find the job and verify ownership
    const job = await ProcessJob.findOne({ jobId, userId });

    if (!job) {
      return NextResponse.json(
        { error: "Asset not found or unauthorized" },
        { status: 404 }
      );
    }

    // Check if shared
    if (!job.metadata?.get("isShared")) {
      return NextResponse.json(
        { error: "Asset is not shared" },
        { status: 400 }
      );
    }

    // Update job metadata to unshare
    job.metadata.set("isShared", false);
    job.metadata.delete("sharedAt");
    job.metadata.delete("shareTitle");
    job.metadata.delete("shareDescription");

    await job.save();

    const response: UnshareAssetResponse = {
      success: true,
      message: "Asset unshared successfully",
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[Unshare API Error]:", error);
    return NextResponse.json(
      { error: "Failed to unshare asset" },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Task from "@/app/models/Task/task.model";

// GET - Get single task
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await params;
    const task = await Task.findById(id).lean();

    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: task._id.toString(),
      title: task.title,
      status: task.status,
      priority: task.priority,
      createdAt: task.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Error fetching task:", error);
    return NextResponse.json(
      { error: "Failed to fetch task" },
      { status: 500 }
    );
  }
}

// PATCH - Update task
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await params;
    const body = await request.json();

    // Simulate random failure for demo (10% chance)
    if (Math.random() < 0.1) {
      return NextResponse.json(
        { error: "Random server error for demo" },
        { status: 500 }
      );
    }

    // Build update object (only allow specific fields)
    const update: Record<string, string> = {};
    if (body.title !== undefined) update.title = body.title;
    if (body.status !== undefined) update.status = body.status;
    if (body.priority !== undefined) update.priority = body.priority;

    const task = await Task.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true, runValidators: true }
    ).lean();

    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: task._id.toString(),
      title: task.title,
      status: task.status,
      priority: task.priority,
      createdAt: task.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

// DELETE - Delete task
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await params;
    const task = await Task.findByIdAndDelete(id).lean();

    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: task._id.toString(),
      title: task.title,
      status: task.status,
      priority: task.priority,
      createdAt: task.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}

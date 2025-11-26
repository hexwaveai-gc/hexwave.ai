import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Task from "@/app/models/Task/task.model";

// Seed initial data if collection is empty
async function seedIfEmpty() {
  const count = await Task.countDocuments();
  if (count === 0) {
    await Task.insertMany([
      { title: "Learn TanStack Query", status: "completed", priority: "high" },
      { title: "Build awesome features", status: "in_progress", priority: "high" },
      { title: "Write documentation", status: "pending", priority: "medium" },
      { title: "Code review", status: "pending", priority: "low" },
      { title: "Deploy to production", status: "pending", priority: "high" },
    ]);
  }
}

// GET - List tasks with optional filters
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    await seedIfEmpty();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Build query
    const query: Record<string, string> = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;

    // Get total count for pagination
    const total = await Task.countDocuments(query);

    // Get paginated results
    const skip = (page - 1) * limit;
    const tasks = await Task.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Transform _id to id for frontend compatibility
    const transformedTasks = tasks.map((task) => ({
      id: task._id.toString(),
      title: task.title,
      status: task.status,
      priority: task.priority,
      createdAt: task.createdAt.toISOString(),
    }));

    return NextResponse.json({
      tasks: transformedTasks,
      total,
      page,
      limit,
      hasMore: skip + limit < total,
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

// POST - Create a new task
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();

    // Validation
    if (!body.title || body.title.trim() === "") {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const newTask = await Task.create({
      title: body.title.trim(),
      status: body.status || "pending",
      priority: body.priority || "medium",
    });

    return NextResponse.json(
      {
        id: newTask._id.toString(),
        title: newTask.title,
        status: newTask.status,
        priority: newTask.priority,
        createdAt: newTask.createdAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}

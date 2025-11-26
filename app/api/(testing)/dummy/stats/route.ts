import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Task from "@/app/models/Task/task.model";

// GET - Get task statistics
export async function GET() {
  try {
    await dbConnect();

    // Aggregate stats in a single query
    const [stats] = await Task.aggregate([
      {
        $facet: {
          total: [{ $count: "count" }],
          byStatus: [
            {
              $group: {
                _id: "$status",
                count: { $sum: 1 },
              },
            },
          ],
          byPriority: [
            {
              $group: {
                _id: "$priority",
                count: { $sum: 1 },
              },
            },
          ],
        },
      },
    ]);

    // Transform aggregation results
    const total = stats.total[0]?.count ?? 0;
    
    const statusCounts = stats.byStatus.reduce(
      (acc: Record<string, number>, item: { _id: string; count: number }) => {
        acc[item._id] = item.count;
        return acc;
      },
      {}
    );

    const priorityCounts = stats.byPriority.reduce(
      (acc: Record<string, number>, item: { _id: string; count: number }) => {
        acc[item._id] = item.count;
        return acc;
      },
      {}
    );

    return NextResponse.json({
      total,
      completed: statusCounts.completed ?? 0,
      inProgress: statusCounts.in_progress ?? 0,
      pending: statusCounts.pending ?? 0,
      byPriority: {
        high: priorityCounts.high ?? 0,
        medium: priorityCounts.medium ?? 0,
        low: priorityCounts.low ?? 0,
      },
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}

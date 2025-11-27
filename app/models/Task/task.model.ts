/**
 * Task Model - Demo/Example for TanStack Query
 * 
 * This model is used for the TanStack Query example page.
 */

import { Document, Model } from "mongoose";
import * as Mongoose from "mongoose";

const taskSchema = new Mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed"],
      default: "pending",
      index: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "demo_tasks",
  }
);

// Indexes for common queries
taskSchema.index({ status: 1, priority: 1 });
taskSchema.index({ createdAt: -1 });

export interface ITask {
  _id: string;
  title: string;
  status: "pending" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
  createdAt: Date;
  updatedAt: Date;
}

interface ITaskDocument extends ITask, Omit<Document, "_id"> {
  _id: string;
}

type ITaskModel = Model<ITaskDocument>;

const Task: ITaskModel =
  Mongoose.models?.demo_tasks ||
  Mongoose.model<ITaskDocument>("demo_tasks", taskSchema);

export default Task;






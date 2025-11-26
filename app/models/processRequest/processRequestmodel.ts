import mongoose, { Schema, Document } from 'mongoose';
import type { ToolCategory } from '@/lib/credits/types';

// Define the status types for better type safety
export type ProcessStatus = 'processing' | 'completed' | 'failed';

// Interface for the ProcessRequest document
export interface IProcessRequest extends Document {
  processId: string;
  userId: string;
  status: ProcessStatus;
  data?: any;
  
  // Credit tracking fields
  creditsUsed: number;
  category: ToolCategory | null;
  toolName: string | null;
  
  createdAt: Date;
  updatedAt: Date;
}

// Create the schema
const ProcessRequestSchema = new Schema<IProcessRequest>(
  {
    processId: {
      type: String,
      required: true,
      unique: true,
      index: true, // Index for faster queries
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['processing', 'completed', 'failed'],
      required: true,
      default: 'processing',
    },
    // Store the data in form req & res of api call
    data: {
      type: Schema.Types.Mixed, // Allows for dynamic data structure
      required: false,
    },
    // Credit tracking fields
    creditsUsed: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    category: {
      type: String,
      enum: ['image', 'video', null],
      default: null,
    },
    toolName: {
      type: String,
      trim: true,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now, 
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
  }
);

// Compound indexes for better query performance
ProcessRequestSchema.index({ userId: 1, status: 1 });
ProcessRequestSchema.index({ userId: 1, createdAt: -1 });
ProcessRequestSchema.index({ processId: 1, userId: 1 });

// Create the model
const ProcessRequest = mongoose.models.request_processing || 
  mongoose.model<IProcessRequest>('request_processing', ProcessRequestSchema);

export default ProcessRequest;
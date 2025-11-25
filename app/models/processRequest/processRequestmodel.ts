import mongoose, { Schema, Document } from 'mongoose';

// Define the status types for better type safety
export type ProcessStatus = 'processing' | 'completed' | 'failed';

// Interface for the ProcessRequest document
export interface IProcessRequest extends Document {
  processId: string;
  status: ProcessStatus;
  data?: any;
  createdAt: Date;
}

// Create the schema
const ProcessRequestSchema = new Schema<IProcessRequest>(
  {
    processId: {
      type: String,
      required: true,
      index: true, // Index for faster queries
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
    createdAt: {
      type: Date,
      default: Date.now, 
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
  }
);
 

// Create the model
const ProcessRequest = mongoose.models.request_processing || 
  mongoose.model<IProcessRequest>('request_processing', ProcessRequestSchema);

export default ProcessRequest;
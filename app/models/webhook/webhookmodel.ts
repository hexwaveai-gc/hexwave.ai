import mongoose, { Model } from 'mongoose';

interface WebhookProcessingType {
  webhookId: string;
  processedAt: Date;
}

const webhookProcessingSchema = new mongoose.Schema({
  webhookId: {
    type: String,
    required: true,
    unique: true,
  },
  processedAt: {
    type: Date,
    default: Date.now,
  },
});

// Add TTL index to automatically delete old records after 24 hours
webhookProcessingSchema.index({ processedAt: 1 }, { expireAfterSeconds: 86400 });

const WebhookProcessing: Model<WebhookProcessingType> = mongoose.models.webhook_processing || mongoose.model<WebhookProcessingType>('webhook_processing', webhookProcessingSchema);

export default WebhookProcessing; 
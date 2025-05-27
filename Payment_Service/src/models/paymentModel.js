import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    order_id: {
      type: String,
      required: true,
      index: true,
    },
    payment_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    merchant_id: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['completed', 'pending', 'canceled', 'failed'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0.01, 'Amount must be positive'],
    },
    currency: {
      type: String,
      default: 'LKR',
      enum: ['LKR', 'USD', 'GBP', 'EUR', 'AUD'],  // Currencies compatible with PayHere
    },
    customer_email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
  },
  {
    timestamps: true,
  }
);

paymentSchema.index({ order_id: 1 });
paymentSchema.index({ payment_id: 1 });

export default mongoose.model('Payment', paymentSchema);
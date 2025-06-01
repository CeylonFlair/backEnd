import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    providerId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    listingId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Listing' },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'],
      default: 'pending'
    },
    bookingDate: { type: Date, required: true },
    price: { type: Number, required: true },
    notes: { type: String },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    }
  },
  { timestamps: true }
);

export default mongoose.model('Order', orderSchema);
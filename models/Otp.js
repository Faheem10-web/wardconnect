import mongoose from 'mongoose';

const OtpSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300,
  },
});

export default mongoose.models.Otp || mongoose.model('Otp', OtpSchema);

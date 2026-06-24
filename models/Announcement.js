import mongoose from 'mongoose';

const AnnouncementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide an announcement title'],
    trim: true,
  },
  content: {
    type: String,
    required: [true, 'Please provide announcement content'],
  },
  type: {
    type: String,
    enum: ['general', 'emergency', 'project'],
    default: 'general',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Announcement || mongoose.model('Announcement', AnnouncementSchema);

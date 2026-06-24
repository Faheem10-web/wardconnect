import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide an event title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide an event description'],
  },
  date: {
    type: Date,
    required: [true, 'Please specify the event date'],
  },
  location: {
    type: String,
    required: [true, 'Please specify the event location'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Event || mongoose.model('Event', EventSchema);

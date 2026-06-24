import mongoose from 'mongoose';

const PublicUpdateSchema = new mongoose.Schema({
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const ComplaintSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your full name'],
  },
  email: {
    type: String,
    default: '',
  },
  phone: {
    type: String,
    default: '',
  },
  title: {
    type: String,
    required: [true, 'Please provide a complaint title'],
  },
  description: {
    type: String,
    required: [true, 'Please provide a detailed description'],
  },
  category: {
    type: String,
    required: [true, 'Please specify a category'],
    enum: [
      'Road Damage',
      'Street Light',
      'Water Supply',
      'Garbage',
      'Drainage',
      'Public Safety',
      'Other'
    ],
  },
  image: {
    type: String,
    default: '',
  },
  location: {
    type: String,
    required: [true, 'Please specify the complaint location'],
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed'],
    default: 'Pending',
  },
  detailedStatus: {
    type: String,
    enum: ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Closed'],
    default: 'Submitted',
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium',
  },
  assignee: {
    type: String,
    default: '',
  },
  adminNotes: {
    type: String,
    default: '',
  },
  resolutionNotes: {
    type: String,
    default: '',
  },
  afterImage: {
    type: String,
    default: '',
  },
  publicUpdates: [PublicUpdateSchema],
  resolutionImage: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Complaint || mongoose.model('Complaint', ComplaintSchema);

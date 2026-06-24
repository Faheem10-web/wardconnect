import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: function () {
      return this.role === 'admin' || this.role === 'citizen';
    },
  },
  phone: {
    type: String,
    required: [true, 'Please provide a phone number'],
  },
  image: {
    type: String,
    default: '',
  },
  role: {
    type: String,
    enum: ['admin', 'citizen', 'ward_member', 'staff', 'super_admin'],
    default: 'citizen',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);

import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  isLocationSharingEnabled: boolean;
  lastLocation?: {
    latitude: number;
    longitude: number;
    address: string;
    updatedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  isLocationSharingEnabled: {
    type: Boolean,
    default: false,
  },
  lastLocation: {
    latitude: Number,
    longitude: Number,
    address: String,
    updatedAt: Date,
  },
}, {
  timestamps: true,
});

// Prevent re-compilation
export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

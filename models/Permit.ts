import mongoose, { Document, Schema } from 'mongoose';

export interface IPermit extends Document {
  _id: string;
  userId: mongoose.Types.ObjectId | string;
  woNumber: string;
  wpNumber: string;
  name: string;
  designation: string;
  plant: string;
  workNature: string;
  estimatedDays: number;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  adminComments?: string;
  approvedBy?: string;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PermitSchema = new Schema<IPermit>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  woNumber: {
    type: String,
    required: [true, 'WO Number is required'],
  },
  wpNumber: {
    type: String,
    required: [true, 'WP Number is required'],
    unique: true,
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
  },
  designation: {
    type: String,
    required: [true, 'Designation is required'],
  },
  plant: {
    type: String,
    required: [true, 'Plant information is required'],
  },
  workNature: {
    type: String,
    required: [true, 'Work nature is required'],
  },
  estimatedDays: {
    type: Number,
    required: [true, 'Estimated days is required'],
    min: 1,
  },
  location: {
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  adminComments: String,
  approvedBy: String,
  approvedAt: Date,
}, {
  timestamps: true,
});

export default mongoose.models.Permit || mongoose.model<IPermit>('Permit', PermitSchema);

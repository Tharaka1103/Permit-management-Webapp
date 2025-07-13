import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { verifyToken, extractTokenFromRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const token = extractTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    const body = await request.json();
    const { enabled } = body;

    if (typeof enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'Enabled field must be a boolean' },
        { status: 400 }
      );
    }

    // Update user's location sharing preference
    const user = await User.findByIdAndUpdate(
      decoded.userId,
      { isLocationSharingEnabled: enabled },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: enabled 
        ? 'Location sharing enabled' 
        : 'Location sharing disabled',
      isLocationSharingEnabled: user.isLocationSharingEnabled,
    });

  } catch (error) {
    console.error('Toggle location sharing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

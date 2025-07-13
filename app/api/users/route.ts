import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { verifyToken, extractTokenFromRequest } from '@/lib/auth';

// GET - Fetch users with location data (admin only)
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const token = extractTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const withLocation = searchParams.get('withLocation') === 'true';

    let query = { role: 'user' };
    if (withLocation) {
      query = { ...query, lastLocation: { $exists: true } } as any;
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ lastLocation: -1 });

    return NextResponse.json({ users });

  } catch (error) {
    console.error('Fetch users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

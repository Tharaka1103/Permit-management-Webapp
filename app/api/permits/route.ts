import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Permit from '@/models/Permit';
import User from '@/models/User';
import { verifyToken, extractTokenFromRequest } from '@/lib/auth';

// GET - Fetch permits (admin gets all, user gets their own)
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const token = extractTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    let query = {};
    if (decoded.role === 'user') {
      query = { userId: decoded.userId };
    }

    const permits = await Permit.find(query)
      .populate({
        path: 'userId',
        select: 'name email isLocationSharingEnabled lastLocation',
        model: 'User'
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);



    const total = await Permit.countDocuments(query);

    return NextResponse.json({
      permits,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: permits.length,
        totalItems: total,
      },
    });

  } catch (error) {
    console.error('Fetch permits error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new permit
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const token = extractTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    const body = await request.json();

    const {
      woNumber,
      wpNumber,
      name,
      designation,
      plant,
      workNature,
      estimatedDays,
      location,
    } = body;

    // Validation
    if (!woNumber || !wpNumber || !name || !designation || !plant || !workNature || !estimatedDays || !location) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (!location.latitude || !location.longitude) {
      return NextResponse.json(
        { error: 'Location coordinates are required' },
        { status: 400 }
      );
    }

    // Check if WP number already exists
    const existingPermit = await Permit.findOne({ wpNumber });
    if (existingPermit) {
      return NextResponse.json(
        { error: 'WP Number already exists' },
        { status: 409 }
      );
    }

    // Create new permit
    const permit = new Permit({
      userId: decoded.userId,
      woNumber,
      wpNumber,
      name,
      designation,
      plant,
      workNature,
      estimatedDays: parseInt(estimatedDays),
      location,
    });

    await permit.save();

    // Update user's last location
    await User.findByIdAndUpdate(decoded.userId, {
      lastLocation: {
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: 'Permit submitted successfully',
      permit,
    }, { status: 201 });

  } catch (error) {
    console.error('Create permit error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

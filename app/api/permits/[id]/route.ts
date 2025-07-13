import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Permit from '@/models/Permit';
import { verifyToken, extractTokenFromRequest } from '@/lib/auth';

// GET - Fetch single permit
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const token = extractTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    
    if (!id) {
      return NextResponse.json({ error: 'Invalid permit ID' }, { status: 400 });
    }

    let query: any = { _id: id };
    if (decoded.role === 'user') {
      query.userId = decoded.userId;
    }

    const permit = await Permit.findOne(query).populate('userId', 'name email isLocationSharingEnabled lastLocation');
    
    if (!permit) {
      return NextResponse.json(
        { error: 'Permit not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ permit });

  } catch (error) {
    console.error('Fetch permit error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update permit (admin only)
export async function PUT(request: NextRequest) {
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

    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    
    if (!id) {
      return NextResponse.json({ error: 'Invalid permit ID' }, { status: 400 });
    }
    
    const body = await request.json();
    const { status, adminComments } = body;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (adminComments !== undefined) updateData.adminComments = adminComments;
    
    if (status === 'approved') {
      updateData.approvedBy = decoded.userId;
      updateData.approvedAt = new Date();
    }

    const permit = await Permit.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('userId', 'name email isLocationSharingEnabled lastLocation');

    if (!permit) {
      return NextResponse.json(
        { error: 'Permit not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Permit updated successfully',
      permit,
    });

  } catch (error) {
    console.error('Update permit error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete permit (admin only)
export async function DELETE(request: NextRequest) {
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

    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    
    if (!id) {
      return NextResponse.json({ error: 'Invalid permit ID' }, { status: 400 });
    }

    const permit = await Permit.findByIdAndDelete(id);

    if (!permit) {
      return NextResponse.json(
        { error: 'Permit not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Permit deleted successfully',
    });

  } catch (error) {
    console.error('Delete permit error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

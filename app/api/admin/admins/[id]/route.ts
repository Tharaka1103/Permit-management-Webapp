import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { verifyToken, extractTokenFromRequest, hashPassword } from '@/lib/auth';
import { extractAndValidateId } from '@/lib/api-utils';

// GET - Fetch single admin (admin only)
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

    const { id, isValid } = extractAndValidateId(request);
    if (!id || !isValid) {
      return NextResponse.json({ error: 'Invalid admin ID' }, { status: 400 });
    }

    const admin = await User.findOne({ _id: id, role: 'admin' }).select('-password');
    
    if (!admin) {
      return NextResponse.json(
        { error: 'Admin not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ admin });

  } catch (error) {
    console.error('Fetch admin error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update admin (admin only)
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
      return NextResponse.json({ error: 'Invalid admin ID' }, { status: 400 });
    }
    
    const body = await request.json();
    const { name, email, password } = body;

    // Validation
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Check if email is already taken by another user
    const existingUser = await User.findOne({ 
      email: email.toLowerCase(), 
      _id: { $ne: id } 
    });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email is already taken by another user' },
        { status: 409 }
      );
    }

    const updateData: any = {
      name,
      email: email.toLowerCase(),
    };

    // If password is provided, hash it
    if (password) {
      if (password.length < 6) {
        return NextResponse.json(
          { error: 'Password must be at least 6 characters long' },
          { status: 400 }
        );
      }
      updateData.password = await hashPassword(password);
    }

    const admin = await User.findOneAndUpdate(
      { _id: id, role: 'admin' },
      updateData,
      { new: true }
    ).select('-password');

    if (!admin) {
      return NextResponse.json(
        { error: 'Admin not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Admin updated successfully',
      admin,
    });

  } catch (error) {
    console.error('Update admin error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete admin (admin only)
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
      return NextResponse.json({ error: 'Invalid admin ID' }, { status: 400 });
    }

    // Prevent admin from deleting themselves
    if (decoded.userId === id) {
      return NextResponse.json(
        { error: 'You cannot delete your own account' },
        { status: 400 }
      );
    }

    // Check if it's the last admin
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount <= 1) {
      return NextResponse.json(
        { error: 'Cannot delete the last admin. At least one admin must exist.' },
        { status: 400 }
      );
    }

    const admin = await User.findOneAndDelete({ _id: id, role: 'admin' });

    if (!admin) {
      return NextResponse.json(
        { error: 'Admin not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Admin deleted successfully',
    });

  } catch (error) {
    console.error('Delete admin error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

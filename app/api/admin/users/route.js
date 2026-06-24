import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'wardconnect_jwt_secret_token_2026_super_secure_key';

export async function GET() {
  try {
    await dbConnect();

    // Verify admin token
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (!decoded || decoded.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
      }
    } catch (e) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
    }

    // Fetch registered users (all roles so admin can manage them)
    const users = await User.find({})
      .select('name email phone role createdAt')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, users });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await dbConnect();

    // Verify admin token
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'super_admin')) {
        return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
      }
    } catch (e) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
    }

    const { userId, role } = await req.json();
    if (!userId || !role) {
      return NextResponse.json({ error: 'Missing userId or role' }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    user.role = role;
    await user.save();

    return NextResponse.json({ success: true, user: { id: user._id, name: user.name, role: user.role } });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

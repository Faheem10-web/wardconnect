import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import Announcement from '@/models/Announcement';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'wardconnect_jwt_secret_token_2026_super_secure_key';

async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  if (!token) return false;
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded && decoded.role === 'admin';
  } catch (e) {
    return false;
  }
}

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    const query = {};
    if (type && type !== 'All') {
      query.type = type;
    }

    const announcements = await Announcement.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, announcements });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ success: false, error: 'Unauthorized access' }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();
    const { title, content, type } = body;

    if (!title || !content) {
      return NextResponse.json({ success: false, error: 'Title and content are required' }, { status: 400 });
    }

    const newAnnouncement = await Announcement.create({
      title,
      content,
      type: type || 'general',
      createdAt: new Date()
    });

    return NextResponse.json({ success: true, announcement: newAnnouncement }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

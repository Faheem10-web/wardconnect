import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import Event from '@/models/Event';

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

export async function GET() {
  try {
    await dbConnect();
    const events = await Event.find({}).sort({ date: 1 });
    return NextResponse.json({ success: true, events });
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
    const { title, description, date, location } = body;

    if (!title || !description || !date || !location) {
      return NextResponse.json({ success: false, error: 'All fields (title, description, date, location) are required.' }, { status: 400 });
    }

    const newEvent = await Event.create({
      title,
      description,
      date: new Date(date),
      location,
      createdAt: new Date()
    });

    return NextResponse.json({ success: true, event: newEvent }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

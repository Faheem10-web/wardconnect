import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import Complaint from '@/models/Complaint';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'wardconnect_jwt_secret_token_2026_super_secure_key';

async function getRequesterRole() {
  // 1. Check Admin Cookie Session
  const cookieStore = await cookies();
  const adminToken = cookieStore.get('admin_token')?.value;
  if (adminToken) {
    try {
      const decoded = jwt.verify(adminToken, JWT_SECRET);
      if (decoded && decoded.role === 'admin') {
        return { role: 'admin' };
      }
    } catch (e) {
      // ignore token validation errors
    }
  }

  // 2. Check NextAuth Citizen Session
  const session = await getServerSession(authOptions);
  if (session?.user) {
    return { role: 'citizen', email: session.user.email };
  }

  return { role: 'public' };
}

export async function GET(req) {
  try {
    await dbConnect();
    const requester = await getRequesterRole();
    const { searchParams } = new URL(req.url);

    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const phone = searchParams.get('phone');
    const emailParam = searchParams.get('email');
    const search = searchParams.get('search');

    const query = {};

    if (category && category !== 'All') {
      query.category = category;
    }
    if (status && status !== 'All') {
      query.status = status;
    }

    let projection = {};

    if (requester.role === 'admin') {
      // Admins see all details
      if (phone) {
        query.phone = phone;
      }
      if (emailParam) {
        query.email = emailParam.toLowerCase();
      }
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { name: { $regex: search, $options: 'i' } },
        ];
      }
    } else if (requester.role === 'citizen') {
      // Citizens can only query their own complaints
      query.email = requester.email.toLowerCase();
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ];
      }
    } else {
      // Public / Unauthenticated visitors:
      // Return only status to calculate statistics; hides all user names, emails, phones, and issue details.
      projection = { status: 1 };
    }

    const complaints = await Complaint.find(query, projection).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, complaints });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();

    // Secure submission: verify NextAuth citizen session
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized access. Please log in.' }, { status: 401 });
    }

    const data = await req.json();
    const { title, description, category, location, image } = data;

    // Securely pull contact info from session
    const name = session.user.name;
    const email = session.user.email;
    const phone = session.user.phone;

    if (!name || !title || !description || !category || !location || !phone) {
      return NextResponse.json({ success: false, error: 'Missing required fields (including user mobile number)' }, { status: 400 });
    }

    const complaint = await Complaint.create({
      name,
      phone,
      email: email ? email.toLowerCase() : '',
      title,
      description,
      category,
      location,
      image: image || '',
      status: 'Pending',
    });

    return NextResponse.json({ success: true, complaint }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

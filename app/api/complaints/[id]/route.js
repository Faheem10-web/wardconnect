import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Complaint from '@/models/Complaint';

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

export async function GET(req, { params }) {
  try {
    await dbConnect();
    const { id } = await params;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return NextResponse.json({ success: false, error: 'Complaint not found' }, { status: 404 });
    }

    // Verify Authorization:
    // 1. Is Admin?
    const isAdmin = await verifyAdmin();
    if (isAdmin) {
      return NextResponse.json({ success: true, complaint });
    }

    // 2. Is Citizen owner?
    const session = await getServerSession(authOptions);
    if (session?.user && complaint.email && session.user.email.toLowerCase() === complaint.email.toLowerCase()) {
      return NextResponse.json({ success: true, complaint });
    }

    // Unauthorized access
    return NextResponse.json({ success: false, error: 'Unauthorized access' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return NextResponse.json({ success: false, error: 'Complaint not found' }, { status: 404 });
    }

    // Verify auth: Admin OR Citizen owner
    const isAdmin = await verifyAdmin();
    const session = await getServerSession(authOptions);
    const isOwner = session?.user && complaint.email && session.user.email.toLowerCase() === complaint.email.toLowerCase();

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ success: false, error: 'Unauthorized access' }, { status: 401 });
    }

    if (!isAdmin) {
      // Citizen flow: can only perform 'reopen' action
      if (body.action === 'reopen') {
        complaint.status = 'Pending';
        complaint.detailedStatus = 'Submitted';
        complaint.publicUpdates.push({
          message: body.message || 'Citizen reopened this complaint.',
          createdAt: new Date()
        });
      } else {
        return NextResponse.json({ success: false, error: 'Unauthorized operation for citizen account' }, { status: 403 });
      }
    } else {
      // Admin flow
      if (body.action === 'add_public_update') {
        if (body.message) {
          complaint.publicUpdates.push({ message: body.message, createdAt: new Date() });
        }
      } else {
        const allowedFields = ['detailedStatus', 'priority', 'assignee', 'adminNotes', 'resolutionNotes', 'afterImage', 'status'];
        allowedFields.forEach((field) => {
          if (body[field] !== undefined) {
            complaint[field] = body[field];
          }
        });

        // Synchronize statuses
        if (body.detailedStatus) {
          if (['Submitted', 'Under Review', 'Assigned'].includes(body.detailedStatus)) {
            complaint.status = 'Pending';
          } else if (body.detailedStatus === 'In Progress') {
            complaint.status = 'In Progress';
          } else if (['Resolved', 'Closed'].includes(body.detailedStatus)) {
            complaint.status = 'Completed';
          }
        } else if (body.status) {
          if (body.status === 'Pending') {
            if (!['Submitted', 'Under Review', 'Assigned'].includes(complaint.detailedStatus)) {
              complaint.detailedStatus = 'Submitted';
            }
          } else if (body.status === 'In Progress') {
            complaint.detailedStatus = 'In Progress';
          } else if (body.status === 'Completed') {
            if (!['Resolved', 'Closed'].includes(complaint.detailedStatus)) {
              complaint.detailedStatus = 'Resolved';
            }
          }
        }
      }
    }

    await complaint.save();
    return NextResponse.json({ success: true, complaint });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await dbConnect();
    const { id } = await params;

    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ success: false, error: 'Unauthorized access' }, { status: 401 });
    }

    const complaint = await Complaint.findByIdAndDelete(id);
    if (!complaint) {
      return NextResponse.json({ success: false, error: 'Complaint not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Complaint deleted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

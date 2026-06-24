import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import Complaint from '@/models/Complaint';

const JWT_SECRET = process.env.JWT_SECRET || 'wardconnect_jwt_secret_token_2026_super_secure_key';

export async function GET() {
  try {
    await dbConnect();
    
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    try {
      jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const total = await Complaint.countDocuments();
    const pending = await Complaint.countDocuments({ status: 'Pending' });
    const inProgress = await Complaint.countDocuments({ status: 'In Progress' });
    const completed = await Complaint.countDocuments({ status: 'Completed' });

    const categories = [
      'Road Damage',
      'Street Light',
      'Water Supply',
      'Garbage',
      'Drainage',
      'Public Safety',
      'Other'
    ];
    
    const categoryStats = await Promise.all(
      categories.map(async (cat) => {
        const count = await Complaint.countDocuments({ category: cat });
        return { category: cat, count };
      })
    );

    const monthlyStats = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);
      
      const count = await Complaint.countDocuments({
        createdAt: { $gte: startOfMonth, $lte: endOfMonth }
      });

      const monthName = startOfMonth.toLocaleString('default', { month: 'short' });
      monthlyStats.push({ month: monthName, year: startOfMonth.getFullYear(), count });
    }

    const recentComplaints = await Complaint.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('-image');

    return NextResponse.json({
      stats: {
        total,
        pending,
        inProgress,
        completed,
      },
      categoryStats,
      monthlyStats,
      recentComplaints,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

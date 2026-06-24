import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { name, email, phone, password } = body;

    if (!name || !email || !phone || !password) {
      return NextResponse.json({ success: false, error: 'Name, email, phone, and password are required.' }, { status: 400 });
    }

    const emailLower = email.toLowerCase();

    // Check if email already registered
    const existingUser = await User.findOne({ email: emailLower });
    if (existingUser) {
      return NextResponse.json({ success: false, error: 'This email is already registered.' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user as a citizen
    const newUser = await User.create({
      name,
      email: emailLower,
      phone,
      password: hashedPassword,
      role: 'citizen',
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: 'Citizen registered successfully.',
      user: {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      }
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

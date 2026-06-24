import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import Cms from '@/models/Cms';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'wardconnect_jwt_secret_token_2026_super_secure_key';

async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  if (!token) return false;
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded && (decoded.role === 'admin' || decoded.role === 'super_admin');
  } catch (e) {
    return false;
  }
}

export async function GET() {
  try {
    await dbConnect();
    let settings = await Cms.findOne({ key: 'cms_settings' });
    if (!settings) {
      settings = await Cms.create({ key: 'cms_settings' });
    }
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ success: false, error: 'Unauthorized access' }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();

    let settings = await Cms.findOne({ key: 'cms_settings' });
    if (!settings) {
      settings = new Cms({ key: 'cms_settings' });
    }

    const fields = [
      'heroTitleEn', 'heroTitleMl', 'heroDescriptionEn', 'heroDescriptionMl', 'heroImage', 'heroUploadedImage',
      'wardMemberPhoto', 'wardMemberName', 'wardMemberRoleEn', 'wardMemberRoleMl',
      'wardMemberQuoteEn', 'wardMemberQuoteMl', 'wardMemberPhone', 'wardMemberEmail',
      'wardNumber', 'locationNameEn', 'locationNameMl', 'officeAddressEn', 'officeAddressMl',
      'officePhone', 'officeEmail'
    ];

    fields.forEach((field) => {
      if (body[field] !== undefined) {
        settings[field] = body[field];
      }
    });

    await settings.save();
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

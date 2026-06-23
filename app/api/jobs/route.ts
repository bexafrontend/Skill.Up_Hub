import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const employerId = searchParams.get('employerId');
  const category = searchParams.get('category');

  try {
    let query: FirebaseFirestore.Query = adminDb.collection('jobs');

    const now = new Date().toISOString();

    if (employerId) {
      // Employer o'z e'lonlarining hammasini ko'radi (to'lov kutilayotganlarni ham)
      query = adminDb.collection('jobs').where('employerId', '==', employerId);
      query = query.orderBy('createdAt', 'desc');
    } else {
      // Boshqalar faqat faol va to'lovi tasdiqlangan e'lonlarni ko'radi
      query = query.where('isActive', '==', true).where('expiresAt', '>', now);
      if (category) {
        query = query.where('category', '==', category);
      }
      query = query.orderBy('expiresAt', 'desc');
    }

    const snapshot = await query.limit(50).get();
    let jobs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as any[];

    if (!employerId) {
      // Faqat komissiyasi to'langan (yoki budget bo'lmagan) e'lonlarni ko'rsatish
      jobs = jobs.filter((j) => !j.budget || j.commissionPaid);
    }

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}

const COMMISSION_RATE = 0.01; // 1%

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      employerId,
      employerName,
      companyName,
      title,
      description,
      category,
      budget,
      currency,
      deadline,
    } = body;

    if (!employerId || !title || !description || !deadline) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const createdAt = new Date().toISOString();
    const expiresAt = new Date(deadline).toISOString();
    const hasBudget = !!budget && budget > 0;
    const commissionAmount = hasBudget ? Math.round(budget * COMMISSION_RATE) : 0;

    const jobData = {
      employerId,
      employerName,
      companyName,
      title,
      description,
      category: category || 'Other',
      budget: budget || null,
      currency: currency || 'UZS',
      deadline,
      createdAt,
      expiresAt,
      // Agar byudjet bo'lsa — komissiya to'languncha e'lon yashirin (isActive=false)
      isActive: !hasBudget,
      likes: 0,
      likedBy: [],
      averageRating: 0,
      ratingCount: 0,
      commissionAmount,
      commissionPaid: !hasBudget,
      commissionPaidAt: null,
    };

    const docRef = await adminDb.collection('jobs').add(jobData);
    return NextResponse.json({ id: docRef.id, ...jobData });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }
}

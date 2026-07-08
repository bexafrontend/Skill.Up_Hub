import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const employerId = searchParams.get('employerId');
  const category = searchParams.get('category');

  try {
    const now = new Date().toISOString();
    let jobs: any[];

    if (employerId) {
      // Employer o'z e'lonlarining hammasini ko'radi (to'lov kutilayotganlarni ham).
      // Faqat bitta maydon (employerId) bo'yicha filtr qilamiz — Firestore'ning
      // avtomatik yaratadigan indeksi yetarli, alohida composite index kerak emas.
      // Tartiblashni (createdAt bo'yicha) shu yerda, kodda qilamiz.
      const snapshot = await adminDb
        .collection('jobs')
        .where('employerId', '==', employerId)
        .limit(200)
        .get();
      jobs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as any[];
      jobs.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    } else {
      // Boshqalar faqat faol e'lonlarni ko'radi. Yana bitta maydon (isActive)
      // bo'yicha filtr qilamiz, qolganini (muddati o'tganmi, kategoriya, komissiya
      // to'langanmi) kodda tekshiramiz — composite index talab qilinmaydi.
      const snapshot = await adminDb
        .collection('jobs')
        .where('isActive', '==', true)
        .limit(200)
        .get();
      jobs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as any[];
      jobs = jobs.filter((j) => j.expiresAt > now);
      if (category) {
        jobs = jobs.filter((j) => j.category === category);
      }
      // Faqat komissiyasi to'langan (yoki budget bo'lmagan) e'lonlarni ko'rsatish
      jobs = jobs.filter((j) => !j.budget || j.commissionPaid);
      jobs.sort((a, b) => (b.expiresAt || '').localeCompare(a.expiresAt || ''));
    }

    jobs = jobs.slice(0, 50);

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

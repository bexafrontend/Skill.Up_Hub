import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
  try {
    const snapshot = await adminDb
      .collection('users')
      .where('role', '==', 'worker')
      .orderBy('totalRating', 'desc')
      .limit(20)
      .get();

    const workers = snapshot.docs.map((doc: FirebaseFirestore.QueryDocumentSnapshot) => ({
      id: doc.id,
      firstName: doc.data().firstName,
      lastName: doc.data().lastName,
      workField: doc.data().workField,
      totalRating: doc.data().totalRating || 0,
      ratingCount: doc.data().ratingCount || 0,
      avatar: doc.data().avatar,
      portfolioImages: doc.data().portfolioImages || [],
      hasPortfolio: doc.data().hasPortfolio,
    }));

    return NextResponse.json({ workers });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch workers' }, { status: 500 });
  }
}

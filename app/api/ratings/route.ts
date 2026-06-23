import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { jobId, workerId, employerId, stars } = body;

    if (!jobId || !workerId || !employerId || stars === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (stars < 0 || stars > 5) {
      return NextResponse.json({ error: 'Stars must be between 0 and 5' }, { status: 400 });
    }

    // Check if employer already rated this worker for this job
    const existingRating = await adminDb
      .collection('ratings')
      .where('jobId', '==', jobId)
      .where('workerId', '==', workerId)
      .where('employerId', '==', employerId)
      .get();

    if (!existingRating.empty) {
      return NextResponse.json(
        { error: 'You have already rated this worker for this job' },
        { status: 400 }
      );
    }

    const ratingData = {
      jobId,
      workerId,
      employerId,
      stars,
      createdAt: new Date().toISOString(),
    };

    await adminDb.collection('ratings').add(ratingData);

    // Update worker's total rating
    const workerRef = adminDb.collection('users').doc(workerId);
    const workerDoc = await workerRef.get();
    const workerData = workerDoc.data() as any;

    const currentTotal = workerData?.totalRating || 0;
    const currentCount = workerData?.ratingCount || 0;
    const newTotal = currentTotal + stars;
    const newCount = currentCount + 1;

    await workerRef.update({
      totalRating: newTotal,
      ratingCount: newCount,
    });

    // Update job's rating
    const jobRef = adminDb.collection('jobs').doc(jobId);
    const jobDoc = await jobRef.get();
    const jobData = jobDoc.data() as any;
    const jobRatingCount = (jobData?.ratingCount || 0) + 1;
    const jobRatingTotal = (jobData?.averageRating || 0) * (jobData?.ratingCount || 0) + stars;
    const newAvg = jobRatingTotal / jobRatingCount;

    await jobRef.update({
      averageRating: Math.round(newAvg * 10) / 10,
      ratingCount: jobRatingCount,
    });

    return NextResponse.json({ success: true, newTotal, newCount });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to submit rating' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const workerId = searchParams.get('workerId');

  try {
    let query: FirebaseFirestore.Query = adminDb.collection('ratings');
    if (workerId) {
      query = query.where('workerId', '==', workerId);
    }

    const snapshot = await query.orderBy('createdAt', 'desc').limit(20).get();
    const ratings = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ ratings });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch ratings' }, { status: 500 });
  }
}

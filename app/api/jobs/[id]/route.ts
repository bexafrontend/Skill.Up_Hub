import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const doc = await adminDb.collection('jobs').doc(id).get();
    if (!doc.exists) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    return NextResponse.json({ job: { id: doc.id, ...doc.data() } });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch job' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { action, userId } = body;

    const jobRef = adminDb.collection('jobs').doc(id);
    const jobDoc = await jobRef.get();

    if (!jobDoc.exists) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const jobData = jobDoc.data() as any;

    if (action === 'like') {
      const likedBy: string[] = jobData.likedBy || [];
      const isLiked = likedBy.includes(userId);

      if (isLiked) {
        await jobRef.update({
          likes: FieldValue.increment(-1),
          likedBy: likedBy.filter((uid: string) => uid !== userId),
        });
      } else {
        await jobRef.update({
          likes: FieldValue.increment(1),
          likedBy: [...likedBy, userId],
        });
      }

      // Update user's liked jobs
      const userRef = adminDb.collection('users').doc(userId);
      const userDoc = await userRef.get();
      const userData = userDoc.data() as any;
      const likedJobs: string[] = userData?.likedJobs || [];

      if (isLiked) {
        await userRef.update({ likedJobs: likedJobs.filter((jid) => jid !== id) });
      } else {
        await userRef.update({ likedJobs: [...likedJobs, id] });
      }

      return NextResponse.json({ liked: !isLiked });
    }

    if (action === 'deactivate') {
      await jobRef.update({ isActive: false });
      return NextResponse.json({ success: true });
    }

    if (action === 'confirm_commission_paid') {
      // Ish beruvchi "To'ladim" tugmasini bosganda chaqiriladi.
      // Faqat shu e'lonning egasi tasdiqlay oladi.
      if (jobData.employerId !== userId) {
        return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 403 });
      }
      await jobRef.update({
        commissionPaid: true,
        commissionPaidAt: new Date().toISOString(),
        isActive: true,
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update job' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await adminDb.collection('jobs').doc(id).delete();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete job' }, { status: 500 });
  }
}

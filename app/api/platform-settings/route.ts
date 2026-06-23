import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

// Standart sozlamalar — admin kartasi
const DEFAULT_SETTINGS = {
  adminCardNumber: '4073 4200 3525 8254',
  adminCardHolder: 'SkillUp Hub',
  commissionRate: 0.01,
};

export async function GET() {
  try {
    const doc = await adminDb.collection('settings').doc('platform').get();
    if (!doc.exists) {
      // Birinchi marta — standart sozlamalarni yaratamiz
      await adminDb.collection('settings').doc('platform').set(DEFAULT_SETTINGS);
      return NextResponse.json({ settings: DEFAULT_SETTINGS });
    }
    return NextResponse.json({ settings: doc.data() });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ settings: DEFAULT_SETTINGS });
  }
}

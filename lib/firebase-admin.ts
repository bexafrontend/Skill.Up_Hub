import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

function initAdmin(): App {
  const existing = getApps();
  if (existing.length) return existing[0];

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    // .env.local hali ulanmagan bosqichlarda (masalan build vaqtida) xato chiqarmaslik uchun.
    // Runtime'da (server ishga tushganda) bu qiymatlar albatta mavjud bo'lishi kerak.
    return initializeApp({ projectId: projectId || 'placeholder' }, 'placeholder-app');
  }

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

const app = initAdmin();

export const adminDb = getFirestore(app);
export const adminAuth = getAuth(app);
export default app;

import admin from 'firebase-admin';

const serviceAccount =  JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string
);

if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "devhunt-2863a.appspot.com",
  });
}

export const bucket = admin.storage().bucket();
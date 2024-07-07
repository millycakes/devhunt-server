import admin from 'firebase-admin';

const serviceAccount =  require('../devhunt-2863a-firebase-adminsdk-5s7gw-379a387164.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'devhunt-2863a.appspot.com'
});

export const bucket = admin.storage().bucket();
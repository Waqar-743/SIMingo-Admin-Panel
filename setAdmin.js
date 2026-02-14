import admin from 'firebase-admin';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const emailArg = process.argv[2]?.trim();
const serviceAccountPathArg = process.argv[3]?.trim();

if (!emailArg) {
  console.error('Usage: node setAdmin.js <admin-email> [service-account-json-path]');
  process.exit(1);
}

const defaultServiceAccountPath = path.resolve(__dirname, '../service-account.json.json');
const serviceAccountPath = serviceAccountPathArg
  ? path.resolve(serviceAccountPathArg)
  : defaultServiceAccountPath;

if (!fs.existsSync(serviceAccountPath)) {
  console.error(`Service account file not found: ${serviceAccountPath}`);
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

async function setAdminClaimByEmail(email) {
  const userRecord = await admin.auth().getUserByEmail(email);

  await admin.auth().setCustomUserClaims(userRecord.uid, {
    admin: true,
  });

  console.log(`✅ Admin claim set for ${email} (uid: ${userRecord.uid})`);
  console.log('ℹ️ User must sign out and sign back in to refresh token claims.');
}

setAdminClaimByEmail(emailArg)
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Failed to set admin claim:', err.message);
    process.exit(1);
  });

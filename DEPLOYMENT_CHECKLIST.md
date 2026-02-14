# Admin Panel Deployment Checklist (Vercel + Firebase)

## 1) Environment variables (Vercel)
Set all keys from `.env.example` in Vercel for:
- Production
- Preview
- Development

Use the `VITE_` prefix for Firebase client config.

## 2) Firebase Auth requirements
- Create dedicated admin accounts in Firebase Authentication.
- Set custom claim `admin: true` for each admin user.
- Enforce MFA for admin users if possible.

## 3) Firestore Security Rules (admin-only example)
```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAdmin() {
      return request.auth != null && request.auth.token.admin == true;
    }

    match /users/{userId} {
      allow read, update, delete: if isAdmin();
      allow create: if false;
    }

    match /plans/{planId} {
      allow read: if isAdmin();
      allow write: if false;
    }

    match /token_transactions/{txId} {
      allow read: if isAdmin();
      allow write: if false;
    }
  }
}
```

## 4) Data behavior in this panel
- **Ban user** sets `users/{id}.status = "expired"`.
- **Unban user** sets `users/{id}.status = "active"`.
- **Delete user** currently deletes only Firestore `users/{id}` document.

## 5) Important limitation
Because this panel is client-only (no secure Node server), it cannot safely:
- Delete Firebase Auth users
- Release Twilio numbers
- Run privileged backend cleanup jobs

For full delete/ban lifecycle matching your mobile backend, route those actions through a trusted server function (Cloud Functions or your existing backend endpoint) and keep this panel as UI only.

## 6) Vercel build settings
- Framework preset: `Vite`
- Build command: `npm run build`
- Output directory: `dist`

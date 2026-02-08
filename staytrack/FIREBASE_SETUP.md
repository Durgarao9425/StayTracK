# 🔥 Firebase Authentication Setup Guide

## Current Error
```
POST https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword 400 (Bad Request)
Error: auth/configuration-not-found
```

## Root Cause
**Email/Password authentication is not enabled in Firebase Console.**

---

## ✅ Setup Steps

### 1️⃣ Enable Email/Password Authentication

1. Open Firebase Console: https://console.firebase.google.com/project/staytrack-da2a8/authentication/providers
2. Find **"Email/Password"** in the sign-in providers list
3. Click on it
4. **Toggle "Enable"** switch to ON
5. Click **"Save"**

### 2️⃣ Create Test Users

1. Go to: https://console.firebase.google.com/project/staytrack-da2a8/authentication/users
2. Click **"Add user"** button
3. Enter test credentials:
   - Email: `owner@staytrack.com`
   - Password: `Owner123!`
4. Click **"Add user"**

**Repeat for additional test users:**
- `test@staytrack.com` / `Test123!`
- `admin@staytrack.com` / `Admin123!`

### 3️⃣ Test Login

1. Run your app: `npm start`
2. Open in browser: http://localhost:8081
3. Try logging in with:
   - **Email**: `owner@staytrack.com`
   - **Password**: `Owner123!`

---

## 🔧 Firebase Configuration

Your current Firebase config (already set up correctly):

```javascript
{
  apiKey: "AIzaSyBcFE1LIuA2ms6U3CaKB0gk4dViJLNp6zg",
  authDomain: "staytrack-da2a8.firebaseapp.com",
  projectId: "staytrack-da2a8",
storageBucket: "staytrack-da2a8.firebasestorage.app"  messagingSenderId: "26441744351",
  appId: "1:26441744351:web:0fb8b29185edc6c810ce6a",
  measurementId: "G-NGETDBP52X"
}
```

**Location**: `src/config/firebase.js`

---

## 🐛 Troubleshooting

### If you still see errors after enabling:

1. **Clear browser cache** and reload
2. **Restart the dev server**: Stop and run `npm start` again
3. **Check Firebase Console** to ensure Email/Password provider shows as "Enabled"
4. **Verify test user exists** in Authentication > Users tab

### Common Error Messages:

| Error Code | Meaning | Solution |
|------------|---------|----------|
| `auth/configuration-not-found` | Email/Password auth not enabled | Enable in Console |
| `auth/user-not-found` | User doesn't exist | Create user in Console |
| `auth/wrong-password` | Incorrect password | Check password |
| `auth/invalid-email` | Email format is wrong | Use valid email format |
| `auth/too-many-requests` | Rate limited | Wait a few minutes |

---

## 📱 Login Features

✅ **Implemented Features:**
- Email/Password validation
- Toast notifications (cross-platform)
- Loading states
- Comprehensive error handling
- Auto-navigation on success
- Firebase Analytics integration

---

## 🔗 Quick Links

- **Firebase Console**: https://console.firebase.google.com/project/staytrack-da2a8
- **Authentication Settings**: https://console.firebase.google.com/project/staytrack-da2a8/authentication
- **Users Management**: https://console.firebase.google.com/project/staytrack-da2a8/authentication/users
- **Project Settings**: https://console.firebase.google.com/project/staytrack-da2a8/settings/general

---

## 🎯 Next Steps After Setup

Once authentication is working:

1. ✅ Test login flow
2. 🔄 Add password reset functionality
3. 👤 Add user profile management
4. 🔐 Add role-based access control (owner/admin/student)
5. 📧 Add email verification

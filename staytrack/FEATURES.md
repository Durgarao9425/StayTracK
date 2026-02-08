# 🎨 StayTrack Theme & Firebase Integration

## ✅ What We've Implemented

### 1. **Theme System** 🌈
- **6 Beautiful Themes** with unique colors:
  - 🌊 **Teal** (Default) - #00A8A8
  - 💜 **Purple** - #8B5CF6
  - 🔷 **Blue** - #3B82F6
  - 🧡 **Orange** - #F97316
  - 💗 **Pink** - #EC4899
  - 🍀 **Green** - #10B981

- **Theme Persistence**: Selected theme saves to device storage
- **Global Theme Application**: All screens update automatically when theme changes

### 2. **Theme Selector in Profile** ⚙️
- Click on **Profile Picture** (RS circle) in Profile tab
- Opens menu with options:
  - ✏️ Edit Profile
  - 🎨 **App Theme** - Opens theme selector modal
  - ⚙️ Settings
  - 🚪 Logout

- **Theme Selector Modal**:
  - Shows all 6 themes with preview colors
  - Each theme has unique icon
  - Selected theme is highlighted
  - Click on any theme → Applies instantly
  - Toast notification confirms theme change

### 3. **Firebase Firestore Integration** 🔥

#### **Students Page Features**:
- ✅ **Load Students** from Firestore on app start
- ✅ **Add New Student** via form:
  - Full Name (required)
  - Mobile Number (required)
  - Parent Mobile
  - Room (required)
  - Bed Number
  - Monthly Rent
  
- ✅ **Form Validation**:
  - Checks for required fields
  - Shows error toast if validation fails
  
- ✅ **Real-time Save**:
  - Saves to Firestore `students` collection
  - Shows success toast
  - Updates UI immediately
  - Loading states while saving

### 4. **Consistent UI Across All Pages** 🎯

All pages now use the selected theme:
- **Home** - Background color adapts
- **Rooms** - Header & FAB button use theme
- **Students** - Header & FAB button use theme  
- **Profile** - Header uses theme + theme selector

---

## 🚀 How to Use

### **Change Theme:**
1. Go to **Profile** tab
2. Click on your **profile picture** (RS circle at top-right)
3. Click on **"App Theme"**
4. Select any theme (Teal, Purple, Blue, Orange, Pink, Green)
5. 🎉 Theme applies instantly across all screens!

### **Add a Student:**
1. Go to **Students** tab
2. Click the **+ (Plus)** button (floating action button)
3. Fill in student details:
   - Name, Phone, Room, etc.
4. Click **"Save Student"**
5. ✅ Student is saved to Firebase and appears in the list

---

## 📱 Screens Overview

### **Home Screen**
- Welcome message
- Total students banner
- Quick access grid (Rooms, Students, Fees, Reports)
- Recent activity feed
- **Theme-aware background color**

### **Rooms Screen**
- List of all rooms with status
- Occupancy indicators
- Add new room via drawer
- **Theme-aware header & buttons**

### **Students Screen**
- **Firebase-connected** student list
- Search functionality
- Add student form
- Call & edit buttons per student
- **Theme-aware header & buttons**
- Empty state when no students

### **Profile Screen**
- Compact header with profile picture
- Menu items (Hostel Details, Revenue, Bills, Expenses, etc.)
- **Profile menu dropdown**:
  - Edit Profile
  - **Theme Selector** 🎨
  - Settings
  - Logout
- **Theme-aware header & accents**

---

## 🛠️ Technical Implementation

### **Files Created/Modified:**

1. **`src/context/ThemeContext.js`** - Theme management system
2. **`App.js`** - Wrapped with ThemeProvider
3. **`src/config/firebase.js`** - Added Firestore initialization
4. **`src/screens/Owner/Profile.js`** - Theme selector + menu
5. **`src/screens/Owner/Students.js`** - Firebase integration + theme
6. **`src/screens/Owner/Rooms.js`** - Theme support
7. **`src/screens/Owner/OwnerHome.js`** - Theme support

### **Firebase Collections:**
- **`students`** - Stores all student data
  - Fields: name, phone, parentPhone, room, bed, rent, createdAt, feeStatus

---

## 🎨 Theme Colors Reference

| Theme | Primary | Icon |
|-------|---------|------|
| Teal | #00A8A8 | water |
| Purple | #8B5CF6 | wine |
| Blue | #3B82F6 | snow |
| Orange | #F97316 | flame |
| Pink | #EC4899 | heart |
| Green | #10B981 | leaf |

---

## ✨ Features Summary

✅ 6 unique color themes
✅ Theme selector in profile menu  
✅ Theme persists across app restarts
✅ All screens adapt to theme automatically
✅ Firebase Firestore for student data
✅ Add students with validation
✅ Real-time UI updates
✅ Toast notifications for actions
✅ Logout functionality
✅ Consistent design language

---

## 🔥 Firebase Setup Required

Make sure you've enabled **Firestore Database** in Firebase Console:

1. Go to: https://console.firebase.google.com/project/staytrack-da2a8/firestore
2. Click **"Create database"**
3. Choose **"Start in production mode"** or **"Test mode"**
4. Select your region
5. Click **"Enable"**

Now all student data will be stored in Firestore! 🎉

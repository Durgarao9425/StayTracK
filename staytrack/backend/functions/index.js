const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

// -------------------------------------------------------------
// 1. AUTHENTICATION & ROLE MANAGEMENT
// -------------------------------------------------------------

/**
 * Validates request authentication content for owner/admin roles.
 */
async function validateRole(context, allowedRoles) {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be logged in.');
    }

    const uid = context.auth.uid;
    const user = await admin.auth().getUser(uid);
    const role = user.customClaims ? user.customClaims.role : null;

    if (!allowedRoles.includes(role)) {
        throw new functions.https.HttpsError('permission-denied', 'Insufficient permissions.');
    }
    return uid;
}

/**
 * Creates a new Owner or Admin user (only callable by Super Admin conceptually, or manual trigger)
 * This is a helper to set custom claims.
 */
exports.setCustomClaims = functions.https.onCall(async (data, context) => {
    // In a real app, protect this endpoint thoroughly!
    // For now, we assume this is used to initialize the first admin/owner.
    const { email, role } = data;

    if (!['owner', 'admin'].includes(role)) {
        throw new functions.https.HttpsError('invalid-argument', 'Role must be owner or admin.');
    }

    try {
        const user = await admin.auth().getUserByEmail(email);
        await admin.auth().setCustomUserClaims(user.uid, { role });
        return { message: `Success! ${email} is now a ${role}.` };
    } catch (error) {
        throw new functions.https.HttpsError('internal', error.message);
    }
});


// -------------------------------------------------------------
// 2. DASHBOARD & STATS (Owner/Admin Only)
// -------------------------------------------------------------

exports.getDashboardStats = functions.https.onCall(async (data, context) => {
    await validateRole(context, ['owner', 'admin']);

    try {
        const studentsSnapshot = await db.collection('allocations').where('status', '==', 'active').get();
        const activeStudents = studentsSnapshot.size;

        const roomsSnapshot = await db.collection('rooms').get();
        let totalCapacity = 0;
        let occupiedBeds = 0;

        roomsSnapshot.forEach(doc => {
            const room = doc.data();
            totalCapacity += (room.capacity || 0);
            occupiedBeds += (room.occupied || 0);
        });

        const complaintsSnapshot = await db.collection('complaints').where('status', '==', 'pending').get();
        const pendingComplaints = complaintsSnapshot.size;

        return {
            activeStudents,
            totalCapacity,
            occupiedBeds,
            vacancy: totalCapacity - occupiedBeds,
            pendingComplaints
        };
    } catch (error) {
        throw new functions.https.HttpsError('internal', 'Unable to fetch stats');
    }
});


// -------------------------------------------------------------
// 3. ROOM MANAGEMENT (Owner/Admin Only)
// -------------------------------------------------------------

exports.getAllRooms = functions.https.onCall(async (data, context) => {
    await validateRole(context, ['owner', 'admin']);

    try {
        const snapshot = await db.collection('rooms').orderBy('number').get();
        const rooms = [];
        snapshot.forEach(doc => {
            rooms.push({ id: doc.id, ...doc.data() });
        });
        return { rooms };
    } catch (error) {
        throw new functions.https.HttpsError('internal', 'Could not fetch rooms.');
    }
});

// -------------------------------------------------------------
// 4. STUDENT / TENANT MANAGEMENT (Owner/Admin Only)
// -------------------------------------------------------------

exports.addStudent = functions.https.onCall(async (data, context) => {
    await validateRole(context, ['owner', 'admin']);

    // Add logic here to create student user auth, add to firestore, etc.
    // This is a placeholder for the backend logic corresponding to your new "Add Student" drawer.
    return { message: "Student addition backend logic goes here." };
});


// -------------------------------------------------------------
// 5. COMPLAINTS (Owner/Admin Only)
// -------------------------------------------------------------

exports.getComplaints = functions.https.onCall(async (data, context) => {
    await validateRole(context, ['owner', 'admin']);

    try {
        const snapshot = await db.collection('complaints').orderBy('createdAt', 'desc').get();
        const complaints = [];
        snapshot.forEach(doc => {
            complaints.push({ id: doc.id, ...doc.data() });
        });
        return { complaints };
    } catch (error) {
        throw new functions.https.HttpsError('internal', 'Could not fetch complaints.');
    }
});

exports.updateComplaintStatus = functions.https.onCall(async (data, context) => {
    await validateRole(context, ['owner', 'admin']);
    const { complaintId, status } = data;

    try {
        await db.collection('complaints').doc(complaintId).update({
            status,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedBy: context.auth.uid
        });
        return { success: true };
    } catch (error) {
        throw new functions.https.HttpsError('internal', 'Update failed.');
    }
});


// -------------------------------------------------------------
// 6. ACTIVITY LOGS (Owner/Admin Only)
// -------------------------------------------------------------
exports.getActivityLogs = functions.https.onCall(async (data, context) => {
    await validateRole(context, ['owner', 'admin']);

    try {
        const snapshot = await db.collection('activity_logs')
            .orderBy('timestamp', 'desc')
            .limit(20)
            .get();

        const logs = [];
        snapshot.forEach(doc => {
            logs.push({ id: doc.id, ...doc.data() });
        });
        return { logs };
    } catch (error) {
        throw new functions.https.HttpsError('internal', 'Could not fetch logs.');
    }
});

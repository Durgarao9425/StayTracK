import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Animated,
    Dimensions,
    Image,
    Alert,
    Platform,
    Linking,
    SafeAreaView,
    StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
    collection,
    setDoc,
    updateDoc,
    doc,
    getDocs,
    query,
    where
} from 'firebase/firestore';
import { db, auth } from '../../config/firebase';
import * as ImagePicker from 'expo-image-picker';
import { uploadFile } from '../../services/storage';
import { useTheme } from '../../context/ThemeContext';
import ProfileHeader from '../../components/ProfileHeader';
import showToast from '../../utils/toast';
import StayLoader from '../../components/StayLoader';
import { COLORS, SHADOWS } from '../../theme/theme';
import BottomTabNavigator from './BottomTabNavigator';
import { StudentItem, AddDrawer, StudentDetailsDrawer } from './StudentComponents';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height, width } = Dimensions.get('window');

export default function Students({ navigation }) {
    const [search, setSearch] = useState('');
    const [isDrawerOpen, setDrawerOpen] = useState(false);
    const [students, setStudents] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [loadingRooms, setLoadingRooms] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [editingStudent, setEditingStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [togglingIds, setTogglingIds] = useState([]);
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();

    useEffect(() => {
        loadStudents();
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        setLoadingRooms(true);
        try {
            const userId = auth.currentUser?.uid;
            if (!userId) return;
            const ref = collection(db, 'rooms');
            const q = query(ref, where("userId", "==", userId));
            const snap = await getDocs(q);
            setRooms(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingRooms(false);
        }
    };

    const loadStudents = async () => {
        try {
            const userId = auth.currentUser?.uid;
            if (!userId) return;

            const studentsRef = collection(db, 'students');
            const q = query(studentsRef, where("userId", "==", userId));
            const snapshot = await getDocs(q);
            const studentsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setStudents(studentsList);
        } catch (error) {
            console.error(error);
            showToast('Error loading students', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveStudent = async (formData, images) => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;

        const isEdit = !!editingStudent;
        const studentId = isEdit ? editingStudent.id : doc(collection(db, 'students')).id;

        try {
            // Upload images
            const [profileUrl, aadharFrontUrl, aadharBackUrl] = await Promise.all([
                images.profile && images.profile !== (editingStudent?.profileImage) ? uploadFile(images.profile, `students/${studentId}/profile.jpg`) : editingStudent?.profileImage || null,
                images.aadharFront && images.aadharFront !== (editingStudent?.aadharFrontImage) ? uploadFile(images.aadharFront, `students/${studentId}/aadhar_front.jpg`) : editingStudent?.aadharFrontImage || null,
                images.aadharBack && images.aadharBack !== (editingStudent?.aadharBackImage) ? uploadFile(images.aadharBack, `students/${studentId}/aadhar_back.jpg`) : editingStudent?.aadharBackImage || null,
            ]);

            const studentData = {
                ...formData,
                id: studentId,
                userId: userId,
                profileImage: profileUrl,
                aadharFrontImage: aadharFrontUrl,
                aadharBackImage: aadharBackUrl,
                updatedAt: new Date().toISOString(),
                status: isEdit ? editingStudent.status : 'Active'
            };

            const docRef = doc(db, 'students', studentId);
            await setDoc(docRef, studentData, { merge: true });

            if (isEdit) {
                setStudents(prev => prev.map(s => s.id === studentId ? { ...s, ...studentData } : s));
                showToast('Student updated', 'success');
            } else {
                setStudents(prev => [...prev, studentData]);
                showToast('Student added', 'success');
            }
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    const handleToggleStatus = async (student) => {
        const newStatus = student.status === 'Inactive' ? 'Active' : 'Inactive';
        setTogglingIds(prev => [...prev, student.id]);

        try {
            const studentRef = doc(db, 'students', student.id);
            await updateDoc(studentRef, { status: newStatus });

            setStudents(prev => prev.map(s =>
                s.id === student.id ? { ...s, status: newStatus } : s
            ));
            showToast(`Student marked as ${newStatus}`, 'success');
        } catch (error) {
            console.error(error);
            showToast("Failed to update status", "error");
        } finally {
            setTogglingIds(prev => prev.filter(id => id !== student.id));
        }
    };

    const filtered = students.filter(s =>
        s.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.room?.toString().includes(search)
    );

    return (
        <View style={styles.container}>
            <View style={[styles.headerBg, { backgroundColor: theme.primary }]} />

            <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
                <View style={styles.header}>
                    <View style={styles.headerTop}>
                        <Text style={styles.headerTitle}>Students</Text>
                        <ProfileHeader navigation={navigation} />
                    </View>

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>All Students</Text>
                        <View style={styles.summaryBadge}>
                            <Text style={styles.summaryBadgeText}>{students.length} Total</Text>
                        </View>
                    </View>

                    <View style={styles.searchBar}>
                        <Ionicons name="search" size={20} color="#94A3B8" />
                        <TextInput
                            placeholder="Search name or room..."
                            placeholderTextColor="#94A3B8"
                            style={styles.searchInput}
                            value={search}
                            onChangeText={setSearch}
                        />
                    </View>
                </View>

                <ScrollView
                    style={styles.list}
                    contentContainerStyle={{
                        paddingHorizontal: 20,
                        paddingBottom: (insets.bottom || 10) + 90
                    }}
                    showsVerticalScrollIndicator={false}
                >
                    {loading ? (
                        <View style={{ marginTop: 100, alignItems: 'center' }}>
                            <StayLoader />
                            <Text style={{ marginTop: 15, color: '#64748B' }}>Loading students...</Text>
                        </View>
                    ) : filtered.length === 0 ? (
                        <View style={{ marginTop: 100, alignItems: 'center' }}>
                            <Ionicons name="people-outline" size={64} color="#CBD5E1" />
                            <Text style={{ marginTop: 15, color: '#64748B' }}>No students found</Text>
                        </View>
                    ) : (
                        filtered.map(s => (
                            <StudentItem
                                key={s.id}
                                student={s}
                                theme={theme}
                                togglingIds={togglingIds}
                                onDetails={setSelectedStudent}
                                onEdit={(val) => {
                                    setEditingStudent(val);
                                    setDrawerOpen(true);
                                }}
                                onToggleStatus={handleToggleStatus}
                            />
                        ))
                    )}
                </ScrollView>
            </SafeAreaView>

            <TouchableOpacity
                onPress={() => {
                    setEditingStudent(null);
                    setDrawerOpen(true);
                }}
                style={[styles.fab, {
                    backgroundColor: theme.primary,
                    bottom: (insets.bottom || 10) + 110
                }]}
            >
                <Ionicons name="add" size={32} color="#fff" />
            </TouchableOpacity>

            <AddDrawer
                isVisible={isDrawerOpen}
                onClose={() => {
                    setDrawerOpen(false);
                    setEditingStudent(null);
                }}
                onSave={handleSaveStudent}
                theme={theme}
                initialData={editingStudent}
                rooms={rooms}
                loadingRooms={loadingRooms}
            />

            <StudentDetailsDrawer
                isVisible={!!selectedStudent}
                onClose={() => setSelectedStudent(null)}
                student={selectedStudent}
                theme={theme}
            />

            {/* MODERN BOTTOM NAVIGATION */}
            <BottomTabNavigator navigation={navigation} activeRoute="Students" />
        </View>
    );
}

// FULL STYLES INCLUDING NEW BOTTOM NAV
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    headerBg: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 280,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 65,
        paddingBottom: 25,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: '#fff',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    summaryLabel: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
    },
    summaryBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 10,
    },
    summaryBadgeText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#fff',
    },
    searchBar: {
        backgroundColor: '#fff',
        borderRadius: 18,
        paddingHorizontal: 15,
        height: 52,
        flexDirection: 'row',
        alignItems: 'center',
        ...SHADOWS.light,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
        color: '#1E293B',
    },
    list: {
        flex: 1,
    },
    fab: {
        position: 'absolute',
        right: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.medium,
        elevation: 8,
    },
});
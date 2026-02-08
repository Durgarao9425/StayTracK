import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Animated, Dimensions, Image, Alert, Platform, Linking, SafeAreaView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, setDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '../../config/firebase';
import * as ImagePicker from 'expo-image-picker';
import { uploadFile } from '../../services/storage';
import { useTheme } from '../../context/ThemeContext';
import ProfileHeader from '../../components/ProfileHeader';
import showToast from '../../utils/toast';
import StayLoader from '../../components/StayLoader';
import { ScreenWrapper } from '../../components';
import { COLORS, FONTS, SPACING, SHADOWS, RADII } from '../../theme/theme';

const { height, width } = Dimensions.get('window');

// Student Card Component
const StudentItem = ({ student, onDetails, onEdit, onToggleStatus, theme, togglingIds }) => {
    const isToggling = togglingIds.includes(student.id);

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => onDetails(student)}
            className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100"
        >
            <View className="flex-row items-center mb-3">
                <View className={`w-12 h-12 rounded-xl justify-center items-center mr-3`} style={{ backgroundColor: `${theme.primary}20` }}>
                    {student.profileImage ? (
                        <Image source={{ uri: student.profileImage }} className="w-full h-full rounded-xl" />
                    ) : (
                        <Text className="text-lg font-bold" style={{ color: theme.primary }}>
                            {student.name?.charAt(0) || 'S'}
                        </Text>
                    )}
                </View>
                <View className="flex-1">
                    <Text className="text-lg font-bold text-gray-900" numberOfLines={1}>{student.name}</Text>
                    <Text className="text-gray-500 text-xs font-medium">{student.room} • Bed {student.bed || '-'}</Text>
                </View>
                <View className={`px-2 py-1 rounded-md ${student.status === 'Inactive' ? 'bg-red-100' : 'bg-green-100'}`}>
                    <Text className={`text-[10px] font-bold ${student.status === 'Inactive' ? 'text-red-700' : 'text-green-700'}`}>
                        {student.status || 'ACTIVE'}
                    </Text>
                </View>
            </View>

            <View className="flex-row border-t border-gray-50 pt-3 justify-between">
                <TouchableOpacity
                    className="flex-1 flex-row items-center justify-center py-2 bg-blue-50 rounded-lg mr-2"
                    onPress={() => Linking.openURL(`tel:${student.phone}`)}
                >
                    <Ionicons name="call" size={16} color="#2563eb" />
                    <Text className="ml-2 text-blue-700 font-bold text-xs">Call</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    className="flex-1 flex-row items-center justify-center py-2 bg-gray-100 rounded-lg mr-2"
                    onPress={(e) => {
                        e.stopPropagation(); // Prevent opening details
                        onEdit(student);
                    }}
                >
                    <Ionicons name="create" size={16} color="#4b5563" />
                    <Text className="ml-2 text-gray-700 font-bold text-xs">Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    className={`flex-1 flex-row items-center justify-center py-2 rounded-lg ${student.status === 'Inactive' ? 'bg-green-50' : 'bg-red-50'}`}
                    onPress={(e) => {
                        e.stopPropagation(); // Prevent opening details
                        onToggleStatus(student);
                    }}
                    disabled={isToggling}
                >
                    {isToggling ? (
                        <StayLoader size="small" color={student.status === 'Inactive' ? "green" : "red"} />
                    ) : (
                        <>
                            <Ionicons
                                name={student.status === 'Inactive' ? "checkmark-circle" : "ban-outline"}
                                size={16}
                                color={student.status === 'Inactive' ? "#16a34a" : "#dc2626"}
                            />
                            <Text className={`ml-2 font-bold text-xs ${student.status === 'Inactive' ? 'text-green-700' : 'text-red-700'}`}>
                                {student.status === 'Inactive' ? 'Activate' : 'Block'}
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
};

// AddDrawer Modal Component
const AddDrawer = ({ isVisible, onClose, onSave, theme, initialData, rooms, loadingRooms }) => {
    const slideAnim = useRef(new Animated.Value(width)).current;

    // Form State
    const [formData, setFormData] = useState({ name: '', phone: '', parentPhone: '', adhaar: '', room: '', bed: '', rent: '' });
    const [images, setImages] = useState({ profile: null, aadharFront: null, aadharBack: null });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        Animated.timing(slideAnim, {
            toValue: isVisible ? 0 : width,
            duration: 300,
            useNativeDriver: true,
        }).start();

        if (isVisible) {
            if (initialData) {
                // Populate form for editing
                setFormData({
                    name: initialData.name || '',
                    phone: initialData.phone || '',
                    parentPhone: initialData.parentPhone || '',
                    adhaar: initialData.adhaar || '',
                    room: initialData.room || '',
                    bed: initialData.bed || '',
                    rent: initialData.rent || '',
                });
                setImages({
                    profile: initialData.profileImage || null,
                    aadharFront: initialData.aadharFrontImage || null,
                    aadharBack: initialData.aadharBackImage || null,
                });
            } else {
                // Reset for add
                setFormData({ name: '', phone: '', parentPhone: '', adhaar: '', room: '', bed: '', rent: '' });
                setImages({ profile: null, aadharFront: null, aadharBack: null });
            }
        }
    }, [isVisible, initialData]);

    const pickImage = async (type) => {
        const uploadFromCamera = async () => {
            try {
                let result = await ImagePicker.launchCameraAsync({
                    allowsEditing: true,
                    aspect: type === 'profile' ? [1, 1] : [4, 3],
                    quality: 0.5,
                });
                if (!result.canceled) setImages(prev => ({ ...prev, [type]: result.assets[0].uri }));
            } catch (e) {
                showToast("Camera error", 'error');
            }
        };

        const uploadFromGallery = async () => {
            try {
                let result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: true,
                    aspect: type === 'profile' ? [1, 1] : [4, 3],
                    quality: 0.5,
                });
                if (!result.canceled) setImages(prev => ({ ...prev, [type]: result.assets[0].uri }));
            } catch (e) {
                console.error(e);
            }
        };

        if (Platform.OS === 'web') {
            uploadFromGallery();
        } else {
            Alert.alert("Upload Image", "Choose an option", [
                { text: "Camera", onPress: uploadFromCamera },
                { text: "Gallery", onPress: uploadFromGallery },
                { text: "Cancel", style: "cancel" }
            ]);
        }
    };

    const handleReset = () => {
        setFormData({ name: '', phone: '', parentPhone: '', adhaar: '', room: '', bed: '', rent: '' });
        setImages({ profile: null, aadharFront: null, aadharBack: null });
    };

    const handleSave = async () => {
        if (!formData.name || !formData.phone || !formData.room || !formData.adhaar) {
            showToast('Please fill in Name, Phone, Adhaar, and Room', 'warning');
            return;
        }
        if (!/^[0-9]{10}$/.test(formData.phone)) {
            showToast('Mobile Number must be 10 digits', 'warning');
            return;
        }
        if (!/^[0-9]{12}$/.test(formData.adhaar)) {
            showToast('Adhaar Number must be 12 digits', 'warning');
            return;
        }
        // Minimal image validation to allow faster entry if needed, but keeping original logic:
        if (!images.profile || !images.aadharFront || !images.aadharBack) {
            showToast('Please upload all required images', 'warning');
            return;
        }

        setSaving(true);
        try {
            await onSave(formData, images);
        } finally {
            setSaving(false);
        }
    };

    if (!isVisible) return null;

    return (
        <View style={styles.drawerOverlay} pointerEvents={isVisible ? "auto" : "none"}>
            <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
            <Animated.View style={[styles.drawerContainer, { transform: [{ translateX: slideAnim }] }]}>
                <SafeAreaView style={{ flex: 1 }}>
                    <View style={styles.drawerContent}>
                        {/* Header */}
                        <View style={styles.drawerHeader}>
                            <Text style={styles.drawerTitle}>Add Student</Text>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <Ionicons name="close" size={24} color={COLORS.gray800} />
                            </TouchableOpacity>
                        </View>

                        {/* Content */}

                        <ScrollView
                            style={{ flex: 1 }}
                            contentContainerStyle={[styles.formContainer, { paddingBottom: 180 }]}
                            showsVerticalScrollIndicator={false}
                        >
                            {/* Profile Image */}
                            <View style={styles.profileUploadContainer}>
                                <TouchableOpacity onPress={() => pickImage('profile')} style={styles.profileUploadBtn}>
                                    {images.profile ? (
                                        <Image source={{ uri: images.profile }} style={styles.profilePreview} />
                                    ) : (
                                        <View style={styles.profilePlaceholder}>
                                            <Ionicons name="camera" size={32} color={COLORS.gray400} />
                                        </View>
                                    )}
                                </TouchableOpacity>
                                <Text style={styles.uploadLabel}>Upload Profile Photo</Text>
                            </View>

                            {/* Text Inputs */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Full Name <Text style={styles.required}>*</Text></Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter student name"
                                    value={formData.name}
                                    onChangeText={t => setFormData({ ...formData, name: t })}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Mobile Number <Text style={styles.required}>*</Text></Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="10-digit number"
                                    keyboardType="numeric"
                                    maxLength={10}
                                    value={formData.phone}
                                    onChangeText={t => setFormData({ ...formData, phone: t.replace(/[^0-9]/g, '') })}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Select Room <Text style={styles.required}>*</Text></Text>
                                {loadingRooms ? (
                                    <View className="py-2 flex-row items-center">
                                        <StayLoader size="small" />
                                        <Text className="ml-2 text-gray-400 text-xs">Fetching rooms...</Text>
                                    </View>
                                ) : rooms.length === 0 ? (
                                    <View className="p-3 bg-red-50 rounded-xl border border-red-100">
                                        <Text className="text-red-500 font-bold text-xs text-center">No rooms available. Please add rooms in the Rooms page first.</Text>
                                    </View>
                                ) : (
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row' }}>
                                        {rooms.map(room => (
                                            <TouchableOpacity
                                                key={room.id}
                                                onPress={() => setFormData({ ...formData, room: room.number })}
                                                style={[
                                                    styles.hostelChip,
                                                    formData.room === room.number && { backgroundColor: theme.primary, borderColor: theme.primary }
                                                ]}
                                            >
                                                <Text style={[
                                                    styles.hostelChipText,
                                                    formData.room === room.number && { color: COLORS.white }
                                                ]}>{room.number}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                )}
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Bed No.</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. 1"
                                    value={formData.bed}
                                    onChangeText={t => setFormData({ ...formData, bed: t })}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Monthly Rent (₹)</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="5000"
                                    keyboardType="numeric"
                                    value={formData.rent}
                                    onChangeText={t => setFormData({ ...formData, rent: t })}
                                />
                            </View>

                            {/* ID Proof */}
                            <View style={styles.idProofSection}>
                                <Text style={styles.sectionTitle}>Identity Verification</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: COLORS.white, marginBottom: SPACING.m }]}
                                    placeholder="Adhaar Number (12 Digits)"
                                    keyboardType="numeric"
                                    maxLength={12}
                                    value={formData.adhaar}
                                    onChangeText={t => setFormData({ ...formData, adhaar: t.replace(/[^0-9]/g, '') })}
                                />

                                <View style={styles.row}>
                                    <TouchableOpacity onPress={() => pickImage('aadharFront')} style={styles.idUploadBtn}>
                                        {images.aadharFront ? (
                                            <Image source={{ uri: images.aadharFront }} style={styles.idPreview} />
                                        ) : (
                                            <View style={styles.idPlaceholder}>
                                                <Ionicons name="id-card-outline" size={24} color={COLORS.gray400} />
                                                <Text style={styles.idUploadText}>Front</Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => pickImage('aadharBack')} style={styles.idUploadBtn}>
                                        {images.aadharBack ? (
                                            <Image source={{ uri: images.aadharBack }} style={styles.idPreview} />
                                        ) : (
                                            <View style={styles.idPlaceholder}>
                                                <Ionicons name="id-card-outline" size={24} color={COLORS.gray400} />
                                                <Text style={styles.idUploadText}>Back</Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </ScrollView>

                        {/* Footer Button */}
                        <View style={styles.drawerFooter}>
                            <TouchableOpacity
                                style={styles.resetButton}
                                onPress={handleReset}
                                disabled={saving}
                            >
                                <Text style={styles.resetButtonText}>Reset</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.saveButton, { backgroundColor: theme.primary }]}
                                onPress={handleSave}
                                disabled={saving}
                            >
                                <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save Student'}</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Full Screen Loader within Drawer */}
                        {saving && (
                            <View style={styles.loaderOverlay}>
                                <StayLoader />
                                <Text style={styles.loaderText}>Creating Student Profile...</Text>
                            </View>
                        )}
                    </View>
                </SafeAreaView>
            </Animated.View>
        </View>
    );
};

// Details Drawer
const StudentDetailsDrawer = ({ isVisible, onClose, student, theme }) => {
    const slideAnim = useRef(new Animated.Value(height)).current;

    useEffect(() => {
        Animated.timing(slideAnim, {
            toValue: isVisible ? 0 : height,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [isVisible]);

    if (!isVisible && !student) return null;

    return (
        <View style={styles.drawerOverlay} pointerEvents={isVisible ? "auto" : "none"}>
            <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
            <Animated.View style={[styles.bottomSheetContainer, { transform: [{ translateY: slideAnim }] }]}>
                <View style={styles.drawerHeader}>
                    <Text style={styles.drawerTitle}>Student Details</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color={COLORS.gray800} />
                    </TouchableOpacity>
                </View>

                {student && (
                    <ScrollView contentContainerStyle={styles.detailsContent}>
                        <View style={styles.detailsProfile}>
                            <View style={[styles.detailsAvatar, { backgroundColor: `${theme.primary}20` }]}>
                                {student.profileImage ? (
                                    <Image source={{ uri: student.profileImage }} style={styles.avatarLarge} />
                                ) : (
                                    <Text style={[styles.avatarTextLarge, { color: theme.primary }]}>
                                        {student.name?.charAt(0)}
                                    </Text>
                                )}
                            </View>
                            <Text style={styles.detailsName}>{student.name}</Text>
                            <Text style={styles.detailsPhone}>{student.phone}</Text>
                        </View>

                        <View style={styles.infoGrid}>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>ROOM</Text>
                                <Text style={styles.infoValue}>{student.room}</Text>
                            </View>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>BED</Text>
                                <Text style={styles.infoValue}>{student.bed || '-'}</Text>
                            </View>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>RENT</Text>
                                <Text style={styles.infoValue}>₹{student.rent}</Text>
                            </View>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>STATUS</Text>
                                <View style={styles.statusTag}>
                                    <Text style={styles.statusTagText}>Active</Text>
                                </View>
                            </View>
                        </View>

                        <Text style={styles.sectionHeader}>Documents</Text>
                        <View style={styles.documentsRow}>
                            <View style={styles.documentCard}>
                                <Text style={styles.documentLabel}>Aadhar Front</Text>
                                {student.aadharFrontImage ? (
                                    <Image source={{ uri: student.aadharFrontImage }} style={styles.documentImage} />
                                ) : (
                                    <View style={styles.noDocument}>
                                        <Ionicons name="image-outline" size={24} color={COLORS.gray400} />
                                    </View>
                                )}
                            </View>
                            <View style={styles.documentCard}>
                                <Text style={styles.documentLabel}>Aadhar Back</Text>
                                {student.aadharBackImage ? (
                                    <Image source={{ uri: student.aadharBackImage }} style={styles.documentImage} />
                                ) : (
                                    <View style={styles.noDocument}>
                                        <Ionicons name="image-outline" size={24} color={COLORS.gray400} />
                                    </View>
                                )}
                            </View>
                        </View>
                    </ScrollView>
                )}
            </Animated.View>
        </View>
    );
};

export default function Students({ navigation }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isDrawerOpen, setDrawerOpen] = useState(false);
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null); // For Details Viewer
    const [editingStudent, setEditingStudent] = useState(null); // For Edit Form
    const [isDetailsOpen, setDetailsOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [togglingIds, setTogglingIds] = useState([]); // Track which IDs are loading
    const [rooms, setRooms] = useState([]);
    const [loadingRooms, setLoadingRooms] = useState(false);
    const { theme } = useTheme();

    useEffect(() => {
        loadStudents();
    }, []);

    const fetchRooms = async () => {
        setLoadingRooms(true);
        try {
            const userId = auth.currentUser?.uid;
            if (!userId) return;

            const roomsRef = collection(db, 'rooms');
            const q = query(roomsRef, where("userId", "==", userId));
            const snapshot = await getDocs(q);
            const roomsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setRooms(roomsList);
        } catch (error) {
            console.error('Error fetching rooms:', error);
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
            const studentsList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setStudents(studentsList);
            // Initial fetch of rooms
            fetchRooms();
        } catch (error) {
            console.error('Error loading students:', error);
            showToast('Error loading students', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveStudent = async (formData, images) => {
        try {
            const userId = auth.currentUser?.uid;
            if (!userId) {
                showToast('You must be logged in', 'error');
                return;
            }

            // If editing, we update existing doc
            const isEdit = !!editingStudent;
            const docRef = isEdit ? doc(db, 'students', editingStudent.id) : doc(collection(db, 'students'));
            const studentId = docRef.id;

            const safeUpload = async (file, path) => {
                if (!file || file.startsWith('http')) return file; // Already a URL
                try { return await uploadFile(file, path); }
                catch (e) { console.warn(`Upload failed: ${path}`, e); return null; }
            };

            const [profileUrl, aadharFrontUrl, aadharBackUrl] = await Promise.all([
                images.profile ? safeUpload(images.profile, `students/${studentId}/profile.jpg`) : null,
                images.aadharFront ? safeUpload(images.aadharFront, `students/${studentId}/aadhar_front.jpg`) : null,
                images.aadharBack ? safeUpload(images.aadharBack, `students/${studentId}/aadhar_back.jpg`) : null
            ]);

            const studentData = {
                ...formData,
                id: studentId,
                userId: userId,
                profileImage: profileUrl,
                aadharFrontImage: aadharFrontUrl,
                aadharBackImage: aadharBackUrl,
                updatedAt: new Date().toISOString(),
                // Keep existing fields if edit, else defaults
                feeStatus: isEdit ? editingStudent.feeStatus : 'Pending',
                status: isEdit ? editingStudent.status : 'Active'
            };

            if (!isEdit) {
                studentData.createdAt = new Date().toISOString();
            }

            await setDoc(docRef, studentData, { merge: true });

            // Close BEFORE state updates to avoid "stuck" feeling
            setDrawerOpen(false);
            setEditingStudent(null);

            if (isEdit) {
                setStudents(prev => prev.map(s => s.id === studentId ? { ...s, ...studentData } : s));
                showToast('Student updated successfully!', 'success');
            } else {
                setStudents(prev => [...prev, studentData]);
                showToast('Student added successfully!', 'success');
            }
        } catch (error) {
            console.error('Error saving student:', error);
            showToast('Failed to save student: ' + error.message, 'error');
        }
    };

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.room.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleToggleStatus = async (student) => {
        const newStatus = student.status === 'Inactive' ? 'Active' : 'Inactive';
        setTogglingIds(prev => [...prev, student.id]);

        try {
            const studentRef = doc(db, 'students', student.id);
            await setDoc(studentRef, { status: newStatus }, { merge: true });

            setStudents(prev => prev.map(s =>
                s.id === student.id ? { ...s, status: newStatus } : s
            ));
            showToast(`Student marked as ${newStatus}`, 'success');
        } catch (error) {
            console.error("Status update failed:", error);
            showToast("Failed to update status", "error");
        } finally {
            setTogglingIds(prev => prev.filter(id => id !== student.id));
        }
    };

    return (
        <View className="flex-1 bg-[#F5F7FA]">
            {/* Header Background */}
            <View className="absolute top-0 w-full h-[240px] rounded-b-[40px] z-0" style={{ backgroundColor: theme.primary }} />

            <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
                {/* Header */}
                <View className="px-6 pt-2 pb-6 z-10 w-full">
                    <View className="flex-row justify-between items-center mb-6">
                        <View className="flex-1 mr-4">
                            <Text className="text-white text-3xl font-bold">Students</Text>
                        </View>
                        <ProfileHeader navigation={navigation} />
                    </View>

                    {/* All Students Info Moved up */}
                    <View className="flex-row justify-between mb-4 items-end">
                        <Text className="text-white font-bold text-lg">All Students</Text>
                        <View className="bg-white/20 px-3 py-1 rounded-lg">
                            <Text className="text-white text-xs font-bold">{students.length} Total</Text>
                        </View>
                    </View>

                    {/* Search Bar */}
                    <View className="bg-white rounded-2xl flex-row items-center px-4 py-3 shadow-sm border border-gray-50">
                        <Ionicons name="search" size={20} color="#9ca3af" />
                        <TextInput
                            placeholder="Search by name or room..."
                            placeholderTextColor="#9ca3af"
                            className="flex-1 ml-3 text-gray-800 font-medium text-base"
                            style={Platform.OS === 'web' ? { outlineStyle: 'none' } : {}}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                </View>

                {/* List Content */}
                <ScrollView
                    className="flex-1 px-5"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 130, paddingTop: 10 }}
                >

                    {loading ? (
                        <View className="h-60 justify-center items-center">
                            <StayLoader />
                            <Text className="text-center text-gray-400 mt-4">Loading students...</Text>
                        </View>
                    ) : filteredStudents.length === 0 ? (
                        <View className="items-center mt-20">
                            <Ionicons name="people-outline" size={64} color={COLORS.gray300} />
                            <Text className="text-gray-500 text-lg mt-4 font-medium">
                                {students.length === 0 ? "No students yet" : "No matches found"}
                            </Text>
                        </View>
                    ) : (
                        filteredStudents.map((student) => (
                            <StudentItem
                                key={student.id}
                                student={student}
                                theme={theme}
                                togglingIds={togglingIds}
                                onDetails={(s) => setSelectedStudent(s)}
                                onEdit={(s) => {
                                    setEditingStudent(s);
                                    setDrawerOpen(true);
                                }}
                                onToggleStatus={handleToggleStatus}
                            />
                        ))
                    )}
                </ScrollView>
            </SafeAreaView>

            {/* FAB */}
            {!isDrawerOpen && !isDetailsOpen && (
                <TouchableOpacity
                    onPress={() => {
                        fetchRooms();
                        setEditingStudent(null);
                        setDrawerOpen(true);
                    }}
                    className="absolute bottom-24 right-6 w-16 h-16 rounded-full items-center justify-center shadow-2xl z-20"
                    style={{ backgroundColor: theme.primary, elevation: 5 }}
                    activeOpacity={0.9}
                >
                    <Ionicons name="add" size={32} color={COLORS.white} />
                </TouchableOpacity>
            )}

            {/* Drawers */}
            <AddDrawer
                isVisible={isDrawerOpen}
                onClose={() => {
                    setDrawerOpen(false);
                    setEditingStudent(null);
                }}
                onSave={handleSaveStudent}
                initialData={editingStudent}
                theme={theme}
                rooms={rooms}
                loadingRooms={loadingRooms}
            />

            <StudentDetailsDrawer
                isVisible={!!selectedStudent}
                onClose={() => setSelectedStudent(null)}
                student={selectedStudent}
                theme={theme}
            />
        </View >
    );
}

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: SPACING.l,
        paddingTop: SPACING.m,
        paddingBottom: SPACING.l,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.m,
    },
    headerTitle: {
        fontSize: 32,
        fontFamily: FONTS.bold,
        color: COLORS.white,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: RADII.l,
        paddingHorizontal: SPACING.m,
        paddingVertical: 12,
        ...SHADOWS.medium,
    },
    searchInput: {
        flex: 1,
        marginLeft: SPACING.s,
        fontFamily: FONTS.medium,
        fontSize: FONTS.body,
        color: COLORS.gray900,
    },
    sheetContainer: {
        flex: 1,
        backgroundColor: COLORS.gray50,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        overflow: 'hidden',
    },
    scrollContent: {
        padding: SPACING.l,
        paddingBottom: 100,
    },
    // Student Card
    studentCard: {
        backgroundColor: COLORS.white,
        borderRadius: RADII.l,
        padding: SPACING.m,
        marginBottom: SPACING.m,
        borderWidth: 1,
        borderColor: COLORS.gray100,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        width: 56,
        height: 56,
        borderRadius: RADII.full,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.m,
        borderWidth: 2,
        borderColor: COLORS.white,
        overflow: 'hidden',
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    avatarText: {
        fontSize: 24,
        fontFamily: FONTS.bold,
    },
    cardInfo: {
        flex: 1,
    },
    studentName: {
        fontSize: 18,
        fontFamily: FONTS.bold,
        color: COLORS.gray900,
    },
    studentPhone: {
        fontSize: 12,
        fontFamily: FONTS.medium,
        color: COLORS.gray500,
        marginBottom: 4,
    },
    roomBadge: {
        backgroundColor: COLORS.gray100,
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: RADII.s,
    },
    roomBadgeText: {
        fontSize: 10,
        fontFamily: FONTS.medium,
        color: COLORS.gray600,
    },
    callButton: {
        width: 36,
        height: 36,
        borderRadius: RADII.full,
        backgroundColor: COLORS.primaryLight + '20', // roughly faded blue
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: SPACING.s,
    },
    // Empty State
    centerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
    },
    loadingText: {
        marginTop: SPACING.m,
        color: COLORS.gray500,
        fontFamily: FONTS.medium,
    },
    emptyText: {
        marginTop: SPACING.m,
        fontSize: 18,
        color: COLORS.gray500,
        fontFamily: FONTS.medium,
    },
    subText: {
        marginTop: SPACING.xs,
        fontSize: 14,
        color: COLORS.gray400,
    },
    fab: {
        position: 'absolute',
        bottom: 100,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 20,
    },
    // Drawer Common
    drawerOverlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 50,
        elevation: 50,
    },
    backdrop: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    drawerContainer: {
        position: 'absolute',
        right: 0, top: 0, bottom: 0,
        width: width > 500 ? 500 : '85%', // Increased width slightly
        backgroundColor: COLORS.white,
        ...SHADOWS.heavy,
        zIndex: 60,
    },
    bottomSheetContainer: {
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        height: height * 0.85,
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        ...SHADOWS.heavy,
        overflow: 'hidden',
    },
    drawerContent: { flex: 1 },
    drawerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.l,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray100,
    },
    drawerTitle: {
        fontSize: 24,
        fontFamily: FONTS.bold,
        color: COLORS.gray900,
    },
    closeButton: {
        padding: SPACING.s,
        backgroundColor: COLORS.gray100,
        borderRadius: RADII.full,
    },
    drawerFooter: {
        flexDirection: 'row',
        paddingHorizontal: SPACING.l,
        paddingTop: SPACING.m,
        paddingBottom: SPACING.xl + 60, // Increased specific padding as requested
        borderTopWidth: 1,
        borderTopColor: COLORS.gray100,
        backgroundColor: COLORS.white,
        gap: SPACING.m,
        position: 'absolute', // Pin to bottom relative to Safe Area
        bottom: 0,
        left: 0,
        right: 0,
    },
    loaderOverlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(255,255,255,0.9)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
    },
    loaderText: {
        marginTop: SPACING.m,
        fontFamily: FONTS.bold,
        color: COLORS.gray800,
    },
    // Form Styles
    formContainer: {
        padding: SPACING.l,
        paddingBottom: 180,
    },
    profileUploadContainer: {
        alignItems: 'center',
        marginBottom: SPACING.l,
    },
    profileUploadBtn: {
        width: 100,
        height: 100,
        borderRadius: RADII.full,
        backgroundColor: COLORS.gray50,
        borderWidth: 2,
        borderColor: COLORS.gray200,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    profilePreview: { width: '100%', height: '100%' },
    profilePlaceholder: { alignItems: 'center', justifyContent: 'center' },
    uploadLabel: {
        marginTop: SPACING.s,
        fontSize: 12,
        fontFamily: FONTS.bold,
        color: COLORS.gray500,
    },
    inputGroup: { marginBottom: SPACING.m },
    label: {
        fontSize: 14,
        fontFamily: FONTS.bold,
        color: COLORS.gray700,
        marginBottom: SPACING.xs,
    },
    required: { color: COLORS.error },
    input: {
        backgroundColor: COLORS.gray50,
        padding: SPACING.m,
        borderRadius: RADII.m,
        borderWidth: 1,
        borderColor: COLORS.gray200,
        fontFamily: FONTS.medium,
        color: COLORS.gray900,
    },
    row: { flexDirection: 'row' },
    idProofSection: {
        backgroundColor: COLORS.gray50,
        padding: SPACING.m,
        borderRadius: RADII.l,
        borderWidth: 1,
        borderColor: COLORS.gray200,
        borderStyle: 'dashed',
        marginTop: SPACING.m,
    },
    sectionTitle: {
        fontSize: 16,
        fontFamily: FONTS.bold,
        color: COLORS.gray900,
        marginBottom: SPACING.m,
    },
    idUploadBtn: {
        flex: 1,
        height: 100,
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.gray200,
        borderRadius: RADII.m,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 4,
        overflow: 'hidden',
    },
    idPreview: { width: '100%', height: '100%' },
    idPlaceholder: { alignItems: 'center' },
    idUploadText: { fontSize: 10, color: COLORS.gray500, marginTop: 4 },
    resetButton: {
        flex: 1,
        padding: SPACING.m,
        borderRadius: RADII.l,
        alignItems: 'center',
        backgroundColor: COLORS.gray100,
        ...SHADOWS.light,
    },
    resetButtonText: {
        color: COLORS.gray700,
        fontFamily: FONTS.bold,
        fontSize: 16,
    },
    saveButton: {
        flex: 2,
        padding: SPACING.m,
        borderRadius: RADII.l,
        alignItems: 'center',
        ...SHADOWS.light,
    },
    saveButtonText: {
        color: COLORS.white,
        fontFamily: FONTS.bold,
        fontSize: 16,
    },
    // Details Styles
    detailsContent: { padding: SPACING.l, paddingBottom: 180 },
    detailsProfile: { alignItems: 'center', marginBottom: SPACING.xl },
    detailsAvatar: {
        width: 100,
        height: 100,
        borderRadius: RADII.full,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.m,
        borderWidth: 4,
        borderColor: COLORS.white,
        ...SHADOWS.medium,
    },
    avatarLarge: { width: '100%', height: '100%', borderRadius: 50 },
    avatarTextLarge: { fontSize: 40, fontFamily: FONTS.bold },
    detailsName: { fontSize: 24, fontFamily: FONTS.bold, color: COLORS.gray900 },
    detailsPhone: { fontSize: 16, fontFamily: FONTS.medium, color: COLORS.gray500 },
    hostelChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: RADII.full,
        borderWidth: 1,
        borderColor: COLORS.gray200,
        marginRight: 8,
        backgroundColor: COLORS.gray50,
    },
    hostelChipText: {
        fontFamily: FONTS.bold,
        color: COLORS.gray600,
    },
    infoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        backgroundColor: COLORS.gray50,
        borderRadius: RADII.xl,
        padding: SPACING.m,
        marginBottom: SPACING.xl,
    },
    infoItem: { width: '50%', marginBottom: SPACING.m, paddingHorizontal: SPACING.s },
    infoLabel: { fontSize: 10, fontFamily: FONTS.bold, color: COLORS.gray400, marginBottom: 4 },
    infoValue: { fontSize: 16, fontFamily: FONTS.bold, color: COLORS.gray800 },
    statusTag: {
        backgroundColor: '#DCFCE7',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: RADII.s,
        alignSelf: 'flex-start',
    },
    statusTagText: { color: '#15803D', fontWeight: 'bold', fontSize: 12 },
    sectionHeader: { fontSize: 18, fontFamily: FONTS.bold, color: COLORS.gray900, marginBottom: SPACING.m },
    documentsRow: { flexDirection: 'row', gap: SPACING.m },
    documentCard: { flex: 1 },
    documentLabel: { fontSize: 12, color: COLORS.gray500, marginBottom: 8 },
    documentImage: { width: '100%', height: 120, borderRadius: RADII.m, borderWidth: 1, borderColor: COLORS.gray200 },
    noDocument: {
        width: '100%',
        height: 120,
        borderRadius: RADII.m,
        backgroundColor: COLORS.gray50,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: COLORS.gray200,
    },
});


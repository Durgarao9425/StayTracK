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
import { useTheme } from '../../context/ThemeContext';
import * as ImagePicker from 'expo-image-picker';
import StayLoader from '../../components/StayLoader';
import { COLORS, SHADOWS } from '../../theme/theme';
import showToast from '../../utils/toast';

const { height, width } = Dimensions.get('window');

// Student Card
export const StudentItem = ({ student, onDetails, onEdit, onToggleStatus, theme, togglingIds }) => {
    const isToggling = togglingIds.includes(student.id);
    const statusColor = student.status === "Inactive"
        ? { bg: "#FEE2E2", text: "#DC2626" }
        : { bg: "#D1FAE5", text: "#059669" };

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => onDetails(student)}
            style={styles.studentCard}
        >
            <View style={styles.studentCardHeader}>
                <View style={[styles.studentAvatar, { backgroundColor: `${theme.primary}10` }]}>
                    {student.profileImage ? (
                        <Image source={{ uri: student.profileImage }} style={styles.studentAvatarImage} />
                    ) : (
                        <Text style={[styles.studentAvatarText, { color: theme.primary }]}>
                            {student.name?.charAt(0) || 'S'}
                        </Text>
                    )}
                </View>
                <View style={styles.studentInfo}>
                    <Text style={styles.studentName} numberOfLines={1}>{student.name}</Text>
                    <Text style={styles.studentRoom}>Room {student.room} • Bed {student.bed || '-'}</Text>
                    <Text style={[styles.studentRent, { color: theme.primary }]}>₹{student.rent}/month</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
                    <Text style={[styles.statusText, { color: statusColor.text }]}>
                        {(student.status || 'ACTIVE').toUpperCase()}
                    </Text>
                </View>
            </View>

            <View style={styles.studentActions}>
                <TouchableOpacity
                    style={styles.actionButtonCall}
                    onPress={() => Linking.openURL(`tel:${student.phone}`)}
                >
                    <Ionicons name="call" size={18} color="#2563eb" />
                    <Text style={styles.actionButtonCallText}>Call</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionButtonEdit}
                    onPress={() => onEdit(student)}
                >
                    <Ionicons name="create-outline" size={18} color="#4b5563" />
                    <Text style={styles.actionButtonEditText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.actionButtonToggle,
                        student.status === 'Inactive' ? styles.actionButtonActivate : styles.actionButtonBlock
                    ]}
                    onPress={() => onToggleStatus(student)}
                    disabled={isToggling}
                >
                    {isToggling ? (
                        <StayLoader size="small" color={student.status === 'Inactive' ? "#059669" : "#DC2626"} />
                    ) : (
                        <>
                            <Ionicons
                                name={student.status === 'Inactive' ? "checkmark-circle" : "ban-outline"}
                                size={18}
                                color={student.status === 'Inactive' ? "#059669" : "#DC2626"}
                            />
                            <Text style={[
                                styles.actionButtonToggleText,
                                { color: student.status === 'Inactive' ? "#059669" : "#DC2626" }
                            ]}>
                                {student.status === 'Inactive' ? 'Activate' : 'Block'}
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
};

export const AddDrawer = ({ isVisible, onClose, onSave, theme, initialData, rooms, loadingRooms }) => {
    const slideAnim = useRef(new Animated.Value(height)).current;
    // ... previous logic
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        parentPhone: '',
        adhaar: '',
        room: '',
        bed: '',
        rent: ''
    });
    const [images, setImages] = useState({ profile: null, aadharFront: null, aadharBack: null });
    const [saving, setSaving] = useState(false);
    const [showDrawer, setShowDrawer] = useState(false);

    useEffect(() => {
        if (isVisible) {
            setShowDrawer(true);
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: height,
                duration: 300,
                useNativeDriver: true,
            }).start(() => setShowDrawer(false));
        }

        if (isVisible) {
            if (initialData) {
                setFormData({
                    name: initialData.name || '',
                    phone: initialData.phone || '',
                    parentPhone: initialData.parentPhone || '',
                    adhaar: initialData.adhaar || '',
                    room: initialData.room || '',
                    bed: initialData.bed || '',
                    rent: initialData.rent?.toString() || '',
                });
                setImages({
                    profile: initialData.profileImage || null,
                    aadharFront: initialData.aadharFrontImage || null,
                    aadharBack: initialData.aadharBackImage || null,
                });
            } else {
                handleReset();
            }
        }
    }, [isVisible, initialData]);

    const handleReset = () => {
        setFormData({ name: '', phone: '', parentPhone: '', adhaar: '', room: '', bed: '', rent: '' });
        setImages({ profile: null, aadharFront: null, aadharBack: null });
    };

    const pickImage = async (type) => {
        Alert.alert(
            "Upload Image",
            "Choose source",
            [
                {
                    text: "Camera",
                    onPress: async () => {
                        let res = await ImagePicker.launchCameraAsync({
                            allowsEditing: true,
                            aspect: type === 'profile' ? [1, 1] : [4, 3],
                            quality: 0.5,
                        });
                        if (!res.canceled) setImages(prev => ({ ...prev, [type]: res.assets[0].uri }));
                    }
                },
                {
                    text: "Gallery",
                    onPress: async () => {
                        let res = await ImagePicker.launchImageLibraryAsync({
                            mediaTypes: ImagePicker.MediaTypeOptions.Images,
                            allowsEditing: true,
                            aspect: type === 'profile' ? [1, 1] : [4, 3],
                            quality: 0.5,
                        });
                        if (!res.canceled) setImages(prev => ({ ...prev, [type]: res.assets[0].uri }));
                    }
                },
                { text: "Cancel", style: "cancel" }
            ]
        );
    };

    const handleSave = async () => {
        if (!formData.name || !formData.phone || !formData.room || !formData.rent) {
            showToast('Please fill in required fields', 'warning');
            return;
        }

        setSaving(true);
        try {
            await onSave(formData, images);
            onClose();
        } catch (error) {
            console.error(error);
            showToast('Error saving student', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (!showDrawer && !isVisible) return null;

    return (
        <View style={styles.drawerOverlay} pointerEvents={isVisible ? "auto" : "none"}>
            <TouchableOpacity
                style={styles.backdrop}
                activeOpacity={1}
                onPress={onClose}
            />
            <Animated.View style={[styles.bottomSheetContainer, { transform: [{ translateY: slideAnim }] }]}>
                <View style={styles.drawerHeader}>
                    <Text style={styles.drawerTitle}>{initialData ? 'Edit Student' : 'Add Student'}</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color="#1E293B" />
                    </TouchableOpacity>
                </View>

                <ScrollView
                    contentContainerStyle={styles.formScrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Profile Image */}
                    <View style={styles.profileUploadContainer}>
                        <TouchableOpacity onPress={() => pickImage('profile')} style={styles.profileUploadBtn}>
                            {images.profile ? (
                                <Image source={{ uri: images.profile }} style={styles.profilePreview} />
                            ) : (
                                <View style={styles.profilePlaceholder}>
                                    <Ionicons name="camera" size={32} color="#94A3B8" />
                                    <Text style={{ fontSize: 10, color: '#94A3B8', marginTop: 4 }}>Add Photo</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Full Name <Text style={{ color: 'red' }}>*</Text></Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Student's Name"
                            value={formData.name}
                            onChangeText={t => setFormData({ ...formData, name: t })}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Mobile Number <Text style={{ color: 'red' }}>*</Text></Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Student's Phone"
                            keyboardType="phone-pad"
                            maxLength={10}
                            value={formData.phone}
                            onChangeText={t => setFormData({ ...formData, phone: t.replace(/[^0-9]/g, '') })}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Select Room <Text style={{ color: 'red' }}>*</Text></Text>
                        {loadingRooms ? (
                            <View style={{ paddingVertical: 10, flexDirection: 'row', alignItems: 'center' }}>
                                <StayLoader size="small" />
                                <Text style={{ marginLeft: 10, color: COLORS.gray500 }}>Fetching rooms...</Text>
                            </View>
                        ) : rooms.length === 0 ? (
                            <Text style={{ color: COLORS.error, fontSize: 12 }}>No rooms available. Add rooms first.</Text>
                        ) : (
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                                {rooms.map(room => (
                                    <TouchableOpacity
                                        key={room.id}
                                        onPress={() => setFormData({ ...formData, room: room.number, rent: room.rent?.toString() || formData.rent })}
                                        style={[
                                            styles.roomChip,
                                            formData.room === room.number && { backgroundColor: theme.primary, borderColor: theme.primary }
                                        ]}
                                    >
                                        <Text style={[
                                            styles.roomChipText,
                                            formData.room === room.number && { color: '#fff' }
                                        ]}>Room {room.number}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        )}
                        <TextInput
                            style={[styles.input, { marginTop: 5 }]}
                            placeholder="Room Number"
                            value={formData.room}
                            onChangeText={t => setFormData({ ...formData, room: t })}
                        />
                    </View>

                    <View style={{ flexDirection: 'row', gap: 12 }}>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.label}>Bed No.</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. 1"
                                value={formData.bed}
                                onChangeText={t => setFormData({ ...formData, bed: t })}
                            />
                        </View>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.label}>Rent Amount <Text style={{ color: 'red' }}>*</Text></Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Monthly Rent"
                                keyboardType="numeric"
                                value={formData.rent}
                                onChangeText={t => setFormData({ ...formData, rent: t })}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Adhaar Number (12 Digits) <Text style={{ color: COLORS.error }}>*</Text></Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Adhaar Number"
                            keyboardType="numeric"
                            maxLength={12}
                            value={formData.adhaar}
                            onChangeText={t => setFormData({ ...formData, adhaar: t.replace(/[^0-9]/g, '') })}
                        />
                    </View>

                    {/* ID Uploads */}
                    <Text style={[styles.label, { marginTop: 10, marginBottom: 12 }]}>Aadhar Photo (Front & Back)</Text>
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                        <TouchableOpacity onPress={() => pickImage('aadharFront')} style={styles.idUploadBtn}>
                            {images.aadharFront ? (
                                <Image source={{ uri: images.aadharFront }} style={styles.idPreview} />
                            ) : (
                                <View style={styles.idPlaceholder}>
                                    <Ionicons name="id-card-outline" size={24} color="#94A3B8" />
                                    <Text style={styles.idUploadText}>Front View</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => pickImage('aadharBack')} style={styles.idUploadBtn}>
                            {images.aadharBack ? (
                                <Image source={{ uri: images.aadharBack }} style={styles.idPreview} />
                            ) : (
                                <View style={styles.idPlaceholder}>
                                    <Ionicons name="id-card-outline" size={24} color="#94A3B8" />
                                    <Text style={styles.idUploadText}>Back View</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={[styles.saveButtonMain, { backgroundColor: theme.primary }]}
                        onPress={handleSave}
                        disabled={saving}
                    >
                        <Text style={styles.saveButtonTextMain}>{saving ? 'Saving...' : (initialData ? 'Update Student' : 'Save Student')}</Text>
                    </TouchableOpacity>
                </ScrollView>
            </Animated.View>
        </View>
    );
};

export const StudentDetailsDrawer = ({ isVisible, onClose, student, theme }) => {
    const slideAnim = useRef(new Animated.Value(height)).current;
    const [showDrawer, setShowDrawer] = useState(false);

    useEffect(() => {
        if (isVisible) {
            setShowDrawer(true);
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: height,
                duration: 300,
                useNativeDriver: true,
            }).start(() => setShowDrawer(false));
        }
    }, [isVisible]);

    if (!showDrawer && !isVisible) return null;

    return (
        <View style={styles.drawerOverlay} pointerEvents={isVisible ? "auto" : "none"}>
            <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
            <Animated.View style={[styles.bottomSheetContainer, { transform: [{ translateY: slideAnim }] }]}>
                <View style={styles.drawerHeader}>
                    <Text style={styles.drawerTitle}>Student Details</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color="#1E293B" />
                    </TouchableOpacity>
                </View>

                {student && (
                    <ScrollView contentContainerStyle={styles.detailsScrollContent}>
                        <View style={styles.detailsProfile}>
                            <View style={[styles.detailsAvatar, { backgroundColor: `${theme.primary}15` }]}>
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
                                <Text style={[styles.infoValue, { color: theme.primary }]}>₹{student.rent}</Text>
                            </View>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>STATUS</Text>
                                <View style={[styles.statusTag, { backgroundColor: student.status === 'Inactive' ? '#FEE2E2' : '#DCFCE7' }]}>
                                    <Text style={[styles.statusTagText, { color: student.status === 'Inactive' ? '#DC2626' : '#15803D' }]}>
                                        {student.status || 'Active'}
                                    </Text>
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
                                        <Ionicons name="image-outline" size={24} color="#94A3B8" />
                                    </View>
                                )}
                            </View>
                            <View style={styles.documentCard}>
                                <Text style={styles.documentLabel}>Aadhar Back</Text>
                                {student.aadharBackImage ? (
                                    <Image source={{ uri: student.aadharBackImage }} style={styles.documentImage} />
                                ) : (
                                    <View style={styles.noDocument}>
                                        <Ionicons name="image-outline" size={24} color="#94A3B8" />
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

// Styles for components
const styles = StyleSheet.create({
    studentCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 16,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        ...SHADOWS.light,
    },
    studentCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    studentAvatar: {
        width: 52,
        height: 52,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    studentAvatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: 15,
    },
    studentAvatarText: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    studentInfo: {
        flex: 1,
    },
    studentName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 2,
    },
    studentRoom: {
        fontSize: 13,
        color: '#64748B',
        fontWeight: '500',
    },
    studentRent: {
        fontSize: 13,
        fontWeight: '700',
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '800',
    },
    studentActions: {
        flexDirection: 'row',
        gap: 10,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    actionButtonCall: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#EFF6FF',
        paddingVertical: 10,
        borderRadius: 12,
    },
    actionButtonCallText: {
        marginLeft: 6,
        color: '#2563EB',
        fontWeight: '700',
        fontSize: 14,
    },
    actionButtonEdit: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8FAFC',
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    actionButtonEditText: {
        marginLeft: 6,
        color: '#475569',
        fontWeight: '700',
        fontSize: 14,
    },
    actionButtonToggle: {
        flex: 1.2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 12,
    },
    actionButtonActivate: {
        backgroundColor: '#ECFDF5',
    },
    actionButtonBlock: {
        backgroundColor: '#FEF2F2',
    },
    actionButtonToggleText: {
        marginLeft: 6,
        fontWeight: '700',
        fontSize: 14,
    },
    drawerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
    },
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    bottomSheetContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: height * 0.85,
        backgroundColor: '#fff',
        borderTopLeftRadius: 35,
        borderTopRightRadius: 35,
        ...SHADOWS.heavy,
        elevation: 20,
    },
    drawerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    drawerTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#1E293B',
    },
    closeButton: {
        padding: 8,
        backgroundColor: '#F1F5F9',
        borderRadius: 12,
    },
    formScrollContent: {
        padding: 24,
        paddingBottom: 50,
    },
    profileUploadContainer: {
        alignItems: 'center',
        marginBottom: 25,
    },
    profileUploadBtn: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#F8FAFC',
        borderWidth: 2,
        borderColor: '#E2E8F0',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    profilePreview: {
        width: '100%',
        height: '100%',
    },
    profilePlaceholder: {
        alignItems: 'center',
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        color: '#475569',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#F8FAFC',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        fontSize: 15,
        color: '#1E293B',
    },
    idUploadBtn: {
        flex: 1,
        height: 110,
        borderRadius: 16,
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    idPreview: {
        width: '100%',
        height: '100%',
    },
    idPlaceholder: {
        alignItems: 'center',
    },
    idUploadText: {
        fontSize: 11,
        color: '#94A3B8',
        fontWeight: '600',
        marginTop: 6,
    },
    saveButtonMain: {
        marginTop: 30,
        padding: 18,
        borderRadius: 20,
        alignItems: 'center',
        ...SHADOWS.medium,
    },
    saveButtonTextMain: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
    },
    roomChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginRight: 10,
        backgroundColor: '#F8FAFC',
    },
    roomChipText: {
        fontWeight: '700',
        color: '#64748B',
    },
    detailsScrollContent: {
        padding: 24,
    },
    detailsProfile: {
        alignItems: 'center',
        marginBottom: 30,
    },
    detailsAvatar: {
        width: 110,
        height: 110,
        borderRadius: 55,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 4,
        borderColor: '#fff',
        ...SHADOWS.medium,
    },
    avatarLarge: {
        width: '100%',
        height: '100%',
        borderRadius: 55,
    },
    avatarTextLarge: {
        fontSize: 42,
        fontWeight: 'bold',
    },
    detailsName: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1E293B',
        marginBottom: 4,
    },
    detailsPhone: {
        fontSize: 16,
        color: '#64748B',
        fontWeight: '600',
    },
    infoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        backgroundColor: '#F8FAFC',
        borderRadius: 24,
        padding: 20,
        marginBottom: 30,
    },
    infoItem: {
        width: '50%',
        marginBottom: 20,
    },
    infoLabel: {
        fontSize: 11,
        fontWeight: '800',
        color: '#94A3B8',
        marginBottom: 6,
        letterSpacing: 0.5,
    },
    infoValue: {
        fontSize: 17,
        fontWeight: '700',
        color: '#1E293B',
    },
    statusTag: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 10,
        alignSelf: 'flex-start',
    },
    statusTagText: {
        fontSize: 12,
        fontWeight: '800',
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1E293B',
        marginBottom: 16,
    },
    documentsRow: {
        flexDirection: 'row',
        gap: 15,
    },
    documentCard: {
        flex: 1,
    },
    documentLabel: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '600',
        marginBottom: 8,
    },
    documentImage: {
        width: '100%',
        height: 120,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    noDocument: {
        width: '100%',
        height: 120,
        borderRadius: 16,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

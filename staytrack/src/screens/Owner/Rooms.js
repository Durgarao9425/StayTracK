import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Animated, Dimensions, Keyboard, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { collection, setDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '../../config/firebase';
import { useTheme } from '../../context/ThemeContext';
import ProfileHeader from '../../components/ProfileHeader';
import showToast from '../../utils/toast';
import StayLoader from '../../components/StayLoader';
import { ScreenWrapper, AppCard } from '../../components';
import { COLORS, FONTS, SPACING, SHADOWS, RADII } from '../../theme/theme';

const { width } = Dimensions.get('window');

// Room Card Component
const RoomItem = ({ room, onPress }) => (
    <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.9}
        className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100 flex-row justify-between items-center"
    >
        <View className="flex-row items-center">
            <View className="w-14 h-14 rounded-xl justify-center items-center mr-4" style={{ backgroundColor: room.color.bg }}>
                <Ionicons name="bed" size={26} color={room.color.text} />
            </View>
            <View>
                <Text className="text-lg font-bold text-gray-900">Room {room.number}</Text>
                <Text className="text-gray-500 text-sm">{room.hostelName}</Text>
                <Text className="text-gray-400 text-xs font-medium mt-1">
                    Capacity: {room.occupied}/{room.capacity}
                </Text>
            </View>
        </View>
        <View className={`px-3 py-1 rounded-full`} style={{ backgroundColor: room.color.bg }}>
            <Text className="text-xs font-bold" style={{ color: room.color.text }}>{room.status}</Text>
        </View>
    </TouchableOpacity>
);

// Drawer Modal Component
const AddRoomDrawer = ({ isVisible, onClose, onSave, hostels, theme, loadingHostels }) => {
    const slideAnim = useRef(new Animated.Value(width)).current;
    const [formData, setFormData] = useState({ number: '', floor: '', capacity: '' });
    const [selectedHostel, setSelectedHostel] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        Animated.timing(slideAnim, {
            toValue: isVisible ? 0 : width,
            duration: 300,
            useNativeDriver: true,
        }).start();

        if (!isVisible) {
            setTimeout(() => {
                setFormData({ number: '', floor: '', capacity: '' });
                setSelectedHostel(null);
            }, 300);
        }
    }, [isVisible]);

    const handleSave = async () => {
        if (!formData.number || !formData.capacity) {
            showToast('Please fill in Room Number and Capacity', 'warning');
            return;
        }
        if (!selectedHostel) {
            showToast('Please select a Hostel', 'warning');
            return;
        }

        setSaving(true);
        try {
            await onSave({ ...formData, hostelId: selectedHostel.id, hostelName: selectedHostel.name });
        } catch (error) {
            console.error("Save failed:", error);
        } finally {
            setSaving(false);
        }
    };

    if (!isVisible) return null;

    return (
        <View style={styles.drawerOverlay} pointerEvents={isVisible ? "auto" : "none"}>
            <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
            <Animated.View style={[styles.drawerContainer, { transform: [{ translateX: slideAnim }] }]}>
                <View style={styles.drawerContent}>
                    {/* Header */}
                    <View style={styles.drawerHeader}>
                        <Text style={styles.drawerTitle}>Add Room</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={COLORS.gray800} />
                        </TouchableOpacity>
                    </View>

                    {/* Form */}
                    <ScrollView contentContainerStyle={styles.formContainer}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Select Hostel <Text style={styles.required}>*</Text></Text>
                            {loadingHostels ? (
                                <View className="py-2 flex-row items-center">
                                    <StayLoader size="small" />
                                    <Text className="ml-2 text-gray-400 text-xs">Fetching hostels...</Text>
                                </View>
                            ) : hostels.length === 0 ? (
                                <View className="p-3 bg-red-50 rounded-xl border border-red-100">
                                    <Text className="text-red-500 font-bold text-xs">No hostels are available. Please add a hostel clearly</Text>
                                </View>
                            ) : (
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row' }}>
                                    {hostels.map(hostel => (
                                        <TouchableOpacity
                                            key={hostel.id}
                                            onPress={() => setSelectedHostel(hostel)}
                                            style={[
                                                styles.hostelChip,
                                                selectedHostel?.id === hostel.id && { backgroundColor: theme.primary, borderColor: theme.primary }
                                            ]}
                                        >
                                            <Text style={[
                                                styles.hostelChipText,
                                                selectedHostel?.id === hostel.id && { color: COLORS.white }
                                            ]}>{hostel.name}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            )}
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Room Number <Text style={styles.required}>*</Text></Text>
                            <TextInput
                                placeholder="e.g. A-101"
                                style={styles.input}
                                value={formData.number}
                                onChangeText={(text) => setFormData({ ...formData, number: text })}
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Floor</Text>
                            <TextInput
                                placeholder="Ground Floor"
                                style={styles.input}
                                value={formData.floor}
                                onChangeText={(text) => setFormData({ ...formData, floor: text })}
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Capacity <Text style={styles.required}>*</Text></Text>
                            <TextInput
                                placeholder="Number of beds"
                                keyboardType="numeric"
                                style={styles.input}
                                value={formData.capacity}
                                onChangeText={(text) => setFormData({ ...formData, capacity: text.replace(/[^0-9]/g, '') })}
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.saveButton, { backgroundColor: theme.primary }]}
                            onPress={handleSave}
                            disabled={saving}
                        >
                            <Text style={styles.saveButtonText}>{saving ? 'Creating...' : 'Create Room'}</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </Animated.View>
        </View>
    );
};

// Details Drawer
const RoomDetailsDrawer = ({ isVisible, onClose, room }) => {
    const slideAnim = useRef(new Animated.Value(width)).current;
    const [shouldRender, setShouldRender] = useState(isVisible);

    useEffect(() => {
        if (isVisible) setShouldRender(true);
        Animated.timing(slideAnim, {
            toValue: isVisible ? 0 : width,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            if (!isVisible) setShouldRender(false);
        });
    }, [isVisible]);

    if (!shouldRender && !isVisible) return null;

    return (
        <View style={styles.drawerOverlay} pointerEvents={isVisible ? "auto" : "none"}>
            <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
            <Animated.View style={[styles.drawerContainer, { transform: [{ translateX: slideAnim }] }]}>
                <View style={styles.drawerContent}>
                    <View style={styles.drawerHeader}>
                        <Text style={styles.drawerTitle}>Room Details</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={COLORS.gray800} />
                        </TouchableOpacity>
                    </View>

                    {room && (
                        <ScrollView contentContainerStyle={styles.detailsContent}>
                            <View style={[styles.detailsBadge, { backgroundColor: room.color.bg }]}>
                                <Ionicons name="bed" size={64} color={room.color.text} />
                                <Text style={styles.detailsRoomNumber}>Room {room.number}</Text>
                                <View style={styles.detailsStatusBadge}>
                                    <Text style={styles.detailsStatusText}>{room.status}</Text>
                                </View>
                            </View>

                            <View style={styles.statsGrid}>
                                <View style={styles.statCard}>
                                    <Text style={styles.statLabel}>CAPACITY</Text>
                                    <Text style={styles.statValue}>{room.capacity} Beds</Text>
                                </View>
                                <View style={styles.statCard}>
                                    <Text style={styles.statLabel}>OCCUPIED</Text>
                                    <Text style={styles.statValue}>{room.occupied} Students</Text>
                                </View>
                                <View style={styles.statCard}>
                                    <Text style={styles.statLabel}>FLOOR</Text>
                                    <Text style={styles.statValue}>{room.floor || 'Ground'}</Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={styles.editButton}
                                onPress={() => showToast('Edit feature coming soon!', 'warning')}
                            >
                                <Text style={styles.editButtonText}>Edit Room Details</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    )}
                </View>
            </Animated.View>
        </View>
    );
};

export default function Rooms({ navigation }) {
    const [isDrawerOpen, setDrawerOpen] = useState(false);
    const [rooms, setRooms] = useState([]);
    const [hostels, setHostels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [isDetailsOpen, setDetailsOpen] = useState(false);
    const [loadingHostels, setLoadingHostels] = useState(false);
    const { theme } = useTheme();

    useEffect(() => {
        loadData();
    }, []);

    const fetchHostels = async () => {
        setLoadingHostels(true);
        try {
            const userId = auth.currentUser?.uid;
            if (!userId) return;

            const hostelsRef = collection(db, 'hostels');
            const hQ = query(hostelsRef, where("userId", "==", userId));
            const hSnap = await getDocs(hQ);
            const hostelsList = hSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setHostels(hostelsList);
        } catch (error) {
            console.error('Error fetching hostels:', error);
        } finally {
            setLoadingHostels(false);
        }
    };

    const loadData = async () => {
        try {
            const userId = auth.currentUser?.uid;
            if (!userId) return;

            const roomsRef = collection(db, 'rooms');
            const q = query(roomsRef, where("userId", "==", userId));
            const snapshot = await getDocs(q);

            const roomsList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setRooms(roomsList);

            // Initial fetch of hostels
            fetchHostels();

        } catch (error) {
            console.error('Error loading rooms:', error);
            showToast('Error loading rooms', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveRoom = async (formData) => {
        try {
            const userId = auth.currentUser?.uid;
            if (!userId) {
                showToast('You must be logged in', 'error');
                return;
            }

            const newRoomRef = doc(collection(db, 'rooms'));
            const newRoom = {
                id: newRoomRef.id,
                ...formData,
                userId: userId,
                occupied: 0,
                status: 'Vacant',
                createdAt: new Date().toISOString()
            };

            await setDoc(newRoomRef, newRoom);
            setRooms([...rooms, newRoom]);
            showToast('Room created successfully!', 'success');
            setDrawerOpen(false);
        } catch (error) {
            console.error('Error adding room:', error);
            showToast('Failed to create room', 'error');
        }
    };

    const getRoomStatusColor = (room) => {
        const capacity = parseInt(room.capacity || 0);
        const occupied = parseInt(room.occupied || 0);

        if (occupied >= capacity) return { bg: '#FEE2E2', text: '#DC2626', status: 'Full' };
        if (occupied === 0) return { bg: '#DBEAFE', text: '#2563EB', status: 'Vacant' };
        return { bg: '#D1FAE5', text: '#059669', status: `${capacity - occupied} Beds Free` };
    };

    const filteredRooms = rooms.filter(r =>
        r.number.toString().includes(searchQuery) ||
        (r.hostelName && r.hostelName.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <View className="flex-1 bg-[#F5F7FA]">
            {/* Header Background */}
            <View className="absolute top-0 w-full h-[280px] rounded-b-[40px] z-0" style={{ backgroundColor: theme.primary }} />

            <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
                {/* Header */}
                <View className="px-5 pt-8 pb-6 z-10 w-full">
                    <View className="flex-row justify-between items-center mb-6">
                        <View className="flex-1 mr-4">
                            <Text className="text-white text-3xl font-bold">Rooms</Text>
                        </View>
                        <ProfileHeader navigation={navigation} />
                    </View>

                    {/* All Rooms Info Moved up */}
                    <View className="flex-row justify-between mb-4 items-end">
                        <Text className="text-white font-bold text-lg">All Rooms</Text>
                        <View className="bg-white/20 px-3 py-1 rounded-lg">
                            <Text className="text-white text-xs font-bold">{rooms.length} Total</Text>
                        </View>
                    </View>

                    {/* Search Bar */}
                    <View className="bg-white rounded-2xl flex-row items-center px-4 py-3 shadow-sm border border-gray-50">
                        <Ionicons name="search" size={20} color="#6b7280" />
                        <TextInput
                            placeholder="Search rooms..."
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
                    contentContainerStyle={{ paddingBottom: 20, paddingTop: 10 }}
                >

                    {loading ? (
                        <View className="h-60 justify-center items-center">
                            <StayLoader />
                            <Text className="text-gray-400 mt-4">Loading rooms...</Text>
                        </View>
                    ) : filteredRooms.length === 0 ? (
                        <View className="items-center mt-20">
                            <Ionicons name="bed-outline" size={64} color={COLORS.gray300} />
                            <Text className="text-gray-500 text-lg mt-4 font-medium">No rooms found</Text>
                        </View>
                    ) : (
                        filteredRooms.map((room) => {
                            const statusInfo = getRoomStatusColor(room);
                            const enhancedRoom = { ...room, color: statusInfo, status: statusInfo.status };
                            return (
                                <RoomItem
                                    key={room.id}
                                    room={enhancedRoom}
                                    onPress={() => {
                                        setSelectedRoom(enhancedRoom);
                                        setDetailsOpen(true);
                                    }}
                                />
                            );
                        })
                    )}
                </ScrollView>
            </SafeAreaView>

            {/* FAB */}
            {!isDrawerOpen && !selectedRoom && (
                <TouchableOpacity
                    onPress={() => {
                        fetchHostels();
                        setDrawerOpen(true);
                    }}
                    className="absolute bottom-24 right-6 w-14 h-14 rounded-full items-center justify-center shadow-2xl z-20"
                    style={{ backgroundColor: theme.primary, elevation: 5 }}
                    activeOpacity={0.9}
                >
                    <Ionicons name="add" size={32} color={COLORS.white} />
                </TouchableOpacity>
            )}

            {/* Drawers */}
            <AddRoomDrawer
                isVisible={isDrawerOpen}
                onClose={() => setDrawerOpen(false)}
                onSave={handleSaveRoom}
                hostels={hostels}
                theme={theme}
                loadingHostels={loadingHostels}
            />

            <RoomDetailsDrawer
                isVisible={isDetailsOpen}
                onClose={() => setDetailsOpen(false)}
                room={selectedRoom}
                theme={theme}
            />
        </View>
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
        paddingBottom: 20,
    },
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.m,
    },
    listTitle: {
        fontSize: 20,
        fontFamily: FONTS.bold,
        color: COLORS.gray900,
    },
    badge: {
        backgroundColor: COLORS.white,
        paddingHorizontal: SPACING.s,
        paddingVertical: 4,
        borderRadius: RADII.s,
        borderWidth: 1,
        borderColor: COLORS.gray200,
    },
    badgeText: {
        fontSize: 12,
        fontFamily: FONTS.bold,
        color: COLORS.gray500,
    },
    roomCard: {
        backgroundColor: COLORS.white,
        borderRadius: RADII.l,
        padding: SPACING.m,
        marginBottom: SPACING.m,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.gray100,
    },
    roomContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    roomIcon: {
        width: 48,
        height: 48,
        borderRadius: RADII.m,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.m,
    },
    roomInfo: {
        justifyContent: 'center',
    },
    roomNumber: {
        fontSize: 18,
        fontFamily: FONTS.bold,
        color: COLORS.gray900,
        marginBottom: 2,
    },
    roomCapacity: {
        fontSize: 12,
        fontFamily: FONTS.medium,
        color: COLORS.gray500,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: RADII.full,
    },
    statusText: {
        fontSize: 12,
        fontFamily: FONTS.bold,
    },
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
    // Drawer Styles
    drawerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 50,
        elevation: 50,
    },
    backdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    drawerContainer: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: width > 500 ? 400 : width * 0.85,
        backgroundColor: COLORS.white,
        ...SHADOWS.heavy,
    },
    drawerContent: {
        flex: 1,
    },
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
    formContainer: {
        padding: SPACING.l,
        paddingBottom: 20,
    },
    inputGroup: {
        marginBottom: SPACING.l,
    },
    label: {
        fontSize: 14,
        fontFamily: FONTS.bold,
        color: COLORS.gray700,
        marginBottom: SPACING.s,
    },
    required: {
        color: COLORS.error,
    },
    input: {
        backgroundColor: COLORS.gray50,
        padding: SPACING.m,
        borderRadius: RADII.m,
        borderWidth: 1,
        borderColor: COLORS.gray200,
        fontFamily: FONTS.medium,
        color: COLORS.gray900,
    },
    saveButton: {
        padding: SPACING.m,
        borderRadius: RADII.l,
        alignItems: 'center',
        marginTop: SPACING.m,
        ...SHADOWS.light,
    },
    saveButtonText: {
        color: COLORS.white,
        fontFamily: FONTS.bold,
        fontSize: 16,
    },
    // Details Styles
    detailsContent: {
        padding: SPACING.l,
    },
    detailsBadge: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.xl,
        borderRadius: RADII.xl,
        marginBottom: SPACING.xl,
    },
    detailsRoomNumber: {
        fontSize: 32,
        fontFamily: FONTS.bold,
        color: COLORS.gray900,
        marginTop: SPACING.m,
    },
    detailsStatusBadge: {
        backgroundColor: 'rgba(255,255,255,0.9)',
        paddingHorizontal: SPACING.m,
        paddingVertical: 6,
        borderRadius: RADII.full,
        marginTop: SPACING.m,
    },
    detailsStatusText: {
        fontSize: 14,
        fontFamily: FONTS.bold,
        color: COLORS.gray800,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: SPACING.xl,
    },
    statCard: {
        width: '48%',
        backgroundColor: COLORS.gray50,
        padding: SPACING.m,
        borderRadius: RADII.l,
        marginBottom: SPACING.m,
    },
    statLabel: {
        fontSize: 12,
        fontFamily: FONTS.bold,
        color: COLORS.gray400,
        marginBottom: 4,
    },
    statValue: {
        fontSize: 18,
        fontFamily: FONTS.bold,
        color: COLORS.gray900,
    },
    editButton: {
        borderWidth: 1,
        borderColor: COLORS.success,
        padding: SPACING.m,
        borderRadius: RADII.l,
        alignItems: 'center',
    },
    editButtonText: {
        color: COLORS.success,
        fontFamily: FONTS.bold,
        fontSize: 16,
        fontSize: 16,
    },
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
});


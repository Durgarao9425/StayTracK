import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Animated,
    Dimensions,
    Keyboard,
    StyleSheet,
    Platform,
    ActivityIndicator,
    SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import ProfileHeader from '../../components/ProfileHeader';
import { collection, setDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '../../config/firebase';
import showToast from '../../utils/toast';
import StayLoader from '../../components/StayLoader';

const { height, width } = Dimensions.get('window');

const HostelCard = ({ hostel, onPress }) => (
    <TouchableOpacity
        style={styles.hostelCard}
        onPress={onPress}
        activeOpacity={0.7}
    >
        <View style={styles.cardHeader}>
            <View style={styles.cardIconTitle}>
                <View style={[styles.iconBox, { backgroundColor: '#eff6ff' }]}>
                    <Ionicons name="business" size={24} color="#2563eb" />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.hostelName} numberOfLines={1}>{hostel.name}</Text>
                    <Text style={styles.hostelAddress} numberOfLines={1}>{hostel.address}</Text>
                </View>
            </View>
            <View style={styles.statusBadge}>
                <Text style={styles.statusText}>Active</Text>
            </View>
        </View>

        <View style={styles.cardFooter}>
            <View style={styles.statBox}>
                <Text style={styles.statLabel}>Capacity</Text>
                <Text style={styles.statValue}>{hostel.capacity} Beds</Text>
            </View>
            <View style={styles.statBox}>
                <Text style={styles.statLabel}>Contact</Text>
                <Text style={styles.statValue}>{hostel.contact}</Text>
            </View>
        </View>
    </TouchableOpacity>
);

const AddHostelDrawer = ({ isVisible, onClose, onSave, theme }) => {
    const slideAnim = useRef(new Animated.Value(height)).current;
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        contact: '',
        capacity: ''
    });
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
            setFormData({ name: '', address: '', contact: '', capacity: '' });
        }
    }, [isVisible]);

    const handleSave = async () => {
        if (!formData.name || !formData.address || !formData.contact || !formData.capacity) {
            showToast('Please fill in all required fields', 'warning');
            return;
        }

        setSaving(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error("Save failed:", error);
            showToast('Failed to save hostel', 'error');
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
                    <Text style={styles.drawerTitle}>Add Hostel</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color="#1E293B" />
                    </TouchableOpacity>
                </View>

                <ScrollView
                    contentContainerStyle={styles.formScrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Hostel Name <Text style={{ color: 'red' }}>*</Text></Text>
                        <TextInput
                            placeholder="e.g. Sunrise Boys Hostel"
                            style={styles.input}
                            value={formData.name}
                            onChangeText={(text) => setFormData({ ...formData, name: text })}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Address <Text style={{ color: 'red' }}>*</Text></Text>
                        <TextInput
                            placeholder="Full address"
                            style={[styles.input, styles.textArea]}
                            value={formData.address}
                            onChangeText={(text) => setFormData({ ...formData, address: text })}
                            multiline
                            numberOfLines={3}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Contact Number <Text style={{ color: 'red' }}>*</Text></Text>
                        <TextInput
                            placeholder="Phone number"
                            keyboardType="phone-pad"
                            maxLength={10}
                            style={styles.input}
                            value={formData.contact}
                            onChangeText={(text) => setFormData({ ...formData, contact: text.replace(/[^0-9]/g, '') })}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Total Capacity <Text style={{ color: 'red' }}>*</Text></Text>
                        <TextInput
                            placeholder="Total beds"
                            keyboardType="numeric"
                            style={styles.input}
                            value={formData.capacity}
                            onChangeText={(text) => setFormData({ ...formData, capacity: text.replace(/[^0-9]/g, '') })}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.saveButtonMain, { backgroundColor: theme.primary }]}
                        onPress={handleSave}
                        disabled={saving}
                    >
                        {saving ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.saveButtonTextMain}>Create Hostel</Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </Animated.View>
        </View>
    );
};

export default function Hostels({ navigation }) {
    const [isDrawerOpen, setDrawerOpen] = useState(false);
    const [hostels, setHostels] = useState([]);
    const [loading, setLoading] = useState(true);
    const { theme } = useTheme();

    useEffect(() => {
        loadHostels();
    }, []);

    const loadHostels = async () => {
        try {
            const userId = auth.currentUser?.uid;
            if (!userId) {
                setLoading(false);
                return;
            }

            const hostelsRef = collection(db, 'hostels');
            const q = query(hostelsRef, where('userId', '==', userId));
            const snapshot = await getDocs(q);
            const hostelsList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setHostels(hostelsList);
        } catch (error) {
            console.error('Error loading hostels:', error);
            showToast('Error loading hostels', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveHostel = async (formData) => {
        const userId = auth.currentUser?.uid;
        if (!userId) {
            showToast('Please login first', 'error');
            return;
        }

        try {
            const newHostelRef = doc(collection(db, 'hostels'));
            const newHostel = {
                id: newHostelRef.id,
                ...formData,
                userId: userId,
                createdAt: new Date().toISOString()
            };

            await setDoc(newHostelRef, newHostel);
            setHostels([...hostels, newHostel]);
            showToast('Hostel created successfully!', 'success');
        } catch (error) {
            console.error('Error adding hostel:', error);
            throw error;
        }
    };

    return (
        <View style={styles.container}>
            <View style={[styles.headerBg, { backgroundColor: theme.primary }]} />

            <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
                <View style={styles.headerContent}>
                    <View style={styles.topRow}>
                        <View style={styles.topLeft}>
                            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                                <Ionicons name="arrow-back" size={24} color="white" />
                            </TouchableOpacity>
                            <Text style={styles.headerTitle}>Hostels</Text>
                        </View>
                        <ProfileHeader navigation={navigation} />
                    </View>

                    <View style={styles.searchContainer}>
                        <Ionicons name="search" size={20} color="#9ca3af" />
                        <TextInput
                            placeholder="Search hostels..."
                            placeholderTextColor="#9ca3af"
                            style={styles.searchInput}
                        />
                    </View>
                </View>

                <ScrollView
                    style={styles.mainScroll}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    <View style={styles.listHeader}>
                        <Text style={styles.listTitle}>My Hostels</Text>
                        <View style={styles.countBadge}>
                            <Text style={styles.countText}>{hostels.length} total</Text>
                        </View>
                    </View>

                    {loading ? (
                        <View style={styles.loaderCenter}>
                            <ActivityIndicator size="large" color={theme.primary} />
                        </View>
                    ) : hostels.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="business-outline" size={64} color="#d1d5db" />
                            <Text style={styles.emptyText}>No hostels added yet</Text>
                        </View>
                    ) : (
                        hostels.map(hostel => (
                            <HostelCard
                                key={hostel.id}
                                hostel={hostel}
                                onPress={() => console.log('Pressed:', hostel.name)}
                            />
                        ))
                    )}
                </ScrollView>
            </SafeAreaView>

            <AddHostelDrawer
                isVisible={isDrawerOpen}
                onClose={() => setDrawerOpen(false)}
                onSave={handleSaveHostel}
                theme={theme}
            />

            <TouchableOpacity
                style={[styles.fab, { backgroundColor: theme.primary }]}
                onPress={() => setDrawerOpen(true)}
                activeOpacity={0.8}
            >
                <Ionicons name="add" size={30} color="white" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
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
    headerContent: {
        paddingHorizontal: 24,
        paddingTop: 40,
        paddingBottom: 24,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    topLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backBtn: {
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: 'white',
    },
    searchContainer: {
        backgroundColor: 'white',
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    searchInput: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
        color: '#1f2937',
    },
    mainScroll: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 20, // Increased to avoid cut-off
        paddingBottom: 100, // Sufficient bottom padding
    },
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingVertical: 5, // Avoid clipping
    },
    listTitle: {
        fontSize: 22, // Slightly larger as requested
        fontWeight: '800',
        color: '#111827',
    },
    countBadge: {
        backgroundColor: 'white',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#f3f4f6',
    },
    countText: {
        fontSize: 12,
        color: '#6b7280',
        fontWeight: 'bold',
    },
    hostelCard: {
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#f3f4f6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    cardIconTitle: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    hostelName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    hostelAddress: {
        fontSize: 12,
        color: '#6b7280',
        marginTop: 2,
    },
    statusBadge: {
        backgroundColor: '#f0fdf4',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#15803d',
    },
    cardFooter: {
        flexDirection: 'row',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#f9fafb',
    },
    statBox: {
        marginRight: 32,
    },
    statLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#9ca3af',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    statValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#374151',
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 24,
        width: 56, // Reduced size
        height: 56, // Reduced size
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
        zIndex: 1000,
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
        height: height * 0.7, // 70% height
        backgroundColor: '#fff',
        borderTopLeftRadius: 35,
        borderTopRightRadius: 35,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 20,
    },
    drawerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    drawerTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#111827',
    },
    closeButton: {
        padding: 8,
        backgroundColor: '#f3f4f6',
        borderRadius: 12,
    },
    formScrollContent: {
        padding: 24,
        paddingBottom: 50,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#111827',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    saveButtonMain: {
        marginTop: 20,
        paddingVertical: 18,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    saveButtonTextMain: {
        color: 'white',
        fontSize: 16,
        fontWeight: '800',
    },
    loaderCenter: {
        height: 200,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 60,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 18,
        color: '#9ca3af',
    },
});

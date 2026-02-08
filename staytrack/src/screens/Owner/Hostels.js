import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Animated, Dimensions, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import ProfileHeader from '../../components/ProfileHeader';
import { collection, addDoc, setDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '../../config/firebase';
import showToast from '../../utils/toast';
import StayLoader from '../../components/StayLoader';

const { height, width } = Dimensions.get('window');

const HostelCard = ({ hostel, onPress }) => (
    <TouchableOpacity
        className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100 active:scale-95 transition-transform"
        onPress={onPress}
    >
        <View className="flex-row items-start justify-between mb-2">
            <View className="flex-row items-center">
                <View className="w-12 h-12 rounded-xl bg-blue-100 items-center justify-center mr-4">
                    <Ionicons name="business" size={24} color="#2563eb" />
                </View>
                <View>
                    <Text className="text-gray-900 font-bold text-lg">{hostel.name}</Text>
                    <Text className="text-gray-500 text-xs font-medium">{hostel.address}</Text>
                </View>
            </View>
            <View className="bg-green-100 px-3 py-1 rounded-full">
                <Text className="text-green-700 text-xs font-bold">Active</Text>
            </View>
        </View>

        <View className="flex-row mt-3 pt-3 border-t border-gray-50">
            <View className="mr-6">
                <Text className="text-gray-400 text-xs font-bold uppercase">Capacity</Text>
                <Text className="text-gray-800 font-bold">{hostel.capacity} Beds</Text>
            </View>
            <View>
                <Text className="text-gray-400 text-xs font-bold uppercase">Contact</Text>
                <Text className="text-gray-800 font-bold">{hostel.contact}</Text>
            </View>
        </View>
    </TouchableOpacity>
);

// Add Hostel Drawer - SLIDES FROM RIGHT
const AddHostelDrawer = ({ isVisible, onClose, onSave, theme }) => {
    const slideAnim = useRef(new Animated.Value(width)).current;
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        contact: '',
        capacity: ''
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isVisible) {
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: width,
                duration: 300,
                useNativeDriver: true,
            }).start();
            setTimeout(() => {
                setFormData({ name: '', address: '', contact: '', capacity: '' });
            }, 300);
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
        } catch (error) {
            console.error("Save failed:", error);
        } finally {
            setSaving(false);
        }
    };

    if (!isVisible) return null;

    return (
        <View className="absolute inset-0 z-50" pointerEvents={isVisible ? "auto" : "none"}>
            {/* Backdrop - Blocks all interaction including scroll */}
            {isVisible && (
                <View className="absolute inset-0">
                    <TouchableOpacity
                        className="absolute inset-0 bg-black/50"
                        activeOpacity={1}
                        onPress={onClose}
                    />
                </View>
            )}

            <Animated.View
                style={{
                    transform: [{ translateX: slideAnim }],
                    width: width > 500 ? 400 : width * 0.95
                }}
                className="absolute right-0 top-0 bottom-0 bg-white shadow-2xl"
            >
                <SafeAreaView className="h-full" edges={['bottom']}>
                    <View className="h-full">
                        {/* Header */}
                        <View className="flex-row justify-between items-center px-6 pt-6 pb-4 border-b border-gray-100">
                            <Text className="text-2xl font-bold text-gray-800">Add Hostel</Text>
                            <TouchableOpacity onPress={onClose} className="bg-gray-100 p-2 rounded-full">
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        {/* Form Fields - Scrollable */}
                        <View className="flex-1">
                            <ScrollView
                                showsVerticalScrollIndicator={false}
                                keyboardShouldPersistTaps="handled"
                                onScrollBeginDrag={() => Keyboard.dismiss()}
                                contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 }}
                            >
                                <View className="space-y-5">
                                    <View>
                                        <Text className="text-gray-700 text-sm font-semibold mb-2">Hostel Name <Text className="text-red-500">*</Text></Text>
                                        <TextInput
                                            placeholder="e.g. Sunrise Boys Hostel"
                                            className="bg-gray-50 px-4 py-3.5 rounded-xl border border-gray-200 text-gray-800 font-medium"
                                            value={formData.name}
                                            onChangeText={(text) => setFormData({ ...formData, name: text })}
                                        />
                                    </View>

                                    <View>
                                        <Text className="text-gray-700 text-sm font-semibold mb-2">Address <Text className="text-red-500">*</Text></Text>
                                        <TextInput
                                            placeholder="Full address"
                                            className="bg-gray-50 px-4 py-3.5 rounded-xl border border-gray-200 text-gray-800 font-medium"
                                            value={formData.address}
                                            onChangeText={(text) => setFormData({ ...formData, address: text })}
                                            multiline
                                        />
                                    </View>

                                    <View>
                                        <Text className="text-gray-700 text-sm font-semibold mb-2">Contact Number <Text className="text-red-500">*</Text></Text>
                                        <TextInput
                                            placeholder="Phone number"
                                            keyboardType="numeric"
                                            maxLength={10}
                                            className="bg-gray-50 px-4 py-3.5 rounded-xl border border-gray-200 text-gray-800 font-medium"
                                            value={formData.contact}
                                            onChangeText={(text) => setFormData({ ...formData, contact: text.replace(/[^0-9]/g, '') })}
                                        />
                                    </View>

                                    <View>
                                        <Text className="text-gray-700 text-sm font-semibold mb-2">Total Capacity <Text className="text-red-500">*</Text></Text>
                                        <TextInput
                                            placeholder="Total beds"
                                            keyboardType="numeric"
                                            className="bg-gray-50 px-4 py-3.5 rounded-xl border border-gray-200 text-gray-800 font-medium"
                                            value={formData.capacity}
                                            onChangeText={(text) => setFormData({ ...formData, capacity: text.replace(/[^0-9]/g, '') })}
                                        />
                                    </View>
                                </View>
                            </ScrollView>
                        </View>

                        {/* Fixed Button at Bottom */}
                        <View className="px-6 pb-8 pt-4 bg-white border-t border-gray-100">
                            <TouchableOpacity
                                className="py-4 rounded-xl shadow-lg"
                                style={{ backgroundColor: theme.primary }}
                                onPress={handleSave}
                                disabled={saving}
                            >
                                <Text className="text-white text-center font-bold text-base">
                                    {saving ? 'Creating...' : 'Create Hostel'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </SafeAreaView>

                {/* Full-Page Loader Overlay */}
                {saving && (
                    <View className="absolute inset-0 bg-black/50 items-center justify-center z-50">
                        <View className="bg-white p-6 rounded-2xl items-center">
                            <StayLoader />
                            <Text className="text-gray-800 font-semibold mt-4">Creating Hostel...</Text>
                        </View>
                    </View>
                )}
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
            setDrawerOpen(false);
        } catch (error) {
            console.error('Error adding hostel:', error);
            showToast('Failed to create hostel', 'error');
        }
    };

    return (
        <View className="flex-1 bg-[#F5F7FA]">
            {/* Header Background */}
            <View className="absolute top-0 w-full h-[220px] rounded-b-[40px] z-0" style={{ backgroundColor: theme.primary }} />

            <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
                {/* Header */}
                <View className="px-6 pt-2 pb-6 z-10 w-full">
                    <View className="flex-row justify-between items-center mb-6">
                        <View className="flex-row items-center">
                            <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
                                <Ionicons name="arrow-back" size={28} color="white" />
                            </TouchableOpacity>
                            <Text className="text-white text-3xl font-bold">Hostels</Text>
                        </View>
                        <ProfileHeader navigation={navigation} />
                    </View>

                    <View className="bg-white rounded-2xl flex-row items-center px-4 py-3 shadow-lg shadow-teal-900/10">
                        <Ionicons name="search" size={20} color="#9ca3af" />
                        <TextInput
                            placeholder="Search hostels..."
                            placeholderTextColor="#9ca3af"
                            className="flex-1 ml-3 text-gray-800 font-medium text-base"
                        />
                    </View>
                </View>

                {/* Content */}
                <ScrollView
                    className="flex-1 px-5"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 130, paddingTop: 10 }}
                >
                    <View className="flex-row justify-between mb-4 items-end">
                        <Text className="text-gray-900 font-bold text-lg">My Hostels</Text>
                        <Text className="text-gray-400 text-xs font-bold bg-white px-2 py-1 rounded-lg border border-gray-100">{hostels.length} Total</Text>
                    </View>

                    {loading ? (
                        <View className="h-60 justify-center items-center">
                            <StayLoader />
                            <Text className="text-center text-gray-400 mt-4">Loading hostels...</Text>
                        </View>
                    ) : hostels.length === 0 ? (
                        <View className="items-center mt-20">
                            <Ionicons name="business-outline" size={64} color="#9ca3af" />
                            <Text className="text-gray-500 text-lg mt-4">No hostels added yet</Text>
                        </View>
                    ) : (
                        hostels.map(hostel => (
                            <HostelCard
                                key={hostel.id}
                                hostel={hostel}
                                onPress={() => console.log('Hostel pressed:', hostel.name)}
                            />
                        ))
                    )}
                </ScrollView>
            </SafeAreaView>

            {/* Add Drawer */}
            <AddHostelDrawer
                isVisible={isDrawerOpen}
                onClose={() => setDrawerOpen(false)}
                onSave={handleSaveHostel}
                theme={theme}
            />


            {/* FAB - Hidden when drawer is open */}
            {!isDrawerOpen && (
                <TouchableOpacity
                    onPress={() => setDrawerOpen(true)}
                    className="absolute bottom-24 right-6 w-14 h-14 rounded-full items-center justify-center shadow-xl elevation-10 z-20"
                    style={{ backgroundColor: theme.primary }}
                    activeOpacity={0.9}
                >
                    <Ionicons name="add" size={32} color="white" />
                </TouchableOpacity>
            )}
        </View>
    );
}

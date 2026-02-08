import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { CommonActions } from '@react-navigation/native';
import { useTheme } from "../../context/ThemeContext";
import ProfileHeader from "../../components/ProfileHeader";
import MenuCard from "../../components/MenuCard";
import * as ImagePicker from 'expo-image-picker';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { uploadFile } from '../../services/storage';

import showToast from '../../utils/toast';

export default function Profile({ navigation }) {
    const { theme } = useTheme();
    const [profileImage, setProfileImage] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        const user = auth.currentUser;
        if (user) {
            try {
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setUserData({
                        ...data,
                        displayName: data.displayName || data.name || user.displayName || user.email?.split('@')[0] || 'User',
                        email: data.email || user.email
                    });
                    if (data.profileImage) {
                        setProfileImage(data.profileImage);
                    }
                } else {
                    // If no Firestore doc, use auth data
                    setUserData({
                        displayName: user.displayName || user.email?.split('@')[0] || 'User',
                        email: user.email,
                        role: 'Owner'
                    });
                }
            } catch (error) {
                console.error("Error fetching user profile:", error);
                // Fallback to auth data
                setUserData({
                    displayName: user.displayName || user.email?.split('@')[0] || 'User',
                    email: user.email,
                    role: 'Owner'
                });
            }
        }
    };

    const handleImagePick = async () => {
        const uploadFromCamera = async () => {
            try {
                let result = await ImagePicker.launchCameraAsync({
                    allowsEditing: true,
                    aspect: [1, 1],
                    quality: 0.5,
                });
                if (!result.canceled) await uploadProfileImage(result.assets[0].uri);
            } catch (e) {
                console.error(e);
                showToast("Camera error", 'error');
            }
        };

        const uploadFromGallery = async () => {
            try {
                let result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: true,
                    aspect: [1, 1],
                    quality: 0.5,
                });
                if (!result.canceled) await uploadProfileImage(result.assets[0].uri);
            } catch (e) {
                console.error(e);
            }
        };

        if (Platform.OS === 'web') {
            uploadFromGallery();
        } else {
            Alert.alert(
                "Change Profile Photo",
                "Choose an option",
                [
                    { text: "Camera", onPress: uploadFromCamera },
                    { text: "Gallery", onPress: uploadFromGallery },
                    { text: "Cancel", style: "cancel" }
                ]
            );
        }
    };

    const uploadProfileImage = async (uri) => {
        const user = auth.currentUser;
        if (!user) return;

        setLoading(true);
        try {
            const imageUrl = await uploadFile(uri, `users/${user.uid}/profile.jpg`);

            // Update Firestore
            const userRef = doc(db, "users", user.uid);
            // Check if doc exists, if not create basic one, else update
            const docSnap = await getDoc(userRef);

            if (docSnap.exists()) {
                await updateDoc(userRef, { profileImage: imageUrl });
            } else {
                await setDoc(userRef, {
                    profileImage: imageUrl,
                    email: user.email,
                    displayName: user.displayName || 'User',
                    role: 'Owner'
                });
            }

            setProfileImage(imageUrl);
            showToast("Profile photo updated!", 'success');
        } catch (error) {
            console.error("Error uploading profile image:", error);
            showToast("Failed to upload image", 'error');
        } finally {
            setLoading(false);
        }
    };

    const menuItems = [
        { id: 1, icon: "business-outline", title: "Hostel Details", subtitle: "StayTrack Hostel", color: theme.primary },
        { id: 2, icon: "trending-up-outline", title: "Monthly Revenue", subtitle: "₹1,24,500", color: "#10b981" },
        { id: 3, icon: "document-text-outline", title: "Pending Bills", subtitle: "₹45,200 • 12 Bills", color: "#f59e0b" },
        { id: 4, icon: "wallet-outline", title: "Monthly Expenses", subtitle: "₹68,300", color: "#ef4444", screen: "Expenses" },
        { id: 5, icon: "construct-outline", title: "Maintenance", subtitle: "7 Active • 2 Urgent", color: "#a855f7" },
        { id: 6, icon: "bed-outline", title: "Rooms", subtitle: "24 Total Rooms", color: "#3b82f6" },
        { id: 7, icon: "people-outline", title: "Occupancy", subtitle: "87% Occupied", color: "#10b981" },
        { id: 8, icon: "newspaper-outline", title: "Reports", subtitle: "View analytics & reports", color: "#3b82f6" },
        { id: 9, icon: "cash-outline", title: "Payments", subtitle: "Manage transactions", color: "#10b981" },
        { id: 10, icon: "notifications-outline", title: "Notifications", subtitle: "View alerts & updates", color: "#f59e0b" },
    ];

    // Start of new UI render
    return (
        <View className="flex-1 bg-[#F5F7FA]">
            {/* Header Background - Adjusted height for overlap effect */}
            <View className="absolute top-0 w-full h-[200px] rounded-b-[40px] z-0" style={{ backgroundColor: theme.primary }} />

            <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
                {/* Fixed Header Content (Title + Card) */}
                <View className="z-10 w-full mb-4">
                    {/* Top Bar */}
                    <View className="px-6 pt-4 pb-8">
                        <Text className="text-white text-3xl font-bold">Profile</Text>
                    </View>

                    {/* Fixed Profile Card - Reverted to Horizontal Layout */}
                    <View className="mx-5 bg-white rounded-[24px] p-5 flex-row items-center shadow-lg border border-gray-100">
                        <TouchableOpacity onPress={handleImagePick} disabled={loading}>
                            <View className="w-20 h-20 rounded-full bg-gray-50 justify-center items-center overflow-hidden border-2 border-gray-100 shadow-sm">
                                {loading ? (
                                    <Ionicons name="refresh" size={24} color={theme.primary} className="animate-spin" />
                                ) : profileImage ? (
                                    <Image source={{ uri: profileImage }} className="w-full h-full" />
                                ) : (
                                    <Text className="font-bold text-2xl" style={{ color: theme.primary }}>
                                        {userData?.displayName?.charAt(0) || userData?.name?.charAt(0) || 'S'}
                                    </Text>
                                )}
                            </View>
                            <View className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-sm border border-gray-100">
                                <Ionicons name="camera" size={12} color={theme.primary} />
                            </View>
                        </TouchableOpacity>

                        <View className="flex-1 ml-4 justify-center">
                            <View className="flex-row justify-between items-start">
                                <View>
                                    <Text className="text-lg font-bold text-gray-900">{userData?.displayName || userData?.name || 'Shaif Hassen'}</Text>
                                    <Text className="text-gray-500 text-sm mt-0.5">{userData?.role || 'Hostel Owner'}</Text>
                                </View>
                                <TouchableOpacity onPress={() => showToast('Edit Profile coming soon!', 'info')}>
                                    <Text className="text-xs font-bold px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg">Edit</Text>
                                </TouchableOpacity>
                            </View>

                            <View className="flex-row items-center mt-3">
                                <View className="flex-row items-center mr-4">
                                    <View className="w-2 h-2 rounded-full bg-teal-400 mr-1.5" />
                                    <Text className="text-xs text-gray-500 font-medium">3 hostels</Text>
                                </View>
                                <View className="flex-row items-center">
                                    <View className="w-2 h-2 rounded-full bg-blue-400 mr-1.5" />
                                    <Text className="text-xs text-gray-500 font-medium">4 pending fees</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Scrollable Content */}
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    className="flex-1"
                    contentContainerStyle={{ paddingBottom: 130, paddingTop: 10 }}
                >
                    {/* 3. Overview Section (Renamed from Quick Links) */}
                    <View className="px-6">
                        <Text className="text-lg font-bold mb-4 ml-1" style={{ color: theme.primary }}>Overview</Text>

                        <View className="flex-row flex-wrap justify-between">
                            {/* Hostel Card */}
                            <TouchableOpacity
                                className="w-[48%] bg-white p-4 rounded-3xl mb-4 border border-blue-50 shadow-sm"
                                onPress={() => navigation.navigate('Hostels')}
                            >
                                <View className="w-12 h-12 bg-blue-50 rounded-2xl items-center justify-center mb-4">
                                    <Ionicons name="business" size={24} color="#3b82f6" />
                                </View>
                                <Text className="font-bold text-gray-800 text-lg mb-1">Hostels</Text>
                                <View className="bg-blue-100 px-2 py-1 rounded-md self-start">
                                    <Text className="text-blue-700 text-[10px] font-bold">3 ACTIVE</Text>
                                </View>
                            </TouchableOpacity>

                            {/* Fees Card */}
                            <TouchableOpacity
                                className="w-[48%] bg-white p-4 rounded-3xl mb-4 border border-teal-50 shadow-sm"
                                onPress={() => navigation.navigate('Payments')}
                            >
                                <View className="w-12 h-12 bg-teal-50 rounded-2xl items-center justify-center mb-4">
                                    <Ionicons name="cash" size={24} color="#14b8a6" />
                                </View>
                                <Text className="font-bold text-gray-800 text-lg mb-1">Fees</Text>
                                <View className="bg-teal-100 px-2 py-1 rounded-md self-start">
                                    <Text className="text-teal-700 text-[10px] font-bold">4 PENDING</Text>
                                </View>
                            </TouchableOpacity>

                            {/* Expenses Card */}
                            <TouchableOpacity
                                className="w-[48%] bg-white p-4 rounded-3xl border border-indigo-50 shadow-sm"
                                onPress={() => navigation.navigate('Expenses')}
                            >
                                <View className="w-12 h-12 bg-indigo-50 rounded-2xl items-center justify-center mb-4">
                                    <Ionicons name="wallet" size={24} color="#6366f1" />
                                </View>
                                <Text className="font-bold text-gray-800 text-lg mb-1">Expenses</Text>
                                <View className="bg-indigo-100 px-2 py-1 rounded-md self-start">
                                    <Text className="text-indigo-700 text-[10px] font-bold">THIS MONTH</Text>
                                </View>
                            </TouchableOpacity>

                            {/* Income Card */}
                            <TouchableOpacity className="w-[48%] bg-white p-4 rounded-3xl border border-amber-50 shadow-sm">
                                <View className="w-12 h-12 bg-amber-50 rounded-2xl items-center justify-center mb-4">
                                    <Ionicons name="trending-up" size={24} color="#f59e0b" />
                                </View>
                                <Text className="font-bold text-gray-800 text-lg mb-1">Income</Text>
                                <View className="bg-amber-100 px-2 py-1 rounded-md self-start">
                                    <Text className="text-amber-700 text-[10px] font-bold">Daily</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* 4. Account Section */}
                    <View className="mt-8 px-6">
                        <Text className="text-gray-500 text-sm font-semibold mb-4 ml-1">Account</Text>

                        <View className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                            <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-100">
                                <Ionicons name="notifications" size={22} color="#0f766e" />
                                <Text className="flex-1 ml-4 text-gray-700 font-semibold text-base">Notifications</Text>
                                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                            </TouchableOpacity>

                            <TouchableOpacity className="flex-row items-center p-4">
                                <Ionicons name="key" size={22} color="#0f766e" />
                                <Text className="flex-1 ml-4 text-gray-700 font-semibold text-base">Password</Text>
                                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* 5. Settings Section */}
                    <View className="mt-8 px-6 mb-12">
                        <Text className="text-gray-500 text-sm font-semibold mb-4 ml-1">Settings</Text>

                        <View className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                            <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-100">
                                <Ionicons name="language" size={22} color="#0f766e" />
                                <Text className="flex-1 ml-4 text-gray-700 font-semibold text-base">Language</Text>
                                <Text className="text-gray-400 text-sm mr-2">English</Text>
                                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                className="flex-row items-center p-4"
                                onPress={async () => {
                                    try {
                                        await auth.signOut();
                                        showToast("Logged out successfully", 'success');

                                        // Reset navigation stack and go to Auth
                                        navigation.dispatch(
                                            CommonActions.reset({
                                                index: 0,
                                                routes: [{ name: 'Auth' }],
                                            })
                                        );
                                    } catch (e) {
                                        console.error('Logout error:', e);
                                        showToast(e.message, 'error');
                                    }
                                }}
                            >
                                <Ionicons name="log-out" size={22} color="#ef4444" />
                                <Text className="flex-1 ml-4 text-red-500 font-semibold text-base">Logout</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
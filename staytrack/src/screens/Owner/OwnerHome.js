import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, StatusBar, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import ProfileHeader from '../../components/ProfileHeader';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '../../config/firebase';
import DonutChart from '../../components/DonutChart';
import { COLORS, FONTS, SPACING, SHADOWS, RADII } from '../../theme/theme';

const { width } = Dimensions.get('window');

// Grid Menu Item Component
const GridMenuItem = ({ title, icon, color, navigation, screenName, renderChart, stats, theme }) => (
    <TouchableOpacity
        onPress={() => navigation.navigate(screenName)}
        className="bg-white rounded-3xl p-4 w-[48%] mb-4 shadow-sm border border-gray-100"
        activeOpacity={0.9}
        style={{ height: 190 }}
    >
        <View className="flex-row justify-between items-start mb-2">
            <View className="w-10 h-10 rounded-2xl items-center justify-center" style={{ backgroundColor: color.bg }}>
                <Ionicons name={icon} size={20} color={color.text} />
            </View>
            <View className="bg-gray-50 p-1.5 rounded-xl border border-gray-100">
                <Ionicons name="arrow-forward" size={14} color={COLORS.gray400} />
            </View>
        </View>

        <View className="items-center justify-center flex-1 my-2">
            {renderChart && renderChart()}
        </View>

        <View>
            <Text className="font-bold text-gray-900 text-base">{title}</Text>
            {stats && (
                <Text className="text-gray-500 font-medium text-[10px] mt-0.5">{stats}</Text>
            )}
        </View>
    </TouchableOpacity>
);

// Recent Activity Item Component
const ActivityRow = ({ icon, title, subtitle, color, theme }) => (
    <View className="flex-row items-center bg-white p-4 rounded-2xl mb-3 shadow-sm border border-gray-100">
        <View className="w-11 h-11 rounded-full items-center justify-center mr-4" style={{ backgroundColor: color.bg }}>
            <Ionicons name={icon} size={22} color={color.text} />
        </View>
        <View className="flex-1">
            <Text className="font-bold text-gray-900 text-sm">{title}</Text>
            <Text className="text-gray-400 text-xs mt-0.5">{subtitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={COLORS.gray300} />
    </View>
);

export default function OwnerHome({ navigation }) {
    const { theme } = useTheme();
    const [stats, setStats] = useState({
        students: { total: 0, capacity: 0, percentage: 0 },
        rooms: { total: 0, full: 0, percentage: 0 },
        fees: { collected: 0, pending: 0, total: 0, percentage: 0 }
    });
    const [userName, setUserName] = useState('');

    useFocusEffect(
        useCallback(() => {
            fetchStats();
            fetchUserData();
        }, [])
    );

    const fetchUserData = async () => {
        try {
            const user = auth.currentUser;
            if (user) {
                const { doc, getDoc } = await import('firebase/firestore');
                const userDocRef = doc(db, 'users', user.uid);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setUserName(userData.displayName || userData.name || user.displayName || user.email?.split('@')[0] || 'User');
                } else {
                    setUserName(user.displayName || user.email?.split('@')[0] || 'User');
                }
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            setUserName('User');
        }
    };

    const fetchStats = async () => {
        try {
            const userId = auth.currentUser?.uid;
            if (!userId) return;

            // 1. Fetch Rooms Data
            const roomsQuery = query(collection(db, 'rooms'), where("userId", "==", userId));
            const roomsSnap = await getDocs(roomsQuery);
            let totalCapacity = 0;
            let totalOccupied = 0;
            let totalRooms = 0;
            let fullRooms = 0;

            roomsSnap.forEach(doc => {
                const data = doc.data();
                const capacity = parseInt(data.capacity || 0);
                const occupied = parseInt(data.occupied || 0);

                totalCapacity += capacity;
                totalOccupied += occupied;
                totalRooms++;
                if (occupied >= capacity) fullRooms++;
            });

            // 2. Fetch Students
            const studentsQuery = query(collection(db, 'students'), where("userId", "==", userId));
            const studentsSnap = await getDocs(studentsQuery);
            const allStudents = studentsSnap.docs.map(d => d.data());
            const activeStudentsCount = allStudents.filter(s => s.status !== 'Inactive').length;

            // 3. Fetch Payments
            const date = new Date();
            const currentMonth = `${date.toLocaleString("en-US", { month: "long" })} ${date.getFullYear()}`;
            const paymentsQuery = query(collection(db, 'payments'), where("month", "==", currentMonth), where("userId", "==", userId));
            const paymentsSnap = await getDocs(paymentsQuery);
            const paidCount = paymentsSnap.size;

            setStats({
                students: {
                    total: activeStudentsCount,
                    capacity: totalCapacity,
                    percentage: totalCapacity > 0 ? (activeStudentsCount / totalCapacity) * 100 : 0
                },
                rooms: {
                    total: totalRooms,
                    full: fullRooms,
                    percentage: totalRooms > 0 ? (fullRooms / totalRooms) * 100 : 0
                },
                fees: {
                    collected: paidCount,
                    total: activeStudentsCount,
                    percentage: activeStudentsCount > 0 ? (paidCount / activeStudentsCount) * 100 : 0
                }
            });

        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    return (
        <View className="flex-1 bg-[#F5F7FA]">
            <StatusBar barStyle="light-content" />

            {/* Header Background Decoration */}
            <View
                className="absolute top-0 w-full h-[240px] rounded-b-[40px] z-0"
                style={{ backgroundColor: theme.primary }}
            />

            <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
                {/* Header Section (Fixed at top like Profile page) */}
                <View className="px-6 pt-2 pb-6 z-10 w-full">
                    <View className="flex-row justify-between items-center">
                        <View className="flex-1 mr-4">
                            <Text className="text-white/80 text-sm font-medium">Welcome Back,</Text>
                            <Text className="text-white text-3xl font-bold" numberOfLines={1}>
                                {userName || 'Admin'}
                            </Text>
                        </View>
                        <ProfileHeader navigation={navigation} />
                    </View>
                </View>

                {/* Main Content Area (Scrollable body) */}
                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 20 }}
                >

                    {/* Stats Grid */}
                    <View className="flex-row justify-between mb-2 items-end mt-2">
                        <Text className="text-white font-bold text-lg">Quick Overview</Text>
                        <View className="bg-white/20 px-3 py-1 rounded-lg">
                            <Text className="text-white text-[10px] font-bold uppercase tracking-wider">Live Updates</Text>
                        </View>
                    </View>

                    <View className="flex-row flex-wrap justify-between mt-4">
                        {/* ROOMS */}
                        <GridMenuItem
                            title="Rooms"
                            icon="bed"
                            color={{ bg: '#DBEAFE', text: '#2563EB' }}
                            navigation={navigation}
                            screenName="Rooms"
                            theme={theme}
                            stats={`${stats.rooms.full}/${stats.rooms.total} Full`}
                            renderChart={() => (
                                <DonutChart
                                    percentage={stats.rooms.percentage}
                                    radius={26}
                                    strokeWidth={5}
                                    color="#3b82f6"
                                    bgColor="#eff6ff"
                                    centerValue={`${Math.round(stats.rooms.percentage)}%`}
                                />
                            )}
                        />

                        {/* STUDENTS */}
                        <GridMenuItem
                            title="Students"
                            icon="people"
                            color={{ bg: '#D1FAE5', text: '#059669' }}
                            navigation={navigation}
                            screenName="Students"
                            theme={theme}
                            stats={`${stats.students.total} Active`}
                            renderChart={() => (
                                <DonutChart
                                    percentage={stats.students.percentage}
                                    radius={26}
                                    strokeWidth={5}
                                    color="#10b981"
                                    bgColor="#ecfdf5"
                                    centerValue={stats.students.total}
                                />
                            )}
                        />

                        {/* FEES */}
                        <GridMenuItem
                            title="Fees"
                            icon="wallet"
                            color={{ bg: '#F3E8FF', text: '#7C3AED' }}
                            navigation={navigation}
                            screenName="Payments"
                            theme={theme}
                            stats={`${stats.fees.collected}/${stats.fees.total} Paid`}
                            renderChart={() => (
                                <DonutChart
                                    percentage={stats.fees.percentage}
                                    radius={26}
                                    strokeWidth={5}
                                    color="#8b5cf6"
                                    bgColor="#f5f3ff"
                                    centerValue={`${Math.round(stats.fees.percentage)}%`}
                                />
                            )}
                        />

                        {/* MESS MENU */}
                        <GridMenuItem
                            title="Mess Menu"
                            icon="restaurant"
                            color={{ bg: '#FFEDD5', text: '#EA580C' }}
                            navigation={navigation}
                            screenName="MessManager"
                            theme={theme}
                            stats="Weekly Schedule"
                            renderChart={() => (
                                <View className="w-14 h-14 rounded-full items-center justify-center border-4 border-white bg-[#fff7ed]">
                                    <Ionicons name="restaurant" size={24} color="#ea580c" />
                                </View>
                            )}
                        />
                    </View>

                    {/* Recent Activity Section */}
                    <View className="mt-6">
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-white font-bold text-lg">Recent Activity</Text>
                            <TouchableOpacity>
                                <Text className="text-white/60 font-bold text-xs underline">View All</Text>
                            </TouchableOpacity>
                        </View>

                        <ActivityRow
                            icon="checkmark-circle"
                            title="Room A-101 Allotted"
                            subtitle="To Rahul Kumar • 2 mins ago"
                            color={{ bg: '#ecfdf5', text: '#10b981' }}
                            theme={theme}
                        />
                        <ActivityRow
                            icon="alert-circle"
                            title="Maintenance Request"
                            subtitle="Room B-204 • Fan not working"
                            color={{ bg: '#fef2f2', text: '#dc2626' }}
                            theme={theme}
                        />
                        <ActivityRow
                            icon="card"
                            title="New Payment Received"
                            subtitle="₹5,000 from Ankit Sharma"
                            color={{ bg: '#eff6ff', text: '#2563eb' }}
                            theme={theme}
                        />
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({});


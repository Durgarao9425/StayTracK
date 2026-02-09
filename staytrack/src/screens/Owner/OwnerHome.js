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

const { width } = Dimensions.get('window');

// Responsive calculations - COMPACT VERSION
const SCREEN_PADDING = 16;
const CARD_GAP = 16;
const CARD_WIDTH = (width - (SCREEN_PADDING * 2) - CARD_GAP) / 2;

// Compact Grid Menu Item Component
const GridMenuItem = ({ title, icon, color, navigation, screenName, renderChart, stats, theme }) => (
    <TouchableOpacity
        onPress={() => navigation.navigate(screenName)}
        style={[styles.gridMenuItem, { width: CARD_WIDTH }]}
        activeOpacity={0.7}
    >
        {/* Icon and Chart Combined */}
        <View style={styles.cardTop}>
            <View style={[styles.iconBadge, { backgroundColor: color.bg }]}>
                <Ionicons name={icon} size={20} color={color.text} />
            </View>
            {renderChart && (
                <View style={styles.miniChart}>
                    {renderChart()}
                </View>
            )}
        </View>

        {/* Title and Stats */}
        <View style={styles.cardBottom}>
            <Text style={styles.cardTitle} numberOfLines={1}>{title}</Text>
            {stats && (
                <Text style={styles.cardStats} numberOfLines={1}>{stats}</Text>
            )}
        </View>
    </TouchableOpacity>
);

// Simple Activity Chip Component
const ActivityChip = ({ icon, text, color, onPress }) => (
    <TouchableOpacity
        onPress={onPress}
        style={[styles.activityChip, { backgroundColor: color.bg }]}
        activeOpacity={0.7}
    >
        <Ionicons name={icon} size={16} color={color.text} />
        <Text style={[styles.chipText, { color: color.text }]} numberOfLines={1}>{text}</Text>
    </TouchableOpacity>
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
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={theme.primary} />

            {/* Compact Header Background */}
            <View style={[styles.headerBackground, { backgroundColor: theme.primary }]} />

            <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
                {/* Compact Header */}
                <View style={styles.header}>
                    <View style={styles.headerContent}>
                        <View style={styles.headerTextContainer}>
                            <Text style={styles.welcomeText}>Welcome back</Text>
                            <Text style={styles.userName} numberOfLines={1}>
                                {userName || 'Admin'}
                            </Text>
                        </View>
                        <ProfileHeader navigation={navigation} />
                    </View>
                </View>

                {/* Main Content */}
                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Compact Stats Grid */}
                    <View style={styles.gridContainer}>
                        {/* ROOMS */}
                        <GridMenuItem
                            title="Rooms"
                            icon="bed-outline"
                            color={{ bg: '#EFF6FF', text: '#2563EB' }}
                            navigation={navigation}
                            screenName="Rooms"
                            theme={theme}
                            stats={`${stats.rooms.full}/${stats.rooms.total} Full`}
                            renderChart={() => (
                                <DonutChart
                                    percentage={stats.rooms.percentage}
                                    radius={22}
                                    strokeWidth={4}
                                    color="#3b82f6"
                                    bgColor="#DBEAFE"
                                    centerValue={`${Math.round(stats.rooms.percentage)}%`}
                                />
                            )}
                        />

                        {/* STUDENTS */}
                        <GridMenuItem
                            title="Students"
                            icon="people-outline"
                            color={{ bg: '#F0FDF4', text: '#059669' }}
                            navigation={navigation}
                            screenName="Students"
                            theme={theme}
                            stats={`${stats.students.total} Active`}
                            renderChart={() => (
                                <DonutChart
                                    percentage={stats.students.percentage}
                                    radius={22}
                                    strokeWidth={4}
                                    color="#10b981"
                                    bgColor="#D1FAE5"
                                    centerValue={stats.students.total.toString()}
                                />
                            )}
                        />

                        {/* FEES */}
                        <GridMenuItem
                            title="Payments"
                            icon="wallet-outline"
                            color={{ bg: '#FAF5FF', text: '#7C3AED' }}
                            navigation={navigation}
                            screenName="Payments"
                            theme={theme}
                            stats={`${stats.fees.collected}/${stats.fees.total} Paid`}
                            renderChart={() => (
                                <DonutChart
                                    percentage={stats.fees.percentage}
                                    radius={22}
                                    strokeWidth={4}
                                    color="#8b5cf6"
                                    bgColor="#F3E8FF"
                                    centerValue={`${Math.round(stats.fees.percentage)}%`}
                                />
                            )}
                        />

                        {/* MESS MENU */}
                        <GridMenuItem
                            title="Mess Menu"
                            icon="restaurant-outline"
                            color={{ bg: '#FFF7ED', text: '#EA580C' }}
                            navigation={navigation}
                            screenName="MessManager"
                            theme={theme}
                            stats="View Schedule"
                            renderChart={() => (
                                <View style={styles.messIcon}>
                                    <Ionicons name="calendar" size={24} color="#ea580c" />
                                </View>
                            )}
                        />
                    </View>

                    {/* Quick Actions - Simple Chips */}
                    <View style={styles.quickActionsSection}>
                        <Text style={styles.sectionTitle}>Quick Actions</Text>
                        <View style={styles.chipsContainer}>
                            <ActivityChip
                                icon="add-circle"
                                text="Add Student"
                                color={{ bg: '#EFF6FF', text: '#2563EB' }}
                                onPress={() => navigation.navigate('Students')}
                            />
                            <ActivityChip
                                icon="notifications"
                                text="3 Pending"
                                color={{ bg: '#FEF2F2', text: '#DC2626' }}
                            />
                            <ActivityChip
                                icon="cash"
                                text="Collect Fee"
                                color={{ bg: '#F0FDF4', text: '#059669' }}
                            />
                        </View>
                    </View>

                    {/* Today's Summary - Simple List */}
                    <View style={styles.summarySection}>
                        <Text style={styles.sectionTitle}>Today's Summary</Text>

                        <View style={styles.summaryCard}>
                            <View style={styles.summaryRow}>
                                <View style={styles.summaryLeft}>
                                    <View style={[styles.summaryDot, { backgroundColor: '#10b981' }]} />
                                    <Text style={styles.summaryLabel}>New Admissions</Text>
                                </View>
                                <Text style={styles.summaryValue}>2</Text>
                            </View>

                            <View style={styles.summaryDivider} />

                            <View style={styles.summaryRow}>
                                <View style={styles.summaryLeft}>
                                    <View style={[styles.summaryDot, { backgroundColor: '#f59e0b' }]} />
                                    <Text style={styles.summaryLabel}>Payments Received</Text>
                                </View>
                                <Text style={styles.summaryValue}>₹{stats.fees.collected * 5000}</Text>
                            </View>

                            <View style={styles.summaryDivider} />

                            <View style={styles.summaryRow}>
                                <View style={styles.summaryLeft}>
                                    <View style={[styles.summaryDot, { backgroundColor: '#ef4444' }]} />
                                    <Text style={styles.summaryLabel}>Pending Issues</Text>
                                </View>
                                <Text style={styles.summaryValue}>1</Text>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFBFC',
    },
    headerBackground: {
        position: 'absolute',
        top: 0,
        width: '100%',
        height: Platform.OS === 'ios' ? 220 : 200,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        paddingHorizontal: SCREEN_PADDING,
        paddingTop: Platform.OS === 'ios' ? 20 : 32,
        paddingBottom: 20,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTextContainer: {
        flex: 1,
        marginRight: 12,
    },
    welcomeText: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 13,
        fontWeight: '500',
    },
    userName: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: '700',
        marginTop: 2,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: SCREEN_PADDING,
        paddingBottom: Platform.OS === 'ios' ? 120 : 100,
        paddingTop: 30,
    },

    // COMPACT GRID STYLES
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    gridMenuItem: {
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        padding: 16,
        minHeight: 155,
        marginBottom: CARD_GAP,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#F0F1F3',
    },
    cardTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    iconBadge: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    miniChart: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardBottom: {
        marginTop: 8,
    },
    cardTitle: {
        fontWeight: '700',
        color: '#1F2937',
        fontSize: 15,
        marginBottom: 4,
    },
    cardStats: {
        color: '#6B7280',
        fontWeight: '500',
        fontSize: 11,
    },
    messIcon: {
        width: 52,
        height: 52,
        borderRadius: 26,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFEDD5',
    },

    // QUICK ACTIONS - CHIP STYLE
    quickActionsSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 12,
    },
    chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    activityChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 20,
        gap: 6,
    },
    chipText: {
        fontSize: 13,
        fontWeight: '600',
    },

    // SUMMARY SECTION - SIMPLE LIST
    summarySection: {
        marginBottom: 20,
    },
    summaryCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#F0F1F3',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
    },
    summaryLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    summaryDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    summaryLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#4B5563',
    },
    summaryValue: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1F2937',
    },
    summaryDivider: {
        height: 1,
        backgroundColor: '#F3F4F6',
    },
});
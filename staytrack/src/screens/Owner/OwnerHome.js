import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, StatusBar, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import BottomTabNavigator from './BottomTabNavigator';
import ProfileHeader from '../../components/ProfileHeader';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '../../config/firebase';
import DonutChart from '../../components/DonutChart';
import { COLORS, FONTS, SPACING, RADII, SHADOWS } from '../../theme/theme';

const { width } = Dimensions.get('window');
const CARD_PADDING = 20;
const CARD_GAP = 12;
const CARD_WIDTH = (width - (CARD_PADDING * 2) - CARD_GAP) / 2;

// Metric Card Component
const MetricCard = ({ title, icon, color, navigation, screenName, stats, renderChart }) => (
    <TouchableOpacity
        onPress={() => navigation.navigate(screenName)}
        style={[styles.metricCard, { width: CARD_WIDTH }]}
        activeOpacity={0.7}
    >
        <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: color.light }]}>
                <Ionicons name={icon} size={22} color={color.main} />
            </View>
            {renderChart && (
                <View style={styles.chartContainer}>
                    {renderChart()}
                </View>
            )}
        </View>

        <Text style={styles.cardTitle} numberOfLines={1}>{title}</Text>
        {stats && <Text style={styles.cardStats} numberOfLines={1}>{stats}</Text>}
    </TouchableOpacity>
);

// Quick Action Chip
const QuickActionChip = ({ icon, label, color, onPress }) => (
    <TouchableOpacity
        onPress={onPress}
        style={[styles.quickChip, { backgroundColor: color.light }]}
        activeOpacity={0.7}
    >
        <Ionicons name={icon} size={18} color={color.main} />
        <Text style={[styles.chipLabel, { color: color.main }]}>{label}</Text>
    </TouchableOpacity>
);

// Summary Row Component
const SummaryRow = ({ icon, label, value, color }) => (
    <View style={styles.summaryRow}>
        <View style={styles.summaryLeft}>
            <View style={[styles.summaryDot, { backgroundColor: color }]} />
            <Text style={styles.summaryLabel}>{label}</Text>
        </View>
        <Text style={styles.summaryValue}>{value}</Text>
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

            const studentsQuery = query(collection(db, 'students'), where("userId", "==", userId));
            const studentsSnap = await getDocs(studentsQuery);
            const allStudents = studentsSnap.docs.map(d => d.data());
            const activeStudentsCount = allStudents.filter(s => s.status !== 'Inactive').length;

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
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

            {/* Header Background */}
            <View style={styles.headerBackground} />

            <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
                {/* Header */}
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
                    {/* Metrics Grid */}
                    <View style={styles.metricsGrid}>
                        <MetricCard
                            title="Rooms"
                            icon="bed-outline"
                            color={{ main: '#3B82F6', light: '#DBEAFE' }}
                            navigation={navigation}
                            screenName="Rooms"
                            stats={`${stats.rooms.full} of ${stats.rooms.total} Full`}
                            renderChart={() => (
                                <DonutChart
                                    percentage={stats.rooms.percentage}
                                    radius={24}
                                    strokeWidth={4}
                                    color="#3B82F6"
                                    bgColor="#DBEAFE"
                                    centerValue={`${Math.round(stats.rooms.percentage)}%`}
                                />
                            )}
                        />

                        <MetricCard
                            title="Students"
                            icon="people-outline"
                            color={{ main: '#10B981', light: '#D1FAE5' }}
                            navigation={navigation}
                            screenName="Students"
                            stats={`${stats.students.total} Active`}
                            renderChart={() => (
                                <DonutChart
                                    percentage={stats.students.percentage}
                                    radius={24}
                                    strokeWidth={4}
                                    color="#10B981"
                                    bgColor="#D1FAE5"
                                    centerValue={stats.students.total.toString()}
                                />
                            )}
                        />

                        <MetricCard
                            title="Payments"
                            icon="wallet-outline"
                            color={{ main: '#8B5CF6', light: '#EDE9FE' }}
                            navigation={navigation}
                            screenName="Payments"
                            stats={`${stats.fees.collected} of ${stats.fees.total} Paid`}
                            renderChart={() => (
                                <DonutChart
                                    percentage={stats.fees.percentage}
                                    radius={24}
                                    strokeWidth={4}
                                    color="#8B5CF6"
                                    bgColor="#EDE9FE"
                                    centerValue={`${Math.round(stats.fees.percentage)}%`}
                                />
                            )}
                        />

                        <MetricCard
                            title="Mess Menu"
                            icon="restaurant-outline"
                            color={{ main: '#F59E0B', light: '#FEF3C7' }}
                            navigation={navigation}
                            screenName="MessManager"
                            stats="View Schedule"
                            renderChart={() => (
                                <View style={styles.messIconContainer}>
                                    <Ionicons name="calendar-outline" size={28} color="#F59E0B" />
                                </View>
                            )}
                        />
                    </View>

                    {/* Quick Actions */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Quick Actions</Text>
                        <View style={styles.quickActionsContainer}>
                            <QuickActionChip
                                icon="add-circle-outline"
                                label="Add Student"
                                color={{ main: '#3B82F6', light: '#DBEAFE' }}
                                onPress={() => navigation.navigate('Students')}
                            />
                            <QuickActionChip
                                icon="notifications-outline"
                                label="Pending (3)"
                                color={{ main: '#EF4444', light: '#FEE2E2' }}
                                onPress={() => { }}
                            />
                            <QuickActionChip
                                icon="cash-outline"
                                label="Collect Fee"
                                color={{ main: '#10B981', light: '#D1FAE5' }}
                                onPress={() => navigation.navigate('Payments')}
                            />
                        </View>
                    </View>

                    {/* Today's Summary */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Today's Summary</Text>
                        <View style={styles.summaryCard}>
                            <SummaryRow
                                icon="person-add-outline"
                                label="New Admissions"
                                value="2"
                                color="#10B981"
                            />
                            <View style={styles.summaryDivider} />
                            <SummaryRow
                                icon="wallet-outline"
                                label="Payments Received"
                                value={`₹${stats.fees.collected * 5000}`}
                                color="#F59E0B"
                            />
                            <View style={styles.summaryDivider} />
                            <SummaryRow
                                icon="alert-circle-outline"
                                label="Pending Issues"
                                value="1"
                                color="#EF4444"
                            />
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>

            {/* Bottom Navigation */}
            <BottomTabNavigator navigation={navigation} activeRoute="Home" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    headerBackground: {
        position: 'absolute',
        top: 0,
        width: '100%',
        height: Platform.OS === 'ios' ? 200 : 180,
        backgroundColor: COLORS.primary,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        paddingHorizontal: CARD_PADDING,
        paddingTop: Platform.OS === 'ios' ? 16 : 24,
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
        fontSize: 14,
        fontFamily: FONTS.medium,
    },
    userName: {
        color: COLORS.white,
        fontSize: 26,
        fontFamily: FONTS.bold,
        marginTop: 4,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: CARD_PADDING,
        paddingBottom: Platform.OS === 'ios' ? 100 : 90,
        paddingTop: 24,
    },

    // Metrics Grid
    metricsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    metricCard: {
        backgroundColor: COLORS.white,
        borderRadius: RADII.l,
        padding: 16,
        marginBottom: CARD_GAP,
        minHeight: 140,
        ...SHADOWS.md,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: RADII.m,
        justifyContent: 'center',
        alignItems: 'center',
    },
    chartContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardTitle: {
        fontFamily: FONTS.bold,
        fontSize: 16,
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    cardStats: {
        fontFamily: FONTS.medium,
        fontSize: 13,
        color: COLORS.textSecondary,
    },
    messIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#FEF3C7',
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Sections
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontFamily: FONTS.bold,
        fontSize: 18,
        color: COLORS.textPrimary,
        marginBottom: 12,
    },

    // Quick Actions
    quickActionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    quickChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: RADII.m,
        gap: 8,
    },
    chipLabel: {
        fontFamily: FONTS.semibold,
        fontSize: 14,
    },

    // Summary Card
    summaryCard: {
        backgroundColor: COLORS.white,
        borderRadius: RADII.l,
        padding: 20,
        ...SHADOWS.md,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    summaryLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    summaryDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    summaryLabel: {
        fontFamily: FONTS.medium,
        fontSize: 15,
        color: COLORS.textSecondary,
    },
    summaryValue: {
        fontFamily: FONTS.bold,
        fontSize: 16,
        color: COLORS.textPrimary,
    },
    summaryDivider: {
        height: 1,
        backgroundColor: COLORS.border,
    },
});
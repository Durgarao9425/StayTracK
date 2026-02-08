import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Animated, Dimensions, ActivityIndicator, Alert, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import ProfileHeader from '../../components/ProfileHeader';
import { collection, addDoc, doc, getDocs, query, where, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../../config/firebase';
import showToast from '../../utils/toast';
import StayLoader from '../../components/StayLoader';
import { COLORS, FONTS, SPACING, SHADOWS, RADII } from '../../theme/theme';

const { height, width } = Dimensions.get('window');

// 1. Payment Card Component
const PaymentCard = ({ student, onPress }) => {
    return (
        <TouchableOpacity
            className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100 flex-row justify-between items-center"
            onPress={() => onPress(student)}
            activeOpacity={0.9}
        >
            <View className="flex-row items-center flex-1">
                <View className={`w-12 h-12 rounded-xl justify-center items-center mr-4 ${student.paymentStatus === 'Paid' ? 'bg-green-100' : 'bg-red-100'}`}>
                    <Ionicons
                        name={student.paymentStatus === 'Paid' ? "checkmark-circle" : "time"}
                        size={24}
                        color={student.paymentStatus === 'Paid' ? COLORS.success : COLORS.warning}
                    />
                </View>
                <View className="flex-1">
                    <Text className="text-base font-bold text-gray-900" numberOfLines={1}>{student.name || 'Unknown Student'}</Text>
                    <Text className="text-gray-500 text-xs">
                        {student.room ? `Rm ${student.room}` : 'No Room'} • {student.bed ? `Bed ${student.bed}` : '-'}
                    </Text>
                    <Text className="text-gray-900 text-sm font-semibold mt-1">₹{student.rent || 0}</Text>
                </View>
            </View>

            <View className={`px-3 py-1 rounded-full ${student.paymentStatus === 'Paid' ? 'bg-green-100' : 'bg-red-100'}`}>
                <Text className={`text-xs font-bold ${student.paymentStatus === 'Paid' ? 'text-green-700' : 'text-red-700'}`}>
                    {student.paymentStatus === 'Paid' ? 'PAID' : 'UNPAID'}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

// 2. Add Payment Drawer (Left Slide) - Refactored to Right Slide for consistency
const AddPaymentDrawer = ({ isVisible, onClose, onSave, student, currentMonth, theme }) => {
    const slideAnim = useRef(new Animated.Value(width)).current; // Start off-screen RIGHT
    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState('Cash'); // Cash, UPI, Card
    const [notes, setNotes] = useState('');
    const [saving, setSaving] = useState(false);

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

        if (isVisible) {
            // Pre-fill amount from student rent if available
            if (student?.rent) setAmount(String(student.rent));
        } else {
            // Reset form
            setTimeout(() => {
                setAmount('');
                setMethod('Cash');
                setNotes('');
            }, 300);
        }
    }, [isVisible, student]);

    if (!shouldRender && !isVisible) return null;

    const handleSave = async () => {
        if (!amount) {
            showToast('Please enter paid amount', 'warning');
            return;
        }

        setSaving(true);
        try {
            await onSave({
                studentId: student.id,
                studentName: student.name,
                month: currentMonth,
                amount: parseFloat(amount),
                method,
                notes,
                date: new Date().toISOString()
            });
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    if (!isVisible && !student) return null;

    return (
        <View style={styles.drawerOverlay} pointerEvents={isVisible ? "auto" : "none"}>
            <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
            <Animated.View style={[styles.drawerContainer, { transform: [{ translateX: slideAnim }] }]}>
                <View style={{ flex: 1 }}>
                    <View style={styles.drawerHeader}>
                        <Text style={styles.drawerTitle}>Record Payment</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={COLORS.gray800} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        contentContainerStyle={styles.drawerContent}
                        showsVerticalScrollIndicator={false}
                        bounces={false}
                        overScrollMode="never"
                    >
                        {/* Read-Only Info */}
                        <View style={styles.infoCard}>
                            <Text style={styles.infoCardLabel}>Student</Text>
                            <Text style={styles.infoCardValue}>{student?.name}</Text>

                            <View style={styles.infoRow}>
                                <View>
                                    <Text style={styles.infoCardLabel}>Rent</Text>
                                    <Text style={styles.infoCardSubValue}>₹{student?.rent || 0}</Text>
                                </View>
                                <View>
                                    <Text style={styles.infoCardLabel}>Month</Text>
                                    <Text style={styles.infoCardSubValue}>{currentMonth}</Text>
                                </View>
                            </View>
                        </View>

                        {/* Payment Form */}
                        <View style={styles.formSection}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Paid Amount <Text style={styles.required}>*</Text></Text>
                                <View style={styles.currencyInputContainer}>
                                    <Text style={styles.currencySymbol}>₹</Text>
                                    <TextInput
                                        style={[styles.currencyInput, Platform.OS === 'web' && { outlineStyle: 'none' }]}
                                        keyboardType="numeric"
                                        value={amount}
                                        onChangeText={setAmount}
                                        placeholder="0.00"
                                    />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Payment Method</Text>
                                <View style={styles.methodRow}>
                                    {['Cash', 'UPI', 'OS'].map((m) => (
                                        <TouchableOpacity
                                            key={m}
                                            onPress={() => setMethod(m)}
                                            style={[
                                                styles.methodButton,
                                                method === m ? { backgroundColor: theme.primary, borderColor: theme.primary } : {}
                                            ]}
                                        >
                                            <Text style={[
                                                styles.methodText,
                                                method === m ? { color: COLORS.white } : {}
                                            ]}>{m}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Notes (Optional)</Text>
                                <TextInput
                                    style={[styles.textArea, Platform.OS === 'web' && { outlineStyle: 'none' }]}
                                    multiline
                                    textAlignVertical="top"
                                    placeholder="Add any remarks..."
                                    value={notes}
                                    onChangeText={setNotes}
                                />
                            </View>
                        </View>
                    </ScrollView>

                    <View style={styles.drawerFooter}>
                        <TouchableOpacity
                            style={[styles.saveButton, { backgroundColor: theme.primary }]}
                            onPress={handleSave}
                            disabled={saving}
                        >
                            {saving ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text style={styles.saveButtonText}>Save Payment</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Animated.View>
        </View>
    );
};

// 3. Payment Details Drawer (Bottom Slide)
const PaymentDetailsDrawer = ({ isVisible, onClose, payment, student, onDelete, theme }) => {
    const slideAnim = useRef(new Animated.Value(height)).current;

    useEffect(() => {
        Animated.timing(slideAnim, {
            toValue: isVisible ? 0 : height,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [isVisible]);

    if (!isVisible && !payment) return null;

    return (
        <View style={styles.drawerOverlay} pointerEvents={isVisible ? "auto" : "none"}>
            <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
            <Animated.View style={[styles.bottomSheetContainer, { transform: [{ translateY: slideAnim }] }]}>
                <View style={styles.bottomSheetHandleContainer}>
                    <View style={styles.bottomSheetHandle} />
                </View>

                <View style={styles.detailsHeader}>
                    <View>
                        <Text style={styles.detailsTitle}>Payment Details</Text>
                        <Text style={styles.detailsSubtitle}>{student?.name}</Text>
                    </View>
                    <View style={styles.paidBadgeLarge}>
                        <Text style={styles.paidBadgeTextLarge}>PAID</Text>
                    </View>
                </View>

                {/* Receipt Card style */}
                <View style={styles.receiptCard}>
                    {/* Circles for receipt effect */}
                    <View style={styles.receiptCircleLeft} />
                    <View style={styles.receiptCircleRight} />

                    <View style={styles.receiptAmountContainer}>
                        <Text style={styles.receiptLabel}>AMOUNT PAID</Text>
                        <Text style={styles.receiptAmount}>₹{payment?.amount?.toFixed(2)}</Text>
                    </View>

                    <View style={styles.receiptDetails}>
                        <View style={styles.receiptRow}>
                            <Text style={styles.receiptRowLabel}>Payment Date</Text>
                            <Text style={styles.receiptRowValue}>{new Date(payment?.date).toLocaleDateString()}</Text>
                        </View>
                        <View style={styles.receiptRow}>
                            <Text style={styles.receiptRowLabel}>Time</Text>
                            <Text style={styles.receiptRowValue}>{new Date(payment?.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                        </View>
                        <View style={styles.receiptRow}>
                            <Text style={styles.receiptRowLabel}>Method</Text>
                            <Text style={styles.receiptRowValue}>{payment?.method}</Text>
                        </View>
                        <View style={styles.receiptRow}>
                            <Text style={styles.receiptRowLabel}>Month</Text>
                            <Text style={styles.receiptRowValue}>{payment?.month}</Text>
                        </View>
                        {payment?.notes && (
                            <View style={styles.receiptNotes}>
                                <Text style={styles.receiptRowLabel}>Notes</Text>
                                <Text style={styles.receiptNotesText}>"{payment.notes}"</Text>
                            </View>
                        )}
                    </View>
                </View>

                <View style={styles.detailsFooter}>
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => showToast('Edit feature coming soon!', 'info')}
                    >
                        <Text style={styles.editButtonText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => {
                            Alert.alert(
                                "Delete Payment",
                                "Are you sure you want to delete this payment record?",
                                [
                                    { text: "Cancel", style: "cancel" },
                                    { text: "Delete", style: "destructive", onPress: () => onDelete(payment.id) }
                                ]
                            );
                        }}
                    >
                        <Text style={styles.deleteButtonText}>Delete</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </View>
    );
};

// Main Payments Screen
export default function Payments({ navigation }) {
    const { theme } = useTheme();

    // Logic: Selected Month
    const [selectedDate, setSelectedDate] = useState(new Date());

    const getFormattedMonth = (date) => {
        const monthName = date.toLocaleString("en-US", { month: "long" });
        return `${monthName} ${date.getFullYear()}`;
    };
    const currentMonth = getFormattedMonth(selectedDate);

    const handlePrevMonth = () => {
        const newDate = new Date(selectedDate);
        newDate.setMonth(newDate.getMonth() - 1);
        setSelectedDate(newDate);
    };

    const handleNextMonth = () => {
        const newDate = new Date(selectedDate);
        newDate.setMonth(newDate.getMonth() + 1);
        setSelectedDate(newDate);
    };

    // State
    const [allStudents, setAllStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('Unpaid'); // Default to Unpaid as requested

    // Drawer States
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [isAddDrawerOpen, setAddDrawerOpen] = useState(false);
    const [isDetailsDrawerOpen, setDetailsDrawerOpen] = useState(false);

    useEffect(() => {
        loadData();
    }, [selectedDate]); // Reload when month changes

    useEffect(() => {
        filterData();
    }, [searchQuery, activeTab, allStudents]);

    const loadData = async () => {
        setLoading(true);
        try {
            const userId = auth.currentUser?.uid;
            if (!userId) return;

            // 1. Fetch Students
            const studentsRef = collection(db, 'students');
            const studentsQuery = query(studentsRef, where("userId", "==", userId));
            const studentsSnap = await getDocs(studentsQuery);
            const studentsList = studentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // 2. Fetch Payments for Selected Month
            const paymentsRef = collection(db, 'payments');
            const q = query(paymentsRef, where("month", "==", currentMonth), where("userId", "==", userId));
            const paymentsSnap = await getDocs(q);
            const paymentsList = paymentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // 3. Merge Data
            const mergedData = studentsList.map(student => {
                const payment = paymentsList.find(p => p.studentId === student.id);
                return {
                    ...student,
                    paymentStatus: payment ? 'Paid' : 'Unpaid',
                    paymentDoc: payment || null
                };
            });

            setAllStudents(mergedData);
        } catch (error) {
            console.error("Error loading payments:", error);
            showToast("Failed to load data", "error");
        } finally {
            setLoading(false);
        }
    };

    const filterData = () => {
        let result = allStudents;

        // Search Filter
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(s =>
                s.name?.toLowerCase().includes(lowerQuery) ||
                s.room?.toLowerCase().includes(lowerQuery)
            );
        }

        // Tab Filter
        if (activeTab === 'Paid') {
            result = result.filter(s => s.paymentStatus === 'Paid');
        } else if (activeTab === 'Unpaid') {
            result = result.filter(s => s.paymentStatus === 'Unpaid');
        }

        setFilteredStudents(result);
    };

    const handleStudentPress = (student) => {
        setSelectedStudent(student);
        if (student.paymentStatus === 'Paid') {
            setSelectedPayment(student.paymentDoc);
            setDetailsDrawerOpen(true);
        } else {
            setAddDrawerOpen(true);
        }
    };

    const onSavePayment = async (paymentData) => {
        try {
            const userId = auth.currentUser?.uid;
            if (!userId) {
                showToast('You must be logged in to create a payment', 'error');
                return;
            }

            const finalData = { ...paymentData, userId };
            const docRef = await addDoc(collection(db, 'payments'), finalData);

            showToast("Payment recorded successfully!", "success");
            setAddDrawerOpen(false);

            // Refresh local state purely for speed
            const newPayment = { id: docRef.id, ...finalData };
            setAllStudents(prev => prev.map(s => {
                if (s.id === newPayment.studentId) {
                    return { ...s, paymentStatus: 'Paid', paymentDoc: newPayment };
                }
                return s;
            }));

            // Switch to Paid tab to show the new record, or keep user on current tab?
            // User asked: "it is come the paid tab" -> implied move to Paid tab or just show it as paid.
            // If we are in Unpaid tab, this item will disappear. 
            // If user wants to see it immediately, we can switch tab, but usually it's better to just let it move.
            // Let's stick to current tab but if they want to see it they go to Paid.
            // User said: "save it is come the paid tab" -> likely means it should appear in Paid list.

        } catch (error) {
            console.error("Save error:", error);
            showToast("Failed to save payment", "error");
        }
    };

    const onDeletePayment = async (paymentId) => {
        try {
            await deleteDoc(doc(db, 'payments', paymentId));
            showToast("Payment deleted", "success");
            setDetailsDrawerOpen(false);

            // Refresh local state
            setAllStudents(prev => prev.map(s => {
                if (s.paymentDoc?.id === paymentId) {
                    return { ...s, paymentStatus: 'Unpaid', paymentDoc: null };
                }
                return s;
            }));
        } catch (error) {
            console.error("Delete error:", error);
            showToast("Failed to delete", "error");
        }
    };

    return (
        <View style={styles.root}>
            {/* Header Background - Extended upwards to prevent white screen on bounce */}
            <View
                className="absolute w-full rounded-b-[40px] z-0"
                style={{
                    backgroundColor: theme.primary,
                    top: -500,
                    height: 720
                }}
            />

            <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
                {/* Header */}
                <View className="px-6 pt-2 pb-6 z-10 w-full">
                    <View className="flex-row justify-between items-center mb-6">
                        <View className="flex-row items-center">
                            <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
                                <Ionicons name="arrow-back" size={28} color="white" />
                            </TouchableOpacity>
                            <Text className="text-white text-3xl font-bold">Payments</Text>
                        </View>
                        <ProfileHeader navigation={navigation} />
                    </View>

                    {/* Search Bar */}
                    <View className="bg-white rounded-2xl flex-row items-center px-4 py-3 shadow-lg shadow-teal-900/10 mb-4">
                        <Ionicons name="search" size={20} color="#9ca3af" />
                        <TextInput
                            placeholder="Search students..."
                            placeholderTextColor="#9ca3af"
                            className="flex-1 ml-3 text-gray-800 font-medium text-base"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                </View>

                {/* Content */}
                <View className="flex-1 bg-gray-50 rounded-t-3xl px-5 pt-4">
                    {/* Month Navigation */}
                    <View className="flex-row justify-between items-center bg-white p-3 rounded-2xl shadow-sm mb-4 border border-gray-100">
                        <TouchableOpacity onPress={handlePrevMonth} className="p-2 bg-gray-50 rounded-full">
                            <Ionicons name="chevron-back" size={20} color={COLORS.gray600} />
                        </TouchableOpacity>
                        <Text className="text-lg font-bold text-gray-800">{currentMonth}</Text>
                        <TouchableOpacity onPress={handleNextMonth} className="p-2 bg-gray-50 rounded-full">
                            <Ionicons name="chevron-forward" size={20} color={COLORS.gray600} />
                        </TouchableOpacity>
                    </View>

                    {/* Tabs */}
                    <View className="flex-row mb-4 bg-gray-200 p-1 rounded-xl">
                        {['All', 'Paid', 'Unpaid'].map(tab => (
                            <TouchableOpacity
                                key={tab}
                                onPress={() => setActiveTab(tab)}
                                className={`flex-1 py-2 items-center rounded-lg ${activeTab === tab ? 'bg-white shadow-sm' : ''}`}
                            >
                                <Text className={`font-bold ${activeTab === tab ? 'text-gray-900' : 'text-gray-500'}`}>
                                    {tab}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* List */}
                    <ScrollView
                        scrollEnabled={!isAddDrawerOpen && !isDetailsDrawerOpen}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 100 }}
                    >
                        <View className="flex-row justify-between mb-4 items-end">
                            <Text className="text-gray-900 font-bold text-lg">{activeTab} Students</Text>
                            <View className="bg-white px-3 py-1 rounded-lg border border-gray-100">
                                <Text className="text-gray-500 text-xs font-bold">{filteredStudents.length} Found</Text>
                            </View>
                        </View>

                        {loading ? (
                            <View className="h-60 justify-center items-center">
                                <StayLoader />
                                <Text className="text-gray-400 mt-4">Loading payments...</Text>
                            </View>
                        ) : filteredStudents.length === 0 ? (
                            <View className="items-center mt-20">
                                <Ionicons name="documents-outline" size={64} color={COLORS.gray300} />
                                <Text className="text-gray-500 text-lg mt-4 font-medium">No records found</Text>
                            </View>
                        ) : (
                            filteredStudents.map(student => (
                                <PaymentCard
                                    key={student.id}
                                    student={student}
                                    onPress={handleStudentPress}
                                />
                            ))
                        )}
                    </ScrollView>
                </View>
            </SafeAreaView>

            {/* Drawers */}
            <AddPaymentDrawer
                isVisible={isAddDrawerOpen}
                onClose={() => setAddDrawerOpen(false)}
                onSave={onSavePayment}
                student={selectedStudent}
                currentMonth={currentMonth}
                theme={theme}
            />

            <PaymentDetailsDrawer
                isVisible={isDetailsDrawerOpen}
                onClose={() => setDetailsDrawerOpen(false)}
                payment={selectedPayment}
                student={selectedStudent}
                onDelete={onDeletePayment}
                theme={theme}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#F5F7FA',
        height: Platform.OS === 'web' ? '100vh' : '100%',
        overflow: 'hidden',
    },
    header: {
        paddingHorizontal: SPACING.l,
        paddingTop: SPACING.m,
        paddingBottom: SPACING.m,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.m,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        marginRight: SPACING.s,
        backgroundColor: 'rgba(255,255,255,0.2)',
        padding: 8,
        borderRadius: RADII.full,
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
        marginBottom: SPACING.m,
    },
    searchInput: {
        flex: 1,
        marginLeft: SPACING.s,
        fontFamily: FONTS.medium,
        fontSize: FONTS.body,
        color: COLORS.gray900,
    },
    monthNavContainerLight: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.white,
        marginHorizontal: SPACING.l,
        marginTop: SPACING.l,
        padding: SPACING.s,
        borderRadius: RADII.l,
        borderWidth: 1,
        borderColor: COLORS.gray200,
        ...SHADOWS.light,
    },
    monthNavButtonLight: {
        padding: SPACING.s,
        backgroundColor: COLORS.gray50,
        borderRadius: RADII.full,
    },
    monthTextLight: {
        fontFamily: FONTS.bold,
        fontSize: 16,
        color: COLORS.gray900,
    },
    sheetContainer: {
        flex: 1,
        backgroundColor: COLORS.gray50,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        overflow: 'hidden',
    },
    tabsContainer: {
        flexDirection: 'row',
        padding: 4,
        marginHorizontal: SPACING.l,
        marginTop: SPACING.m, // Reduced margin top since nav is above
        backgroundColor: COLORS.gray200,
        borderRadius: RADII.m,
        marginBottom: SPACING.m,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: RADII.s,
    },
    activeTab: {
        backgroundColor: COLORS.white,
        ...SHADOWS.light,
    },
    tabText: {
        fontFamily: FONTS.bold,
        fontSize: 14,
    },
    activeTabText: {
        color: COLORS.gray900,
    },
    inactiveTabText: {
        color: COLORS.gray500,
    },
    scrollContent: {
        padding: SPACING.l,
        paddingBottom: 100,
    },
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.m,
    },
    listTitle: {
        fontSize: 18,
        fontFamily: FONTS.bold,
        color: COLORS.gray900,
    },
    countBadge: {
        backgroundColor: COLORS.white,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: RADII.s,
        borderWidth: 1,
        borderColor: COLORS.gray100,
    },
    countText: {
        fontSize: 12,
        fontFamily: FONTS.bold,
        color: COLORS.gray500,
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
    paymentCard: {
        backgroundColor: COLORS.white,
        borderRadius: RADII.l,
        padding: SPACING.m,
        marginBottom: SPACING.m,
        borderWidth: 1,
        borderColor: COLORS.gray100,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: RADII.full,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.m,
    },
    paidIconBg: { backgroundColor: '#DCFCE7' },
    unpaidIconBg: { backgroundColor: '#FEF3C7' },
    cardInfo: { flex: 1 },
    studentName: { fontSize: 18, fontFamily: FONTS.bold, color: COLORS.gray900 },
    cardDetailsRow: { flexDirection: 'row', marginTop: 2, alignItems: 'center' },
    cardDetailText: { fontSize: 12, fontFamily: FONTS.medium, color: COLORS.gray500, marginRight: 8 },
    cardAmount: { fontSize: 12, fontFamily: FONTS.bold, color: COLORS.gray500 },
    statusContainer: { alignItems: 'flex-end', marginLeft: SPACING.s },
    statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: RADII.full, marginBottom: 4 },
    paidBadge: { backgroundColor: '#DCFCE7' },
    unpaidBadge: { backgroundColor: '#FEF3C7' },
    statusText: { fontSize: 10, fontFamily: FONTS.bold },
    paidText: { color: COLORS.success }, // Assuming COLORS.success is defined or use green
    unpaidText: { color: COLORS.warning }, // Assuming COLORS.warning is defined or use orange
    drawerOverlay: {
        position: Platform.OS === 'web' ? 'fixed' : 'absolute',
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
        width: width > 500 ? 400 : width * 0.85,
        backgroundColor: COLORS.white,
        ...SHADOWS.heavy,
    },
    drawerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.l,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray100,
    },
    drawerTitle: { fontSize: 24, fontFamily: FONTS.bold, color: COLORS.gray900 },
    closeButton: { padding: SPACING.s, backgroundColor: COLORS.gray100, borderRadius: RADII.full },
    drawerContent: { padding: SPACING.l },
    infoCard: {
        backgroundColor: '#EFF6FF',
        padding: SPACING.m,
        borderRadius: RADII.m,
        marginBottom: SPACING.l,
    },
    infoCardLabel: { fontSize: 10, fontFamily: FONTS.bold, color: '#1E40AF', textTransform: 'uppercase', marginBottom: 2 },
    infoCardValue: { fontSize: 18, fontFamily: FONTS.bold, color: COLORS.gray900, marginBottom: SPACING.m },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between' },
    infoCardSubValue: { fontSize: 14, fontFamily: FONTS.bold, color: COLORS.gray900 },
    formSection: { gap: SPACING.l },
    inputGroup: {},
    label: { fontSize: 14, fontFamily: FONTS.bold, color: COLORS.gray700, marginBottom: SPACING.s },
    required: { color: COLORS.error },
    currencyInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: RADII.m,
        backgroundColor: COLORS.gray50,
        paddingHorizontal: SPACING.m,
    },
    currencySymbol: { fontSize: 18, fontFamily: FONTS.bold, color: COLORS.gray500, marginRight: SPACING.s },
    currencyInput: { flex: 1, paddingVertical: 14, fontSize: 18, fontFamily: FONTS.bold, color: COLORS.gray900 },
    methodRow: { flexDirection: 'row', gap: SPACING.m },
    methodButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: RADII.m,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.gray200,
        backgroundColor: COLORS.white,
    },
    methodText: { fontFamily: FONTS.bold, color: COLORS.gray600 },
    textArea: {
        borderRadius: RADII.m,
        padding: SPACING.m,
        backgroundColor: COLORS.gray50,
        color: COLORS.gray800,
        fontFamily: FONTS.medium,
        minHeight: 100,
    },
    drawerFooter: { padding: SPACING.l, borderTopWidth: 1, borderTopColor: COLORS.gray100 },
    saveButton: { padding: SPACING.m, borderRadius: RADII.l, alignItems: 'center', ...SHADOWS.light },
    saveButtonText: { color: COLORS.white, fontFamily: FONTS.bold, fontSize: 16 },
    bottomSheetContainer: {
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        ...SHADOWS.heavy,
        paddingBottom: 40,
    },
    bottomSheetHandleContainer: { alignItems: 'center', paddingTop: 12, paddingBottom: 8 },
    bottomSheetHandle: { width: 60, height: 6, backgroundColor: COLORS.gray200, borderRadius: 3 },
    detailsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: SPACING.l, marginTop: SPACING.m },
    detailsTitle: { fontSize: 24, fontFamily: FONTS.bold, color: COLORS.gray900 },
    detailsSubtitle: { fontSize: 16, fontFamily: FONTS.medium, color: COLORS.gray500 },
    paidBadgeLarge: { backgroundColor: '#DCFCE7', px: 12, py: 4, borderRadius: RADII.full, paddingHorizontal: 12, paddingVertical: 4 },
    paidBadgeTextLarge: { color: COLORS.success, fontWeight: 'bold', fontSize: 12 },
    receiptCard: {
        backgroundColor: COLORS.gray50,
        borderRadius: RADII.l,
        padding: SPACING.l,
        borderWidth: 1,
        borderColor: COLORS.gray300,
        borderStyle: 'dashed',
        margin: SPACING.l,
        position: 'relative',
        overflow: 'hidden',
    },
    receiptCircleLeft: { position: 'absolute', left: -12, top: '50%', width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.white, marginTop: -12 },
    receiptCircleRight: { position: 'absolute', right: -12, top: '50%', width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.white, marginTop: -12 },
    receiptAmountContainer: { alignItems: 'center', marginBottom: SPACING.l },
    receiptLabel: { fontSize: 10, fontFamily: FONTS.bold, color: COLORS.gray400, letterSpacing: 1, marginBottom: 4 },
    receiptAmount: { fontSize: 36, fontFamily: FONTS.bold, color: COLORS.gray900 },
    receiptDetails: { gap: SPACING.m },
    receiptRow: { flexDirection: 'row', justifyContent: 'space-between' },
    receiptRowLabel: { fontSize: 14, fontFamily: FONTS.medium, color: COLORS.gray500 },
    receiptRowValue: { fontSize: 14, fontFamily: FONTS.bold, color: COLORS.gray900 },
    receiptNotes: { borderTopWidth: 1, borderTopColor: COLORS.gray200, paddingTop: SPACING.s, marginTop: SPACING.s },
    receiptNotesText: { fontSize: 14, fontFamily: FONTS.italic, color: COLORS.gray800, marginTop: 4 },
    detailsFooter: { flexDirection: 'row', gap: SPACING.m, paddingHorizontal: SPACING.l },
    editButton: { flex: 1, backgroundColor: COLORS.gray100, padding: SPACING.m, borderRadius: RADII.l, alignItems: 'center' },
    editButtonText: { color: COLORS.gray700, fontFamily: FONTS.bold },
    deleteButton: { flex: 1, backgroundColor: '#FEF2F2', padding: SPACING.m, borderRadius: RADII.l, alignItems: 'center' },
    deleteButtonText: { color: COLORS.error, fontFamily: FONTS.bold },
});

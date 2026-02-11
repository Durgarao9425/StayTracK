import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Dimensions,
    Alert,
    ActivityIndicator,
    Animated,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '../../config/firebase';
import ProfileHeader from '../../components/ProfileHeader';
import StayLoader from '../../components/StayLoader';
import showToast from '../../utils/toast';

const { width, height } = Dimensions.get('window');

const categories = [
    { name: 'Electricity', icon: 'flash', color: '#fbbf24', bg: '#fffbeb' },
    { name: 'Kitchen', icon: 'restaurant', color: '#f87171', bg: '#fef2f2' },
    { name: 'Maintenance', icon: 'construct', color: '#60a5fa', bg: '#eff6ff' },
    { name: 'Staff Salary', icon: 'people', color: '#34d399', bg: '#ecfdf5' },
    { name: 'Internet', icon: 'wifi', color: '#818cf8', bg: '#eef2ff' },
    { name: 'Other', icon: 'ellipsis-horizontal', color: '#9ca3af', bg: '#f3f4f6' },
];

export default function ExpensesScreen({ navigation }) {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(true);
    const [expenses, setExpenses] = useState([]);
    const [totalExpense, setTotalExpense] = useState(0);
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form State
    const [amount, setAmount] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(categories[0]);
    const [note, setNote] = useState('');
    const [date, setDate] = useState(new Date());

    // Month Filter Logic
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Animation refs for bottom sheet
    const slideAnim = useRef(new Animated.Value(height)).current;
    const overlayOpacity = useRef(new Animated.Value(0)).current;
    const fabScale = useRef(new Animated.Value(1)).current;

    const getFormattedMonth = (date) => {
        const monthName = date.toLocaleString("en-US", { month: "long" });
        return `${monthName} ${date.getFullYear()}`;
    };
    const currentMonth = getFormattedMonth(selectedDate);

    useEffect(() => {
        loadExpenses();
    }, [selectedDate]);

    // Handle bottom sheet animations
    useEffect(() => {
        if (isAddModalOpen) {
            // Open drawer
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 350,
                    useNativeDriver: true,
                }),
                Animated.timing(overlayOpacity, {
                    toValue: 1,
                    duration: 350,
                    useNativeDriver: true,
                }),
                Animated.timing(fabScale, {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: true,
                })
            ]).start();
        } else {
            // Close drawer
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: height,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(overlayOpacity, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(fabScale, {
                    toValue: 1,
                    duration: 250,
                    delay: 100,
                    useNativeDriver: true,
                })
            ]).start();
        }
    }, [isAddModalOpen]);

    const loadExpenses = async () => {
        setLoading(true);
        try {
            const userId = auth.currentUser?.uid;
            if (!userId) {
                setLoading(false);
                return;
            }

            const q = query(collection(db, 'expenses'), where('month', '==', currentMonth), where('userId', '==', userId));
            const snapshot = await getDocs(q);
            const expenseList = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .sort((a, b) => new Date(b.date) - new Date(a.date));

            setExpenses(expenseList);

            // Calculate total
            const total = expenseList.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
            setTotalExpense(total);

        } catch (error) {
            console.error("Error loading expenses:", error);
            showToast("Failed to load expenses", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveExpense = async () => {
        if (!amount) {
            showToast("Please enter an amount", "warning");
            return;
        }

        const userId = auth.currentUser?.uid;
        if (!userId) {
            showToast("Please login", "error");
            return;
        }

        try {
            const expenseData = {
                amount: parseFloat(amount),
                category: selectedCategory.name,
                categoryIcon: selectedCategory.icon,
                categoryColor: selectedCategory.color,
                categoryBg: selectedCategory.bg,
                note,
                date: new Date().toISOString(),
                month: currentMonth,
                userId: userId
            };

            setSaving(true);
            await addDoc(collection(db, 'expenses'), expenseData);
            showToast("Expense added successfully", "success");
            setAddModalOpen(false);

            // Reset Form
            setAmount('');
            setNote('');
            setSelectedCategory(categories[0]);

            // Reload
            loadExpenses();

        } catch (error) {
            console.error("Error saving expense:", error);
            showToast("Failed to save expense", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteExpense = async (id) => {
        try {
            await deleteDoc(doc(db, 'expenses', id));
            showToast("Expense deleted", "success");
            loadExpenses();
        } catch (error) {
            console.error("Error deleting expense:", error);
            showToast("Failed to delete", "error");
        }
    };

    const closeDrawer = () => {
        setAddModalOpen(false);
    };

    // Group expenses by date for better organization
    const groupExpensesByDate = () => {
        const grouped = {};
        expenses.forEach(expense => {
            const dateKey = new Date(expense.date).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            });
            if (!grouped[dateKey]) {
                grouped[dateKey] = [];
            }
            grouped[dateKey].push(expense);
        });
        return grouped;
    };

    const groupedExpenses = groupExpensesByDate();

    return (
        <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
            <StatusBar barStyle="light-content" />

            {/* Header Background with Gradient Effect */}
            <View
                style={{
                    position: 'absolute',
                    top: 0,
                    width: '100%',
                    height: 280,
                    backgroundColor: theme.primary,
                    borderBottomLeftRadius: 32,
                    borderBottomRightRadius: 32,
                }}
            />

            <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
                {/* Header Section */}
                <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24, zIndex: 10 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <TouchableOpacity
                                onPress={() => navigation.goBack()}
                                style={{
                                    backgroundColor: 'rgba(255,255,255,0.25)',
                                    padding: 10,
                                    borderRadius: 12,
                                    marginRight: 12
                                }}
                            >
                                <Ionicons name="arrow-back" size={24} color="white" />
                            </TouchableOpacity>
                            <Text style={{ color: 'white', fontSize: 28, fontWeight: '700', letterSpacing: 0.3 }}>
                                Expenses
                            </Text>
                        </View>
                        <ProfileHeader navigation={navigation} />
                    </View>

                    {/* Enhanced Total Card */}
                    <View
                        style={{
                            backgroundColor: 'white',
                            borderRadius: 24,
                            padding: 24,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 8 },
                            shadowOpacity: 0.12,
                            shadowRadius: 16,
                            elevation: 8,
                        }}
                    >
                        <View style={{ alignItems: 'center', marginBottom: 20 }}>
                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: '#F1F5F9',
                                paddingHorizontal: 12,
                                paddingVertical: 6,
                                borderRadius: 20,
                                marginBottom: 12
                            }}>
                                <View style={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: 3,
                                    backgroundColor: theme.primary,
                                    marginRight: 8
                                }} />
                                <Text style={{
                                    color: '#64748B',
                                    fontSize: 11,
                                    fontWeight: '700',
                                    textTransform: 'uppercase',
                                    letterSpacing: 1
                                }}>
                                    Total Spent
                                </Text>
                            </View>

                            <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                                <Text style={{ fontSize: 18, fontWeight: '600', color: '#94A3B8', marginRight: 4 }}>₹</Text>
                                <Text style={{ fontSize: 44, fontWeight: '800', color: '#1E293B', letterSpacing: -1 }}>
                                    {totalExpense.toLocaleString()}
                                </Text>
                            </View>
                        </View>

                        {/* Month Selector */}
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#F8FAFC',
                            borderRadius: 16,
                            paddingVertical: 8,
                            paddingHorizontal: 12
                        }}>
                            <TouchableOpacity
                                onPress={() => {
                                    const d = new Date(selectedDate);
                                    d.setMonth(d.getMonth() - 1);
                                    setSelectedDate(d);
                                }}
                                style={{ padding: 8 }}
                            >
                                <Ionicons name="chevron-back" size={20} color={theme.primary} />
                            </TouchableOpacity>

                            <View style={{
                                backgroundColor: 'white',
                                paddingHorizontal: 20,
                                paddingVertical: 8,
                                borderRadius: 12,
                                marginHorizontal: 12,
                                borderWidth: 1,
                                borderColor: '#E2E8F0'
                            }}>
                                <Text style={{ fontWeight: '700', color: '#334155', fontSize: 15 }}>
                                    {currentMonth}
                                </Text>
                            </View>

                            <TouchableOpacity
                                onPress={() => {
                                    const d = new Date(selectedDate);
                                    d.setMonth(d.getMonth() + 1);
                                    setSelectedDate(d);
                                }}
                                style={{ padding: 8 }}
                            >
                                <Ionicons name="chevron-forward" size={20} color={theme.primary} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Expenses List */}
                <ScrollView
                    style={{ flex: 1, paddingHorizontal: 20 }}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 120 }}
                >
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 16,
                        marginTop: 8
                    }}>
                        <Text style={{ fontSize: 19, fontWeight: '700', color: '#1E293B' }}>
                            Transactions
                        </Text>
                        <View style={{
                            backgroundColor: theme.primary + '15',
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 12
                        }}>
                            <Text style={{ color: theme.primary, fontWeight: '700', fontSize: 13 }}>
                                {expenses.length} items
                            </Text>
                        </View>
                    </View>

                    {loading ? (
                        <View style={{ height: 200, justifyContent: 'center', alignItems: 'center' }}>
                            <StayLoader />
                        </View>
                    ) : expenses.length === 0 ? (
                        <View style={{ alignItems: 'center', paddingVertical: 60 }}>
                            <View style={{
                                width: 120,
                                height: 120,
                                borderRadius: 60,
                                backgroundColor: '#F1F5F9',
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginBottom: 20
                            }}>
                                <Ionicons name="receipt-outline" size={60} color="#CBD5E1" />
                            </View>
                            <Text style={{ color: '#64748B', fontSize: 18, fontWeight: '600', marginBottom: 8 }}>
                                No Expenses Yet
                            </Text>
                            <Text style={{ color: '#94A3B8', fontSize: 14, textAlign: 'center', paddingHorizontal: 40 }}>
                                Start tracking your expenses by tapping the + button below
                            </Text>
                        </View>
                    ) : (
                        Object.entries(groupedExpenses).map(([dateKey, dayExpenses]) => (
                            <View key={dateKey} style={{ marginBottom: 24 }}>
                                {/* Date Header */}
                                <View style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    marginBottom: 12,
                                    paddingLeft: 4
                                }}>
                                    <View style={{
                                        width: 4,
                                        height: 16,
                                        backgroundColor: theme.primary,
                                        borderRadius: 2,
                                        marginRight: 10
                                    }} />
                                    <Text style={{ fontSize: 14, fontWeight: '700', color: '#64748B', letterSpacing: 0.5 }}>
                                        {dateKey}
                                    </Text>
                                    <View style={{ flex: 1, height: 1, backgroundColor: '#E2E8F0', marginLeft: 12 }} />
                                </View>

                                {/* Expenses for this date */}
                                {dayExpenses.map((expense) => (
                                    <TouchableOpacity
                                        key={expense.id}
                                        style={{
                                            backgroundColor: 'white',
                                            borderRadius: 20,
                                            padding: 16,
                                            marginBottom: 12,
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            shadowColor: '#000',
                                            shadowOffset: { width: 0, height: 2 },
                                            shadowOpacity: 0.04,
                                            shadowRadius: 8,
                                            elevation: 2,
                                            borderWidth: 1,
                                            borderColor: '#F1F5F9'
                                        }}
                                        activeOpacity={0.7}
                                        onLongPress={() => Alert.alert(
                                            "Delete Expense",
                                            "Are you sure you want to delete this expense?",
                                            [
                                                { text: "Cancel", style: 'cancel' },
                                                {
                                                    text: "Delete",
                                                    style: 'destructive',
                                                    onPress: () => handleDeleteExpense(expense.id)
                                                }
                                            ]
                                        )}
                                    >
                                        {/* Icon */}
                                        <View style={{
                                            width: 56,
                                            height: 56,
                                            borderRadius: 16,
                                            backgroundColor: expense.categoryBg || '#F3F4F6',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            marginRight: 16
                                        }}>
                                            <Ionicons
                                                name={expense.categoryIcon || 'pricetag'}
                                                size={28}
                                                color={expense.categoryColor || '#6B7280'}
                                            />
                                        </View>

                                        {/* Details */}
                                        <View style={{ flex: 1 }}>
                                            <Text style={{
                                                fontSize: 17,
                                                fontWeight: '700',
                                                color: '#1E293B',
                                                marginBottom: 4
                                            }}>
                                                {expense.category}
                                            </Text>
                                            {expense.note ? (
                                                <Text
                                                    style={{
                                                        fontSize: 13,
                                                        color: '#64748B',
                                                        fontStyle: 'italic'
                                                    }}
                                                    numberOfLines={1}
                                                >
                                                    {expense.note}
                                                </Text>
                                            ) : (
                                                <Text style={{ fontSize: 12, color: '#94A3B8' }}>
                                                    {new Date(expense.date).toLocaleTimeString('en-US', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </Text>
                                            )}
                                        </View>

                                        {/* Amount */}
                                        <View style={{ alignItems: 'flex-end' }}>
                                            <Text style={{
                                                fontSize: 20,
                                                fontWeight: '800',
                                                color: '#EF4444',
                                                letterSpacing: -0.5
                                            }}>
                                                -₹{expense.amount}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        ))
                    )}
                </ScrollView>

                {/* Floating Action Button with Scale Animation */}
                <Animated.View
                    style={{
                        position: 'absolute',
                        bottom: (insets.bottom || 10) + 90,
                        right: 24,
                        transform: [{ scale: fabScale }]
                    }}
                >
                    <TouchableOpacity
                        onPress={() => setAddModalOpen(true)}
                        style={{
                            width: 68,
                            height: 68,
                            borderRadius: 34,
                            backgroundColor: theme.primary,
                            justifyContent: 'center',
                            alignItems: 'center',
                            shadowColor: theme.primary,
                            shadowOffset: { width: 0, height: 8 },
                            shadowOpacity: 0.4,
                            shadowRadius: 16,
                            elevation: 10,
                        }}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="add" size={36} color="white" />
                    </TouchableOpacity>
                </Animated.View>

                {/* Bottom Sheet Drawer */}
                {isAddModalOpen && (
                    <View style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 1000
                    }}>
                        {/* Overlay */}
                        <Animated.View
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundColor: 'rgba(0,0,0,0.5)',
                                opacity: overlayOpacity
                            }}
                        >
                            <TouchableOpacity
                                style={{ flex: 1 }}
                                activeOpacity={1}
                                onPress={closeDrawer}
                            />
                        </Animated.View>

                        {/* Bottom Sheet */}
                        <Animated.View
                            style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                backgroundColor: 'white',
                                borderTopLeftRadius: 32,
                                borderTopRightRadius: 32,
                                maxHeight: height * 0.9,
                                paddingBottom: insets.bottom,
                                transform: [{ translateY: slideAnim }],
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: -4 },
                                shadowOpacity: 0.15,
                                shadowRadius: 20,
                                elevation: 20,
                            }}
                        >
                            <KeyboardAvoidingView
                                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                                style={{ flex: 1 }}
                            >
                                {/* Handle Bar */}
                                <View style={{ alignItems: 'center', paddingTop: 12 }}>
                                    <View style={{
                                        width: 48,
                                        height: 5,
                                        backgroundColor: '#E2E8F0',
                                        borderRadius: 3
                                    }} />
                                </View>

                                {/* Header */}
                                <View style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    paddingHorizontal: 24,
                                    paddingTop: 20,
                                    paddingBottom: 16
                                }}>
                                    <View>
                                        <Text style={{ fontSize: 26, fontWeight: '800', color: '#1E293B' }}>
                                            Add Expense
                                        </Text>
                                        <Text style={{ fontSize: 14, color: '#64748B', marginTop: 2 }}>
                                            Track your spending
                                        </Text>
                                    </View>
                                    <TouchableOpacity
                                        onPress={closeDrawer}
                                        style={{
                                            backgroundColor: '#F1F5F9',
                                            padding: 10,
                                            borderRadius: 12
                                        }}
                                    >
                                        <Ionicons name="close" size={24} color="#64748B" />
                                    </TouchableOpacity>
                                </View>

                                {/* Form Content */}
                                <ScrollView
                                    style={{ flex: 1 }}
                                    showsVerticalScrollIndicator={false}
                                    contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32 }}
                                >
                                    {/* Amount Input */}
                                    <View style={{ marginBottom: 24 }}>
                                        <Text style={{
                                            fontSize: 13,
                                            fontWeight: '700',
                                            color: '#64748B',
                                            marginBottom: 10,
                                            textTransform: 'uppercase',
                                            letterSpacing: 0.5
                                        }}>
                                            Amount
                                        </Text>
                                        <View style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            backgroundColor: '#F8FAFC',
                                            borderRadius: 16,
                                            paddingHorizontal: 20,
                                            borderWidth: 2,
                                            borderColor: '#E2E8F0'
                                        }}>
                                            <Text style={{
                                                fontSize: 28,
                                                fontWeight: '700',
                                                color: '#94A3B8',
                                                marginRight: 8
                                            }}>
                                                ₹
                                            </Text>
                                            <TextInput
                                                style={{
                                                    flex: 1,
                                                    fontSize: 32,
                                                    fontWeight: '800',
                                                    color: '#1E293B',
                                                    paddingVertical: 16,
                                                    outlineStyle: 'none'
                                                }}
                                                keyboardType="numeric"
                                                placeholder="0"
                                                placeholderTextColor="#CBD5E1"
                                                value={amount}
                                                onChangeText={setAmount}
                                                autoFocus
                                            />
                                        </View>
                                    </View>

                                    {/* Category Selection */}
                                    <View style={{ marginBottom: 24 }}>
                                        <Text style={{
                                            fontSize: 13,
                                            fontWeight: '700',
                                            color: '#64748B',
                                            marginBottom: 12,
                                            textTransform: 'uppercase',
                                            letterSpacing: 0.5
                                        }}>
                                            Category
                                        </Text>
                                        <View style={{
                                            flexDirection: 'row',
                                            flexWrap: 'wrap',
                                            marginHorizontal: -6
                                        }}>
                                            {categories.map((cat) => {
                                                const isSelected = selectedCategory.name === cat.name;
                                                return (
                                                    <TouchableOpacity
                                                        key={cat.name}
                                                        onPress={() => setSelectedCategory(cat)}
                                                        style={{
                                                            flexDirection: 'row',
                                                            alignItems: 'center',
                                                            paddingHorizontal: 16,
                                                            paddingVertical: 12,
                                                            borderRadius: 14,
                                                            marginHorizontal: 6,
                                                            marginBottom: 12,
                                                            backgroundColor: isSelected ? theme.primary + '15' : '#F8FAFC',
                                                            borderWidth: 2,
                                                            borderColor: isSelected ? theme.primary : '#E2E8F0',
                                                        }}
                                                        activeOpacity={0.7}
                                                    >
                                                        <Ionicons
                                                            name={cat.icon}
                                                            size={20}
                                                            color={isSelected ? theme.primary : cat.color}
                                                        />
                                                        <Text style={{
                                                            marginLeft: 8,
                                                            fontSize: 15,
                                                            fontWeight: isSelected ? '700' : '600',
                                                            color: isSelected ? theme.primary : '#475569'
                                                        }}>
                                                            {cat.name}
                                                        </Text>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>
                                    </View>

                                    {/* Note Input */}
                                    <View style={{ marginBottom: 24 }}>
                                        <Text style={{
                                            fontSize: 13,
                                            fontWeight: '700',
                                            color: '#64748B',
                                            marginBottom: 10,
                                            textTransform: 'uppercase',
                                            letterSpacing: 0.5
                                        }}>
                                            Note (Optional)
                                        </Text>
                                        <TextInput
                                            style={{
                                                backgroundColor: '#F8FAFC',
                                                borderRadius: 16,
                                                paddingHorizontal: 20,
                                                paddingVertical: 16,
                                                fontSize: 16,
                                                color: '#334155',
                                                minHeight: 100,
                                                textAlignVertical: 'top',
                                                borderWidth: 2,
                                                borderColor: '#E2E8F0',
                                                outlineStyle: 'none'
                                            }}
                                            multiline
                                            placeholder="Add details about this expense..."
                                            placeholderTextColor="#94A3B8"
                                            value={note}
                                            onChangeText={setNote}
                                        />
                                    </View>

                                    {/* Save Button */}
                                    <TouchableOpacity
                                        style={{
                                            backgroundColor: theme.primary,
                                            borderRadius: 16,
                                            paddingVertical: 18,
                                            alignItems: 'center',
                                            flexDirection: 'row',
                                            justifyContent: 'center',
                                            shadowColor: theme.primary,
                                            shadowOffset: { width: 0, height: 8 },
                                            shadowOpacity: 0.3,
                                            shadowRadius: 12,
                                            elevation: 8,
                                            opacity: saving ? 0.7 : 1
                                        }}
                                        onPress={handleSaveExpense}
                                        disabled={saving}
                                        activeOpacity={0.8}
                                    >
                                        {saving && (
                                            <ActivityIndicator
                                                color="white"
                                                style={{ marginRight: 12 }}
                                            />
                                        )}
                                        <Text style={{
                                            color: 'white',
                                            fontSize: 18,
                                            fontWeight: '700',
                                            letterSpacing: 0.3
                                        }}>
                                            {saving ? 'Saving...' : 'Save Expense'}
                                        </Text>
                                    </TouchableOpacity>
                                </ScrollView>
                            </KeyboardAvoidingView>
                        </Animated.View>
                    </View>
                )}
            </SafeAreaView>
        </View>
    );
}
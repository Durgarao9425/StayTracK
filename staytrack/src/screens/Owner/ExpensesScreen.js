import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../config/firebase';
import ProfileHeader from '../../components/ProfileHeader';
import StayLoader from '../../components/StayLoader';
import showToast from '../../utils/toast';

const { width } = Dimensions.get('window');

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

    const getFormattedMonth = (date) => {
        const monthName = date.toLocaleString("en-US", { month: "long" });
        return `${monthName} ${date.getFullYear()}`;
    };
    const currentMonth = getFormattedMonth(selectedDate);

    useEffect(() => {
        loadExpenses();
    }, [selectedDate]);

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

    return (
        <View className="flex-1 bg-[#F5F7FA]">
            {/* Header Background */}
            <View className="absolute top-0 w-full h-[260px] rounded-b-[40px] z-0" style={{ backgroundColor: theme.primary }} />

            <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
                {/* Header */}
                <View className="px-6 pt-6 pb-6 z-10 w-full">
                    <View className="flex-row justify-between items-center mb-6">
                        <View className="flex-row items-center">
                            <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3 bg-white/20 p-2 rounded-full">
                                <Ionicons name="arrow-back" size={24} color="white" />
                            </TouchableOpacity>
                            <Text className="text-white text-3xl font-bold">Expenses</Text>
                        </View>
                        <ProfileHeader navigation={navigation} />
                    </View>

                    {/* Total Expenses Card */}
                    <View className="bg-white rounded-3xl p-6 shadow-lg shadow-teal-900/10 mb-2 items-center">
                        <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">TOTAL EXPENSES ({currentMonth})</Text>
                        <Text className="text-4xl font-extrabold text-gray-900">₹{totalExpense.toLocaleString()}</Text>

                        {/* Month Navigation */}
                        <View className="flex-row items-center mt-4 bg-gray-100 rounded-full px-4 py-1">
                            <TouchableOpacity onPress={() => {
                                const d = new Date(selectedDate);
                                d.setMonth(d.getMonth() - 1);
                                setSelectedDate(d);
                            }} className="p-1">
                                <Ionicons name="chevron-back" size={20} color="#6b7280" />
                            </TouchableOpacity>
                            <Text className="mx-4 font-semibold text-gray-600">{currentMonth}</Text>
                            <TouchableOpacity onPress={() => {
                                const d = new Date(selectedDate);
                                d.setMonth(d.getMonth() + 1);
                                setSelectedDate(d);
                            }} className="p-1">
                                <Ionicons name="chevron-forward" size={20} color="#6b7280" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Content */}
                <ScrollView
                    className="flex-1 px-6 pt-2"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 130 }}
                >
                    <Text className="text-lg font-bold text-gray-800 mb-4">Recent Transactions</Text>

                    {loading ? (
                        <View className="h-40 justify-center items-center">
                            <StayLoader />
                        </View>
                    ) : expenses.length === 0 ? (
                        <View className="items-center py-10 opacity-50">
                            <Ionicons name="receipt-outline" size={60} color="#9ca3af" />
                            <Text className="text-gray-500 text-lg mt-4 font-medium">No expenses recorded</Text>
                        </View>
                    ) : (
                        expenses.map((expense) => (
                            <TouchableOpacity
                                key={expense.id}
                                className="bg-white p-4 rounded-2xl mb-3 flex-row items-center justify-between shadow-sm border border-gray-100"
                                onLongPress={() => Alert.alert("Delete Expense", "Delete this record?", [
                                    { text: "Cancel" },
                                    { text: "Delete", style: 'destructive', onPress: () => handleDeleteExpense(expense.id) }
                                ])}
                            >
                                <View className="flex-row items-center flex-1">
                                    <View className="w-12 h-12 rounded-full items-center justify-center mr-4" style={{ backgroundColor: expense.categoryBg || '#f3f4f6' }}>
                                        <Ionicons name={expense.categoryIcon || 'pricetag'} size={24} color={expense.categoryColor || '#6b7280'} />
                                    </View>
                                    <View>
                                        <Text className="font-bold text-gray-900 text-base">{expense.category}</Text>
                                        <Text className="text-gray-400 text-xs">{new Date(expense.date).toLocaleDateString()}</Text>
                                        {expense.note ? <Text className="text-gray-500 text-xs italic mt-0.5" numberOfLines={1}>{expense.note}</Text> : null}
                                    </View>
                                </View>
                                <Text className="font-bold text-gray-900 text-lg">-₹{expense.amount}</Text>
                            </TouchableOpacity>
                        ))
                    )}
                </ScrollView>

                {/* FAB */}
                <TouchableOpacity
                    onPress={() => setAddModalOpen(true)}
                    className="absolute bottom-10 right-6 w-20 h-20 rounded-full items-center justify-center shadow-2xl z-20"
                    style={{ backgroundColor: theme.primary, elevation: 5 }}
                    activeOpacity={0.9}
                >
                    <Ionicons name="add" size={38} color="white" />
                </TouchableOpacity>

                {/* Add Expense Modal */}
                {isAddModalOpen && (
                    <View className="absolute inset-0 z-50 justify-end">
                        <TouchableOpacity className="absolute inset-0 bg-black/50" onPress={() => setAddModalOpen(false)} />
                        <View className="bg-white rounded-t-[32px] w-full p-6 pb-10 max-h-[80%]">
                            <View className="flex-row justify-between items-center mb-6">
                                <Text className="text-2xl font-bold text-gray-900">Add Expense</Text>
                                <TouchableOpacity onPress={() => setAddModalOpen(false)} className="bg-gray-100 p-2 rounded-full">
                                    <Ionicons name="close" size={24} color="#333" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false}>
                                <Text className="text-gray-500 font-semibold mb-2">Amount</Text>
                                <View className="flex-row items-center border border-gray-200 rounded-xl px-4 bg-gray-50 mb-6" style={{ borderWidth: 1, borderColor: '#e5e7eb' }}>
                                    <Text className="text-gray-500 font-bold text-lg mr-2">₹</Text>
                                    <TextInput
                                        className="flex-1 py-4 text-2xl font-bold text-gray-900"
                                        keyboardType="numeric"
                                        placeholder="0"
                                        style={{ outlineStyle: 'none' }}
                                        value={amount}
                                        onChangeText={setAmount}
                                        autoFocus
                                    />
                                </View>

                                <Text className="text-gray-500 font-semibold mb-3">Category</Text>
                                <View className="flex-row flex-wrap gap-3 mb-6">
                                    {categories.map((cat) => (
                                        <TouchableOpacity
                                            key={cat.name}
                                            onPress={() => setSelectedCategory(cat)}
                                            className={`flex-row items-center px-4 py-3 rounded-xl border ${selectedCategory.name === cat.name ? `border-${theme.primary} bg-blue-50` : 'border-gray-200 bg-white'}`}
                                            style={selectedCategory.name === cat.name ? { borderColor: theme.primary, backgroundColor: `${theme.primary}10` } : {}}
                                        >
                                            <Ionicons name={cat.icon} size={18} color={selectedCategory.name === cat.name ? theme.primary : cat.color} />
                                            <Text className={`ml-2 font-semibold ${selectedCategory.name === cat.name ? 'text-gray-900' : 'text-gray-600'}`}>
                                                {cat.name}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <Text className="text-gray-500 font-semibold mb-2">Note (Optional)</Text>
                                <TextInput
                                    className="border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-gray-800 min-h-[80px] mb-6"
                                    multiline
                                    placeholder="Add details..."
                                    value={note}
                                    onChangeText={setNote}
                                />

                                <TouchableOpacity
                                    className="py-4 rounded-xl shadow-lg items-center mb-4 flex-row justify-center"
                                    style={{ backgroundColor: theme.primary, opacity: saving ? 0.7 : 1 }}
                                    onPress={handleSaveExpense}
                                    disabled={saving}
                                >
                                    {saving && <ActivityIndicator color="white" style={{ marginRight: 8 }} />}
                                    <Text className="text-white font-bold text-lg">{saving ? 'Saving...' : 'Save Expense'}</Text>
                                </TouchableOpacity>
                            </ScrollView>
                        </View>
                    </View>
                )}

            </SafeAreaView>
        </View>
    );
}

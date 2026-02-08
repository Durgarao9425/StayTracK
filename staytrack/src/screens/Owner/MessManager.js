import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, Dimensions, Animated, StyleSheet, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import ProfileHeader from '../../components/ProfileHeader';
import { collection, doc, setDoc, getDoc, onSnapshot, query, where } from 'firebase/firestore';
import { db, auth } from '../../config/firebase';
import showToast from '../../utils/toast';
import StayLoader from '../../components/StayLoader';

const { width, height } = Dimensions.get('window');

const MEAL_TYPES = [
    { id: 'breakfast', label: 'Breakfast', icon: 'sunny-outline', color: 'bg-orange-100', text: 'text-orange-600' },
    { id: 'lunch', label: 'Lunch', icon: 'restaurant-outline', color: 'bg-green-100', text: 'text-green-600' },
    { id: 'snacks', label: 'Snacks', icon: 'cafe-outline', color: 'bg-yellow-100', text: 'text-yellow-600' },
    { id: 'dinner', label: 'Dinner', icon: 'moon-outline', color: 'bg-indigo-100', text: 'text-indigo-600' },
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Edit Meal Drawer - SLIDES FROM BOTTOM like Payments
const EditMealDrawer = ({ isVisible, onClose, onSave, mealType, currentMenu, day, theme }) => {
    const slideAnim = useRef(new Animated.Value(height)).current;
    const [menuItem, setMenuItem] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isVisible) {
            setMenuItem(currentMenu || '');
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
            }).start();
        }
    }, [isVisible, currentMenu]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await onSave(day, mealType.id, menuItem);
            onClose();
        } catch (error) {
            console.error("Save failed:", error);
            showToast("Failed to update menu", "error");
        } finally {
            setSaving(false);
        }
    };

    if (!isVisible && !mealType) return null;

    return (
        <View className="absolute inset-0 z-50 justify-end" pointerEvents="box-none">
            {isVisible && (
                <TouchableOpacity
                    className="absolute inset-0 bg-black/50"
                    activeOpacity={1}
                    onPress={onClose}
                />
            )}
            <Animated.View
                style={{ transform: [{ translateY: slideAnim }] }}
                className="bg-white rounded-t-[32px] w-full shadow-2xl overflow-hidden pb-10"
            >
                <View className="p-6 border-b border-gray-100 flex-row justify-between items-center">
                    <View>
                        <Text className="text-2xl font-bold text-gray-800">Edit {mealType?.label}</Text>
                        <Text className="text-gray-500 font-medium mt-1">for {day}</Text>
                    </View>
                    <TouchableOpacity onPress={onClose} className="bg-gray-100 p-2 rounded-full">
                        <Ionicons name="close" size={24} color="#333" />
                    </TouchableOpacity>
                </View>

                <View className="p-6">
                    <Text className="text-gray-700 font-semibold mb-3">Menu Item(s)</Text>
                    <TextInput
                        className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-base text-gray-800 min-h-[120px]"
                        placeholder={`Start typing ${mealType?.label?.toLowerCase()} items...`}
                        multiline
                        textAlignVertical="top"
                        value={menuItem}
                        onChangeText={setMenuItem}
                        autoFocus
                    />

                    <TouchableOpacity
                        className="mt-6 py-4 rounded-xl items-center shadow-md"
                        style={{ backgroundColor: theme.primary }}
                        onPress={handleSave}
                        disabled={saving}
                    >
                        <Text className="text-white font-bold text-lg">
                            {saving ? 'Saving...' : 'Update Menu'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </View>
    );
};

export default function MessManager({ navigation }) {
    const { theme } = useTheme();
    const [selectedDay, setSelectedDay] = useState(DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]); // Default to today
    const [menuData, setMenuData] = useState({}); // { Monday: { breakfast: '...', ... }, ... }
    const [loading, setLoading] = useState(true);

    // Edit Drawer State
    const [isEditOpen, setEditOpen] = useState(false);
    const [editingMeal, setEditingMeal] = useState(null); // { id: 'breakfast', ... }

    useEffect(() => {
        const userId = auth.currentUser?.uid;
        if (!userId) {
            setLoading(false);
            return;
        }

        // Query mess_menu collection for documents belonging to this user
        const q = query(collection(db, 'mess_menu'), where("userId", "==", userId));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = {};
            snapshot.forEach(doc => {
                const docData = doc.data();
                if (docData.day) {
                    data[docData.day] = docData; // Map by Day Name (e.g., 'Monday')
                }
            });
            setMenuData(data);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching menu:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleEditPress = (mealType) => {
        setEditingMeal(mealType);
        setEditOpen(true);
    };

    const saveMenu = async (day, typeId, content) => {
        const userId = auth.currentUser?.uid;
        if (!userId) {
            showToast("Please login", "error");
            return;
        }

        // Create a composite ID or let Firestore generate one, but filtering by userId in fetch
        // To update a specific day, we need a consistent ID for that Day+User
        const docId = `${userId}_${day}`;
        const dayRef = doc(db, 'mess_menu', docId);

        // Merge with existing data for that day
        await setDoc(dayRef, {
            [typeId]: content,
            userId: userId,
            day: day
        }, { merge: true });

        showToast("Menu updated!", "success");
    };

    const getMenuContent = (typeId) => {
        return menuData[selectedDay]?.[typeId] || '';
    };

    return (
        <View className="flex-1 bg-[#F5F7FA]">
            {/* Header Background */}
            <View className="absolute top-0 w-full h-[220px] rounded-b-[40px] z-0" style={{ backgroundColor: theme.primary }} />

            <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
                {/* Header Content */}
                <View className="px-6 pt-2 pb-6 z-10 w-full mb-2">
                    <View className="flex-row justify-between items-center mb-6">
                        <View className="flex-row items-center">
                            <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3 bg-white/20 p-2 rounded-full">
                                <Ionicons name="arrow-back" size={24} color="white" />
                            </TouchableOpacity>
                            <Text className="text-white text-3xl font-bold">Mess Menu</Text>
                        </View>
                        <ProfileHeader navigation={navigation} />
                    </View>

                    {/* Day Selector (Horizontal Scroll) */}
                    <View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-2">
                            {DAYS.map((day, index) => (
                                <TouchableOpacity
                                    key={day}
                                    onPress={() => setSelectedDay(day)}
                                    className={`px-5 py-2.5 rounded-full mr-3 ${selectedDay === day ? 'bg-white shadow-lg' : 'bg-white/20'}`}
                                >
                                    <Text className={`font-bold ${selectedDay === day ? 'text-gray-900' : 'text-white'}`}>
                                        {day}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>

                {/* Main Content Area */}
                <View className="flex-1 bg-[#F5F7FA] rounded-t-[30px] overflow-hidden px-6 pt-6">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-xl font-bold text-gray-800">{selectedDay}'s Menu</Text>
                        <TouchableOpacity
                            onPress={() => showToast('Pull down to refresh', 'info')}
                            className="bg-gray-200 p-2 rounded-full"
                        >
                            <Ionicons name="refresh" size={18} color="#666" />
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <View className="flex-1 justify-center items-center">
                            <StayLoader />
                            <Text className="text-gray-400 mt-4">Loading menu...</Text>
                        </View>
                    ) : (
                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 130 }}>
                            {MEAL_TYPES.map((meal) => {
                                const content = getMenuContent(meal.id);
                                return (
                                    <View key={meal.id} className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100">
                                        <View className="flex-row justify-between items-start mb-2">
                                            <View className="flex-row items-center">
                                                <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${meal.color}`}>
                                                    <Ionicons name={meal.icon} size={20} color={meal.text.replace('text-', '').replace('-600', '')} />
                                                </View>
                                                <Text className="text-lg font-bold text-gray-800">{meal.label}</Text>
                                            </View>
                                            <TouchableOpacity
                                                onPress={() => handleEditPress(meal)}
                                                className="bg-gray-100 p-2 rounded-lg active:bg-gray-200"
                                            >
                                                <Ionicons name="create-outline" size={20} color={theme.primary} />
                                            </TouchableOpacity>
                                        </View>

                                        {/* Menu Content Display */}
                                        <View className="bg-gray-50 rounded-xl p-3 min-h-[60px] justify-center ml-12">
                                            {content ? (
                                                <Text className="text-gray-700 font-medium text-base leading-6">
                                                    {content}
                                                </Text>
                                            ) : (
                                                <Text className="text-gray-400 italic">No menu set for {meal.label.toLowerCase()}</Text>
                                            )}
                                        </View>
                                    </View>
                                );
                            })}

                            {/* Empty State / Hint */}
                            <View className="mt-4 p-4 bg-blue-50 rounded-xl flex-row items-center">
                                <Ionicons name="information-circle" size={24} color="#3b82f6" style={{ marginRight: 12 }} />
                                <Text className="text-blue-700 flex-1 text-sm font-medium">
                                    Changes made here update instantly for all students viewing the mess schedule.
                                </Text>
                            </View>
                        </ScrollView>
                    )}
                </View>
            </SafeAreaView>

            {/* Edit Drawer */}
            <EditMealDrawer
                isVisible={isEditOpen}
                onClose={() => setEditOpen(false)}
                onSave={saveMenu}
                mealType={editingMeal}
                currentMenu={editingMeal ? getMenuContent(editingMeal.id) : ''}
                day={selectedDay}
                theme={theme}
            />
        </View>
    );
}

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { COLORS, FONTS, SHADOWS } from '../theme/theme';

import OwnerHome from '../screens/Owner/OwnerHome';
import Rooms from '../screens/Owner/Rooms';
import Students from '../screens/Owner/Students';
import Profile from '../screens/Owner/Profile';

const Tab = createBottomTabNavigator();

export default function OwnerTabs() {
    const { theme } = useTheme();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarShowLabel: false,
                tabBarIcon: ({ focused, color }) => {
                    let iconName;
                    if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
                    else if (route.name === 'Rooms') iconName = focused ? 'bed' : 'bed-outline';
                    else if (route.name === 'Students') iconName = focused ? 'people' : 'people-outline';
                    else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';

                    return (
                        <View style={{ marginTop: Platform.OS === 'ios' ? 0 : -5 }}>
                            <Ionicons name={iconName} size={34} color={color} />
                        </View>
                    );
                },
                tabBarActiveTintColor: theme.primary,
                tabBarInactiveTintColor: COLORS.gray600,
                tabBarStyle: {
                    height: Platform.OS === 'ios' ? 85 : 75,
                    backgroundColor: COLORS.white,
                    borderTopWidth: 0,
                    paddingTop: 0,
                    paddingBottom: Platform.OS === 'ios' ? 30 : 10,
                    ...SHADOWS.medium,
                },
            })}
        >
            <Tab.Screen
                name="Home"
                component={OwnerHome}
                options={{ tabBarLabel: 'Home' }}
            />
            <Tab.Screen
                name="Rooms"
                component={Rooms}
                options={{ tabBarLabel: 'Rooms' }}
            />
            <Tab.Screen
                name="Students"
                component={Students}
                options={{ tabBarLabel: 'Students' }}
            />
            <Tab.Screen
                name="Profile"
                component={Profile}
                options={{ tabBarLabel: 'Profile' }}
            />
        </Tab.Navigator>
    );
}


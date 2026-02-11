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
                tabBarStyle: { display: 'none' }, // Hide default tab bar

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


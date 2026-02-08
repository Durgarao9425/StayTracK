import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
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
                tabBarShowLabel: true,
                tabBarIcon: ({ focused, color }) => {
                    let iconName;
                    if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
                    else if (route.name === 'Rooms') iconName = focused ? 'bed' : 'bed-outline';
                    else if (route.name === 'Students') iconName = focused ? 'people' : 'people-outline';
                    else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';

                    return (
                        <Ionicons name={iconName} size={24} color={color} style={{ marginBottom: -4 }} />
                    );
                },
                tabBarActiveTintColor: theme.primary,
                tabBarInactiveTintColor: COLORS.gray400,
                tabBarLabelStyle: {
                    fontFamily: FONTS.medium, // Assuming medium font exists or falls back
                    fontSize: 10,
                    marginBottom: 4,
                },
                tabBarStyle: {
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: Platform.OS === 'ios' ? 80 : 60,
                    backgroundColor: COLORS.white,
                    borderTopWidth: 0,
                    paddingTop: 8,
                    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
                    ...SHADOWS.medium, // Use consistent shadow
                    elevation: 8,
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


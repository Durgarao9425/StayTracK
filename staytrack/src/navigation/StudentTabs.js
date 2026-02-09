import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import StudentHome from '../screens/Student/StudentHome';

const Tab = createBottomTabNavigator();

export default function StudentTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color }) => {
                    let iconName;
                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    }
                    return <Ionicons name={iconName} size={28} color={color} />;
                },
                tabBarActiveTintColor: '#16a34a', // Green-600
                tabBarInactiveTintColor: '#4B5563', // gray-600
                tabBarStyle: {
                    paddingBottom: Platform.OS === 'ios' ? 35 : 20,
                    paddingTop: 12,
                    height: Platform.OS === 'ios' ? 95 : 85,
                    backgroundColor: 'white',
                    borderTopWidth: 0,
                    elevation: 10,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontFamily: 'Inter',
                    marginBottom: 6,
                    fontWeight: 'bold'
                }
            })}
        >
            <Tab.Screen name="Home" component={StudentHome} />
            <Tab.Screen name="Profile" component={StudentHome} />
        </Tab.Navigator>
    );
}

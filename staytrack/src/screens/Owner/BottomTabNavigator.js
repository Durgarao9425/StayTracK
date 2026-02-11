import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BottomTabNavigator = ({ navigation, activeRoute = 'Home' }) => {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();

    const tabs = [
        {
            name: 'Home',
            icon: 'home',
            iconOutline: 'home-outline',
            label: t('common.home'),
            route: 'Home'
        },
        {
            name: 'Students',
            icon: 'people',
            iconOutline: 'add-circle',
            label: t('common.students'),
            route: 'Students'
        },
        {
            name: 'Rooms',
            icon: 'bed',
            iconOutline: 'layers-outline',
            label: t('rooms.title'),
            route: 'Rooms'
        },
        // {
        //     name: 'Menu',
        //     icon: 'grid',
        //     iconOutline: 'grid-outline',
        //     label: 'Menu',
        //     route: 'Menu'
        // },
        {
            name: 'Profile',
            icon: 'person-circle',
            iconOutline: 'person-circle-outline',
            label: t('common.profile'),
            route: 'Profile'
        }
    ];
    const handleTabPress = (route) => {
        if (route && navigation) {
            navigation.navigate(route);
        }
    };

    return (
        <View style={[styles.container, { paddingBottom: insets.bottom + 12 || 20, backgroundColor: '#FFFFFF' }]}>
            {/* Top Border Line */}
            <View style={styles.topBorder} />

            {/* Tab Items */}
            <View style={styles.tabsContainer}>
                {tabs.map((tab, index) => {
                    const isActive = activeRoute === tab.name;

                    return (
                        <TouchableOpacity
                            key={index}
                            style={styles.tabItem}
                            onPress={() => handleTabPress(tab.route)}
                            activeOpacity={0.7}
                        >
                            {/* Icon with Active Indicator */}
                            <View style={styles.iconContainer}>
                                <Ionicons
                                    name={isActive ? tab.icon : tab.iconOutline}
                                    size={26}
                                    color={isActive ? theme.primary : '#6B7280'}
                                />

                                {/* Active Indicator Dot */}
                                {isActive && (
                                    <View style={[styles.activeDot, { backgroundColor: theme.primary }]} />
                                )}
                            </View>

                            {/* Label */}
                            <Text
                                style={[
                                    styles.label,
                                    {
                                        color: isActive ? theme.primary : '#6B7280',
                                        fontWeight: isActive ? '700' : '500'
                                    }
                                ]}
                            >
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        // paddingBottom is handled dynamically
        paddingTop: 12,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 10,
    },
    topBorder: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: '#E5E7EB',
    },
    tabsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
    },
    iconContainer: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },
    activeDot: {
        position: 'absolute',
        bottom: -6,
        width: 4,
        height: 4,
        borderRadius: 2,
    },
    label: {
        fontSize: 11,
        marginTop: 2,
        letterSpacing: 0.2,
    },
});

export default BottomTabNavigator;
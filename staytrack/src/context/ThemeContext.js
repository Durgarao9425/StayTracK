import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Enhanced Theme colors with more visual properties
export const THEMES = {
    teal: {
        name: 'Ocean Teal',
        primary: '#00A8A8',
        primaryDark: '#007B7B',
        primaryLight: '#00C4C4',
        gradient: ['#00A8A8', '#007B7B'],
        icon: 'water',
        bgColor: '#E0F7F7',
        textColor: '#004D4D',
        emoji: '🌊',
    },
    purple: {
        name: 'Royal Purple',
        primary: '#8B5CF6',
        primaryDark: '#7C3AED',
        primaryLight: '#A78BFA',
        gradient: ['#8B5CF6', '#7C3AED'],
        icon: 'wine',
        bgColor: '#F3E8FF',
        textColor: '#5B21B6',
        emoji: '👑',
    },
    blue: {
        name: 'Sky Blue',
        primary: '#3B82F6',
        primaryDark: '#2563EB',
        primaryLight: '#60A5FA',
        gradient: ['#3B82F6', '#2563EB'],
        icon: 'snow',
        bgColor: '#DBEAFE',
        textColor: '#1E40AF',
        emoji: '☁️',
    },
    orange: {
        name: 'Sunset Orange',
        primary: '#F97316',
        primaryDark: '#EA580C',
        primaryLight: '#FB923C',
        gradient: ['#F97316', '#EA580C'],
        icon: 'flame',
        bgColor: '#FFEDD5',
        textColor: '#C2410C',
        emoji: '🔥',
    },
    pink: {
        name: 'Blossom Pink',
        primary: '#EC4899',
        primaryDark: '#DB2777',
        primaryLight: '#F472B6',
        gradient: ['#EC4899', '#DB2777'],
        icon: 'heart',
        bgColor: '#FCE7F3',
        textColor: '#BE185D',
        emoji: '🌸',
    },
    green: {
        name: 'Forest Green',
        primary: '#10B981',
        primaryDark: '#059669',
        primaryLight: '#34D399',
        gradient: ['#10B981', '#059669'],
        icon: 'leaf',
        bgColor: '#D1FAE5',
        textColor: '#047857',
        emoji: '🌿',
    },
    indigo: {
        name: 'Deep Indigo',
        primary: '#6366F1',
        primaryDark: '#4F46E5',
        primaryLight: '#818CF8',
        gradient: ['#6366F1', '#4F46E5'],
        icon: 'moon',
        bgColor: '#E0E7FF',
        textColor: '#3730A3',
        emoji: '🌙',
    },
    red: {
        name: 'Ruby Red',
        primary: '#EF4444',
        primaryDark: '#DC2626',
        primaryLight: '#F87171',
        gradient: ['#EF4444', '#DC2626'],
        icon: 'rose',
        bgColor: '#FEE2E2',
        textColor: '#991B1B',
        emoji: '💎',
    },
    amber: {
        name: 'Golden Amber',
        primary: '#F59E0B',
        primaryDark: '#D97706',
        primaryLight: '#FBBf24',
        gradient: ['#F59E0B', '#D97706'],
        icon: 'sunny',
        bgColor: '#FEF3C7',
        textColor: '#92400E',
        emoji: '⭐',
    },
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [currentTheme, setCurrentTheme] = useState('teal');

    // Load saved theme from AsyncStorage
    useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem('app_theme');
            if (savedTheme && THEMES[savedTheme]) {
                setCurrentTheme(savedTheme);
            }
        } catch (error) {
            console.error('Error loading theme:', error);
        }
    };

    const changeTheme = async (themeName) => {
        try {
            await AsyncStorage.setItem('app_theme', themeName);
            setCurrentTheme(themeName);
        } catch (error) {
            console.error('Error saving theme:', error);
        }
    };

    return (
        <ThemeContext.Provider value={{
            theme: THEMES[currentTheme],
            currentTheme,
            changeTheme,
            allThemes: THEMES
        }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
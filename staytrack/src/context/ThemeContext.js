import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Theme colors
export const THEMES = {
    teal: {
        name: 'Teal',
        primary: '#00A8A8',
        primaryDark: '#007B7B',
        primaryLight: '#00C4C4',
        gradient: ['#00A8A8', '#007B7B'],
        icon: 'water',
    },
    purple: {
        name: 'Purple',
        primary: '#8B5CF6',
        primaryDark: '#7C3AED',
        primaryLight: '#A78BFA',
        gradient: ['#8B5CF6', '#7C3AED'],
        icon: 'wine',
    },
    blue: {
        name: 'Blue',
        primary: '#3B82F6',
        primaryDark: '#2563EB',
        primaryLight: '#60A5FA',
        gradient: ['#3B82F6', '#2563EB'],
        icon: 'snow',
    },
    orange: {
        name: 'Orange',
        primary: '#F97316',
        primaryDark: '#EA580C',
        primaryLight: '#FB923C',
        gradient: ['#F97316', '#EA580C'],
        icon: 'flame',
    },
    pink: {
        name: 'Pink',
        primary: '#EC4899',
        primaryDark: '#DB2777',
        primaryLight: '#F472B6',
        gradient: ['#EC4899', '#DB2777'],
        icon: 'heart',
    },
    green: {
        name: 'Green',
        primary: '#10B981',
        primaryDark: '#059669',
        primaryLight: '#34D399',
        gradient: ['#10B981', '#059669'],
        icon: 'leaf',
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

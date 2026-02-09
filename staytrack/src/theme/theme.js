import { Platform } from 'react-native';

export const COLORS = {
    // Base
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',

    // Grays / Neutrals
    gray50: '#F9FAFB',
    gray100: '#F3F4F6',
    gray200: '#E5E7EB',
    gray300: '#D1D5DB',
    gray400: '#9CA3AF',
    gray500: '#6B7280',
    gray600: '#4B5563',
    gray700: '#374151',
    gray800: '#1F2937',
    gray900: '#111827',

    // Semantic
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',

    // Text
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
    textInverse: '#FFFFFF',

    // Backgrounds
    background: '#FFFFFF',
    backgroundSubtle: '#F9FAFB',
    surface: '#FFFFFF',
};

export const SPACING = {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
    gutter: 20, // Standard horizontal padding
};

export const RADII = {
    s: 8,
    m: 12,
    l: 16,
    xl: 24,
    full: 9999,
};

export const SHADOWS = {
    light: Platform.select({
        web: {
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        },
        default: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
        },
    }),
    medium: Platform.select({
        web: {
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        },
        default: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
        },
    }),
    heavy: Platform.select({
        web: {
            boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
        },
        default: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.15,
            shadowRadius: 16,
            elevation: 8,
        },
    }),
};

export const FONTS = {
    regular: 'Inter',
    bold: 'Inter-Bold',
    // Sizes
    h1: 32,
    h2: 24,
    h3: 20,
    body: 16,
    caption: 14,
    small: 12,
};

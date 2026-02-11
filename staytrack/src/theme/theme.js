import { Platform } from 'react-native';

export const COLORS = {
    // Brand Colors - Modern & Professional
    primary: '#00A8A8',      // Teal - trustworthy, modern
    primaryDark: '#008080',  // Darker teal
    primaryLight: '#E0F7F7', // Light teal background

    accent: '#FF6B3D',       // Vibrant orange for CTAs
    accentLight: '#FFE5DC', // Light orange background

    secondary: '#07A0F6',    // Bright blue for secondary actions
    secondaryLight: '#E3F5FF',

    // Success/Error States
    success: '#00C46A',      // Fresh green
    successLight: '#E6F9F0',
    error: '#FF4757',        // Vibrant red
    errorLight: '#FFE8EA',
    warning: '#FFB800',      // Golden yellow
    warningLight: '#FFF8E1',
    info: '#07A0F6',
    infoLight: '#E3F5FF',

    // Grays - Enhanced contrast
    gray50: '#FAFBFC',
    gray100: '#F4F5F7',
    gray200: '#E8EAED',
    gray300: '#D1D5DB',
    gray400: '#9CA3AF',
    gray500: '#6B7280',
    gray600: '#4B5563',
    gray700: '#374151',
    gray800: '#1F2937',
    gray900: '#0F172A',

    // Base
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',

    // Text
    textPrimary: '#0F172A',
    textSecondary: '#4B5563',
    textTertiary: '#9CA3AF',
    textInverse: '#FFFFFF',

    // Backgrounds
    background: '#FAFBFC',
    surface: '#FFFFFF',
    overlay: 'rgba(0, 0, 0, 0.5)',

    // Borders
    border: '#E8EAED',
    borderLight: '#F4F5F7',
};

export const SPACING = {
    xxs: 2,
    xs: 4,
    s: 8,
    sm: 12,
    m: 16,
    ml: 20,
    l: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
    gutter: 20,
};

export const RADII = {
    xs: 4,
    s: 8,
    m: 12,
    l: 16,
    xl: 20,
    xxl: 24,
    full: 9999,
};

export const SHADOWS = {
    none: {},
    sm: Platform.select({
        web: {
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        },
        default: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
        },
    }),
    md: Platform.select({
        web: {
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
        default: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 6,
            elevation: 3,
        },
    }),
    lg: Platform.select({
        web: {
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        },
        default: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 6,
        },
    }),
    xl: Platform.select({
        web: {
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        },
        default: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.12,
            shadowRadius: 16,
            elevation: 10,
        },
    }),
    colored: Platform.select({
        web: {
            boxShadow: '0 8px 24px -4px rgba(0, 168, 168, 0.25)',
        },
        default: {
            shadowColor: '#00A8A8',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 12,
            elevation: 8,
        },
    }),
};

export const FONTS = {
    // Font Families
    regular: 'Inter',
    medium: 'Inter-Medium',
    semibold: 'Inter-SemiBold',
    bold: 'Inter-Bold',

    // Font Sizes
    h1: 32,
    h2: 28,
    h3: 24,
    h4: 20,
    h5: 18,
    body: 16,
    bodyLarge: 18,
    bodySmall: 14,
    caption: 12,
    tiny: 10,
};

export const ANIMATIONS = {
    fast: 200,
    normal: 300,
    slow: 500,
};
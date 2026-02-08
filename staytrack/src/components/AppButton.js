import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS, RADII, FONTS, SHADOWS } from '../theme/theme';
import { useTheme } from '../context/ThemeContext';

export default function AppButton({
    title,
    onPress,
    loading = false,
    variant = 'primary', // primary, secondary, outline, text
    disabled = false,
    style,
    textStyle
}) {
    const { theme } = useTheme();

    const getBackgroundColor = () => {
        if (disabled) return COLORS.gray300;
        switch (variant) {
            case 'primary': return theme.primary; // Dynamic from context
            case 'secondary': return theme.primaryLight;
            case 'outline': return 'transparent';
            case 'text': return 'transparent';
            default: return theme.primary;
        }
    };

    const getTextColor = () => {
        if (disabled) return COLORS.gray500;
        switch (variant) {
            case 'primary': return COLORS.white;
            case 'secondary': return COLORS.white;
            case 'outline': return theme.primary;
            case 'text': return theme.primary;
            default: return COLORS.white;
        }
    };

    const getBorder = () => {
        if (variant === 'outline') return { borderWidth: 1, borderColor: theme.primary };
        return {};
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            style={[
                styles.button,
                { backgroundColor: getBackgroundColor() },
                getBorder(),
                variant === 'primary' && !disabled && SHADOWS.medium,
                style
            ]}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator color={getTextColor()} />
            ) : (
                <Text style={[
                    styles.text,
                    { color: getTextColor() },
                    textStyle
                ]}>
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        height: 54,
        borderRadius: RADII.l, // Modern rounded corners
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        flexDirection: 'row',
    },
    text: {
        fontFamily: FONTS.bold,
        fontSize: 16,
        letterSpacing: 0.5,
    }
});

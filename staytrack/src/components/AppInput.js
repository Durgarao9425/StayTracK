import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADII, FONTS, SPACING } from '../theme/theme';
import { useTheme } from '../context/ThemeContext';

export default function AppInput({
    label,
    value,
    onChangeText,
    placeholder,
    secureTextEntry,
    keyboardType = 'default',
    icon,
    error,
    autoCapitalize = 'none',
    containerStyle,
    multiline = false,
    numberOfLines = 1
}) {
    const { theme } = useTheme();
    const [isFocused, setIsFocused] = useState(false);

    // Fix for Web Autofill Background Overlap
    useEffect(() => {
        if (Platform.OS === 'web' && typeof document !== 'undefined') {
            const styleId = 'autofill-style-fix';
            if (!document.getElementById(styleId)) {
                const style = document.createElement('style');
                style.id = styleId;
                style.innerHTML = `
                    input:-webkit-autofill,
                    input:-webkit-autofill:hover, 
                    input:-webkit-autofill:focus, 
                    input:-webkit-autofill:active {
                        transition: background-color 5000s ease-in-out 0s;
                        -webkit-text-fill-color: ${COLORS.textPrimary} !important;
                    }
                `;
                document.head.appendChild(style);
            }
        }
    }, []);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    // Toggle password visibility if it's a password field
    const isPassword = secureTextEntry;
    const shouldShowText = isPassword ? isPasswordVisible : true;

    return (
        <View style={[styles.container, containerStyle]}>
            {label && <Text style={styles.label}>{label}</Text>}

            <View style={[
                styles.inputContainer,
                isFocused && { borderColor: theme.primary, backgroundColor: COLORS.white },
                error && { borderColor: COLORS.error }
            ]}>
                {icon && (
                    <Ionicons
                        name={icon}
                        size={20}
                        color={isFocused ? theme.primary : COLORS.gray400}
                        style={styles.icon}
                    />
                )}

                <TextInput
                    style={[
                        styles.input,
                        Platform.OS === 'web' && { outlineStyle: 'none' },
                        multiline && { height: 'auto', paddingTop: 12, minHeight: 100 }
                    ]}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={COLORS.gray400}
                    secureTextEntry={isPassword && !isPasswordVisible}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    selectionColor={theme.primary}
                    multiline={multiline}
                    numberOfLines={numberOfLines}
                />

                {isPassword && (
                    <TouchableOpacity
                        onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                        style={styles.eyeIcon}
                    >
                        <Ionicons
                            name={isPasswordVisible ? "eye-off" : "eye"}
                            size={20}
                            color={COLORS.gray400}
                        />
                    </TouchableOpacity>
                )}
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: SPACING.m,
    },
    label: {
        fontFamily: FONTS.bold,
        fontSize: 14,
        color: COLORS.gray700,
        marginBottom: 6,
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.gray50,
        borderRadius: RADII.m,
        borderWidth: 1,
        borderColor: COLORS.gray200,
        height: 54, // Standard height
        paddingHorizontal: 14,
        overflow: 'hidden',
    },
    input: {
        flex: 1,
        fontFamily: FONTS.regular,
        fontSize: 16,
        color: COLORS.textPrimary,
        height: '100%',
        paddingRight: 40, // Space for the eye icon
    },
    icon: {
        marginRight: 10,
    },
    eyeIcon: {
        position: 'absolute',
        right: 0,
        height: '100%',
        justifyContent: 'center',
        paddingHorizontal: 12, // Clickable area
    },
    errorText: {
        color: COLORS.error,
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
        fontFamily: FONTS.regular,
    }
});

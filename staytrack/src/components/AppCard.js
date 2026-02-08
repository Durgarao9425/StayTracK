import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS, RADII, SHADOWS, SPACING } from '../theme/theme';

export default function AppCard({ children, style, variant = 'elevated' }) {
    return (
        <View style={[
            styles.card,
            variant === 'elevated' && SHADOWS.medium,
            style
        ]}>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.white,
        borderRadius: RADII.xl,
        padding: SPACING.l,
        width: '100%',
    }
});

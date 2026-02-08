import React from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    View,
    StatusBar,
    StyleSheet,
    SafeAreaView
} from 'react-native';
import { COLORS, SPACING } from '../theme/theme';

export default function ScreenWrapper({
    children,
    scrollable = false,
    style,
    contentContainerStyle,
    backgroundColor = COLORS.background
}) {
    return (
        <SafeAreaView style={[styles.container, { backgroundColor }]}>
            <StatusBar barStyle="dark-content" backgroundColor={backgroundColor} />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                {scrollable ? (
                    <ScrollView
                        contentContainerStyle={[
                            styles.scrollContent,
                            contentContainerStyle
                        ]}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {children}
                    </ScrollView>
                ) : (
                    <View style={[styles.content, style]}>
                        {children}
                    </View>
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: SPACING.gutter,
        paddingBottom: SPACING.xl,
    },
    content: {
        flex: 1,
        paddingHorizontal: SPACING.gutter,
    },
});

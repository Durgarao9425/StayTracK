import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, ScrollView, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { CommonActions } from '@react-navigation/native';
import { auth } from '../config/firebase';
import { useTheme } from '../context/ThemeContext';
import showToast from '../utils/toast';
import { COLORS, SHADOWS, RADII, SPACING, FONTS } from '../theme/theme';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProfileHeader({ navigation }) {
    const [menuVisible, setMenuVisible] = useState(false);
    const [themeModalVisible, setThemeModalVisible] = useState(false);
    const { theme, currentTheme, changeTheme, allThemes } = useTheme();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            showToast('✅ Logged out successfully');

            setTimeout(() => {
                navigation.dispatch(
                    CommonActions.reset({
                        index: 0,
                        routes: [{ name: 'Auth' }],
                    })
                );
            }, 300);
        } catch (error) {
            console.error('Logout Error:', error);
            showToast('❌ Logout failed. Please try again.');
        }
    };

    const handleThemeChange = (themeName) => {
        changeTheme(themeName);
        setThemeModalVisible(false);
        showToast(`✅ Theme changed to ${allThemes[themeName].name}`);
    };

    const user = auth.currentUser;
    const initials = user?.displayName
        ? user.displayName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
        : user?.email?.substring(0, 2).toUpperCase() || 'U';

    return (
        <View style={styles.container}>
            <TouchableOpacity
                onPress={() => navigation.navigate("Notifications")}
                style={{ marginRight: 12 }}
                activeOpacity={0.7}
            >
                <Ionicons name="notifications-outline" size={26} color="white" />
            </TouchableOpacity>

            {/* Profile Picture Button */}
            <TouchableOpacity
                onPress={() => setMenuVisible(true)}
                style={styles.avatarContainer}
                activeOpacity={0.8}
            >
                <View style={[styles.avatarCircle, { borderColor: COLORS.gray100 }]}>
                    <Text style={[styles.avatarText, { color: theme.primary }]}>{initials}</Text>
                </View>
                <View style={styles.badge}>
                    <Ionicons name="checkmark" size={10} color="white" />
                </View>
            </TouchableOpacity>

            {/* COMPACT DROP-DOWN MENU */}
            <Modal
                visible={menuVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setMenuVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setMenuVisible(false)}
                >
                    <View style={styles.dropdownMenu}>
                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => {
                                setMenuVisible(false);
                                setThemeModalVisible(true);
                            }}
                        >
                            <Ionicons name="color-palette-outline" size={24} color={COLORS.gray600} />
                            <Text style={styles.menuText}>Themes</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => {
                                setMenuVisible(false);
                                // Navigate to settings
                            }}
                        >
                            <Ionicons name="settings-outline" size={24} color={COLORS.gray600} />
                            <Text style={styles.menuText}>Settings</Text>
                        </TouchableOpacity>

                        <View style={styles.divider} />

                        <TouchableOpacity
                            style={[styles.menuItem, styles.logoutItem]}
                            onPress={() => {
                                setMenuVisible(false);
                                handleLogout();
                            }}
                        >
                            <Ionicons name="log-out-outline" size={24} color={COLORS.error} />
                            <Text style={[styles.menuText, { color: COLORS.error }]}>Logout</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* MODERN THEME SELECTOR MODAL */}
            <Modal
                visible={themeModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setThemeModalVisible(false)}
            >
                <View style={styles.fullScreenOverlay}>
                    <TouchableOpacity
                        style={styles.overlayTouchable}
                        activeOpacity={1}
                        onPress={() => setThemeModalVisible(false)}
                    />

                    <View style={styles.modernBottomSheet}>
                        {/* Handle */}
                        <View style={styles.handleBar} />

                        {/* Header */}
                        <View style={styles.sheetHeader}>
                            <Text style={styles.sheetTitle}>🎨 Choose Your Theme</Text>
                            <Text style={styles.sheetSubtitle}>Personalize your app experience</Text>
                        </View>

                        {/* Themes Scroll View */}
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.themesScrollContent}
                        >
                            {Object.entries(allThemes).map(([key, themeData]) => {
                                const isSelected = currentTheme === key;

                                return (
                                    <TouchableOpacity
                                        key={key}
                                        style={[
                                            styles.modernThemeCard,
                                            isSelected && styles.selectedThemeCard
                                        ]}
                                        onPress={() => handleThemeChange(key)}
                                        activeOpacity={0.7}
                                    >
                                        <LinearGradient
                                            colors={themeData.gradient}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                            style={styles.gradientBackground}
                                        >
                                            {/* Selected Check Mark */}
                                            {isSelected && (
                                                <View style={styles.selectedBadge}>
                                                    <Ionicons name="checkmark-circle" size={28} color="white" />
                                                </View>
                                            )}

                                            {/* Theme Emoji */}
                                            <Text style={styles.themeEmoji}>{themeData.emoji}</Text>

                                            {/* Theme Name */}
                                            <Text style={styles.modernThemeName}>{themeData.name}</Text>

                                            {/* Color Preview Dots */}
                                            <View style={styles.colorDotsContainer}>
                                                <View style={[styles.colorDot, { backgroundColor: themeData.primary }]} />
                                                <View style={[styles.colorDot, { backgroundColor: themeData.primaryDark }]} />
                                                <View style={[styles.colorDot, { backgroundColor: themeData.primaryLight }]} />
                                            </View>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>

                        {/* Footer Note */}
                        <View style={styles.sheetFooter}>
                            <Text style={styles.footerText}>Your theme preference is saved automatically</Text>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        zIndex: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        position: 'relative',
        width: 50,
        height: 50,
    },
    avatarCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: COLORS.white,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        ...SHADOWS.light,
    },
    avatarText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    badge: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        backgroundColor: '#22C55E',
        width: 18,
        height: 18,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: COLORS.white,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    dropdownMenu: {
        position: 'absolute',
        top: 60,
        right: 20,
        backgroundColor: COLORS.white,
        borderRadius: 16,
        width: 180,
        paddingVertical: 8,
        ...SHADOWS.medium,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    menuText: {
        marginLeft: 16,
        fontWeight: '500',
        color: COLORS.gray700,
        fontSize: 16,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.gray100,
        marginVertical: 4,
    },
    logoutItem: {
        backgroundColor: '#FEF2F2',
    },

    // MODERN THEME SELECTOR STYLES
    fullScreenOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    overlayTouchable: {
        flex: 1,
    },
    modernBottomSheet: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingTop: 12,
        paddingBottom: 40,
        maxHeight: '85%',
    },
    handleBar: {
        width: 48,
        height: 5,
        backgroundColor: COLORS.gray300,
        borderRadius: 3,
        alignSelf: 'center',
        marginBottom: 20,
    },
    sheetHeader: {
        paddingHorizontal: 24,
        marginBottom: 24,
    },
    sheetTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: COLORS.gray900,
        marginBottom: 6,
    },
    sheetSubtitle: {
        fontSize: 15,
        color: COLORS.gray500,
    },
    themesScrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 20,
    },
    modernThemeCard: {
        borderRadius: 20,
        marginBottom: 16,
        overflow: 'hidden',
        ...SHADOWS.medium,
    },
    selectedThemeCard: {
        transform: [{ scale: 1.02 }],
        ...SHADOWS.large,
    },
    gradientBackground: {
        padding: 24,
        minHeight: 140,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    selectedBadge: {
        position: 'absolute',
        top: 16,
        right: 16,
    },
    themeEmoji: {
        fontSize: 48,
        marginBottom: 12,
    },
    modernThemeName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 12,
        textAlign: 'center',
    },
    colorDotsContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    colorDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.5)',
    },
    sheetFooter: {
        paddingHorizontal: 24,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: COLORS.gray100,
        marginTop: 8,
    },
    footerText: {
        fontSize: 13,
        color: COLORS.gray500,
        textAlign: 'center',
    },
});
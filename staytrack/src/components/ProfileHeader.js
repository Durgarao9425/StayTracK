import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { CommonActions } from '@react-navigation/native';
import { auth } from '../config/firebase';
import { useTheme } from '../context/ThemeContext';
import showToast from '../utils/toast';
import { COLORS, SHADOWS, RADII, SPACING, FONTS } from '../theme/theme';

export default function ProfileHeader({ navigation }) {
    const [menuVisible, setMenuVisible] = useState(false);
    const [themeModalVisible, setThemeModalVisible] = useState(false);
    const { theme, currentTheme, changeTheme, allThemes } = useTheme();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            showToast('✅ Logged out successfully');

            // Reset navigation stack and go to Auth
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

            {/* THEME SELECTOR MODAL */}
            <Modal
                visible={themeModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setThemeModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.bottomSheetOverlay}
                    activeOpacity={1}
                    onPress={() => setThemeModalVisible(false)}
                >
                    <View style={styles.bottomSheetContent}>
                        <View style={styles.bottomSheetHandle} />
                        <Text style={styles.bottomSheetTitle}>Choose App Theme</Text>

                        <View style={styles.themesGrid}>
                            {Object.entries(allThemes).map(([key, themeData]) => (
                                <TouchableOpacity
                                    key={key}
                                    style={styles.themeItemWrapper}
                                    onPress={() => handleThemeChange(key)}
                                >
                                    <View style={[
                                        styles.themeCard,
                                        currentTheme === key ? { borderColor: themeData.primary, backgroundColor: `${themeData.primary}10`, borderWidth: 2 } : { borderColor: COLORS.gray100 }
                                    ]}>
                                        <View style={[styles.themeIconCircle, { backgroundColor: themeData.primary }]}>
                                            <Ionicons name={themeData.icon} size={20} color="white" />
                                        </View>
                                        <Text style={styles.themeName}>{themeData.name}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        zIndex: 10,
    },
    avatarContainer: {
        position: 'relative',
        width: 44,
        height: 44,
    },
    avatarCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.white,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        ...SHADOWS.light,
    },
    avatarText: {
        fontSize: 14,
        fontFamily: FONTS.bold,
    },
    badge: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        backgroundColor: '#22C55E', // green-500
        width: 16,
        height: 16,
        borderRadius: 8,
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
        right: 24,
        backgroundColor: COLORS.white,
        borderRadius: RADII.l,
        width: 180,
        paddingVertical: SPACING.s,
        ...SHADOWS.medium,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: SPACING.m,
    },
    menuText: {
        marginLeft: SPACING.m,
        fontFamily: FONTS.medium,
        color: COLORS.gray700,
        fontSize: 16,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.gray100,
        marginVertical: 4,
    },
    logoutItem: {
        backgroundColor: '#FEF2F2', // red-50 active state simulated
    },
    bottomSheetOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    bottomSheetContent: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: SPACING.xl,
        paddingBottom: 40,
    },
    bottomSheetHandle: {
        width: 48,
        height: 6,
        backgroundColor: COLORS.gray300,
        borderRadius: 3,
        alignSelf: 'center',
        marginBottom: SPACING.l,
    },
    bottomSheetTitle: {
        fontSize: 20,
        fontFamily: FONTS.bold,
        color: COLORS.gray900,
        marginBottom: SPACING.l,
        textAlign: 'center',
    },
    themesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -8,
    },
    themeItemWrapper: {
        width: '33.33%',
        padding: 8,
    },
    themeCard: {
        alignItems: 'center',
        padding: SPACING.m,
        borderRadius: RADII.m,
        borderWidth: 1,
    },
    themeIconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    themeName: {
        fontSize: 12,
        fontFamily: FONTS.medium,
        color: COLORS.gray700,
    },
});

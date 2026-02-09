import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import showToast from '../utils/toast';
import { ScreenWrapper, AppInput, AppButton } from '../components';
import { COLORS, FONTS, SPACING, RADII, SHADOWS } from '../theme/theme';
import { useTheme } from '../context/ThemeContext';

export default function SignupScreen({ navigation }) {
    const { theme } = useTheme();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [hostelDetails, setHostelDetails] = useState("");
    const [loading, setLoading] = useState(false);

    const [errors, setErrors] = useState({});

    const handleSignup = async () => {
        let newErrors = {};

        // Validation - Check each field specifically
        if (!username.trim()) {
            newErrors.username = "⚠️ Username is required";
        }

        if (!email.trim()) {
            newErrors.email = "⚠️ Email is required";
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email.trim())) {
                newErrors.email = "❌ Email format is wrong!";
            }
        }

        if (!hostelDetails.trim()) {
            newErrors.hostelDetails = "⚠️ Hostel/PG Name is required";
        }

        if (!password) {
            newErrors.password = "⚠️ Password is required";
        } else if (password.length < 6) {
            newErrors.password = "⚠️ Password should be at least 6 characters";
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = "⚠️ Confirm Password is required";
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = "⚠️ Passwords do not match";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);

        try {
            // 1. Create Authentication User
            const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
            const user = userCredential.user;

            // 2. Update user profile with displayName
            await updateProfile(user, {
                displayName: username
            });

            // 3. Store User Details in Firestore
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                displayName: username,
                name: username,
                email: email.trim(),
                hostelDetails: hostelDetails,
                createdAt: new Date().toISOString(),
                role: 'Owner'
            });

            console.log("✅ Account created successfully for:", email);
            showToast(`✅ Welcome ${username}! Account created successfully!`, 'success');

            // 4. Navigate to Dashboard
            setTimeout(() => {
                navigation.replace("OwnerRoot");
            }, 500);

        } catch (error) {
            console.error("❌ Signup Error:", error);
            let errorMessage = "❌ Signup failed. Please try again.";
            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = "⚠️ Email already in use. Please login.";
                    break;
                case 'auth/invalid-email':
                    errorMessage = "❌ Invalid email address.";
                    break;
                case 'auth/weak-password':
                    errorMessage = "⚠️ Password is too weak.";
                    break;
                default:
                    errorMessage = `❌ Signup failed: ${error.message}`;
            }
            showToast(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenWrapper scrollable>
            <View style={styles.header}>
                {/* DECORATED LOGO AREA */}
                <View style={styles.logoWrapper}>
                    {/* Corner Dots */}
                    <View style={[styles.dot, styles.topLeft, { backgroundColor: '#FF6B3D' }]} />
                    <View style={[styles.dot, styles.topRight, { backgroundColor: '#07A0F6' }]} />
                    <View style={[styles.dot, styles.bottomLeft, { backgroundColor: '#00C46A' }]} />
                    <View style={[styles.dot, styles.bottomRight, { backgroundColor: '#FFB800' }]} />

                    {/* Logo Circle */}
                    <View style={[styles.logoCircle, { borderColor: theme.primary }]}>
                        <Image
                            source={require('../../assets/logo.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                    </View>
                </View>

                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Sign up to get started</Text>
            </View>

            <View style={styles.form}>
                <AppInput
                    label="Username"
                    value={username}
                    onChangeText={(text) => {
                        setUsername(text);
                        if (errors.username) setErrors({ ...errors, username: null });
                    }}
                    placeholder="Enter username"
                    icon="person-outline"
                    error={errors.username}
                />

                <AppInput
                    label="Email"
                    value={email}
                    onChangeText={(text) => {
                        setEmail(text);
                        if (errors.email) setErrors({ ...errors, email: null });
                    }}
                    placeholder="Enter email address"
                    keyboardType="email-address"
                    icon="mail-outline"
                    error={errors.email}
                />

                <AppInput
                    label="Hostel/PG Name"
                    value={hostelDetails}
                    onChangeText={(text) => {
                        setHostelDetails(text);
                        if (errors.hostelDetails) setErrors({ ...errors, hostelDetails: null });
                    }}
                    placeholder="Enter your Hotel/PG name"
                    icon="business-outline"
                    error={errors.hostelDetails}
                />

                <AppInput
                    label="Password"
                    value={password}
                    onChangeText={(text) => {
                        setPassword(text);
                        if (errors.password) setErrors({ ...errors, password: null });
                    }}
                    placeholder="Create a password"
                    secureTextEntry
                    icon="lock-closed-outline"
                    error={errors.password}
                />

                <AppInput
                    label="Confirm Password"
                    value={confirmPassword}
                    onChangeText={(text) => {
                        setConfirmPassword(text);
                        if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: null });
                    }}
                    placeholder="Confirm your password"
                    secureTextEntry
                    icon="lock-closed-outline"
                    error={errors.confirmPassword}
                />

                <AppButton
                    title="Create Account"
                    onPress={handleSignup}
                    loading={loading}
                    style={styles.button}
                />
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                    <Text style={[styles.link, { color: theme.primary }]}>Login</Text>
                </TouchableOpacity>
            </View>
        </ScreenWrapper>
    );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
    header: {
        alignItems: 'center',
        marginTop: height * 0.08, // Responsive top margin
        marginBottom: height * 0.04,
    },
    logoWrapper: {
        position: 'relative',
        marginBottom: height * 0.04, // Responsive margin
    },
    logoCircle: {
        width: width * 0.32,
        height: width * 0.32,
        borderRadius: (width * 0.32) / 2,
        backgroundColor: COLORS.gray50,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        ...SHADOWS.medium,
    },
    logo: {
        width: '60%',
        height: '60%',
    },
    dot: {
        position: 'absolute',
        width: width * 0.035,
        height: width * 0.035,
        borderRadius: (width * 0.035) / 2,
        zIndex: 10,
    },
    topLeft: { top: 0, left: 0 },
    topRight: { top: 0, right: 0 },
    bottomLeft: { bottom: 0, left: 0 },
    bottomRight: { bottom: 0, right: 0 },
    title: {
        fontFamily: FONTS.bold,
        fontSize: width * 0.075,
        color: COLORS.gray900,
        marginBottom: SPACING.xs,
    },
    subtitle: {
        fontFamily: FONTS.regular,
        fontSize: width * 0.04,
        color: COLORS.gray500,
    },
    form: {
        marginBottom: height * 0.05,
    },
    button: {
        marginTop: height * 0.02,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: height * 0.05,
    },
    footerText: {
        fontFamily: FONTS.regular,
        color: COLORS.gray600,
        fontSize: width * 0.035,
    },
    link: {
        fontFamily: FONTS.bold,
        fontSize: width * 0.035,
    }
});


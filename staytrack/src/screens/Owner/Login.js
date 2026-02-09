import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../config/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import showToast from "../../utils/toast";
import { ScreenWrapper, AppInput, AppButton, AppCard } from "../../components";
import { COLORS, FONTS, SPACING, RADII } from "../../theme/theme";
import { useTheme } from "../../context/ThemeContext";

export default function Login({ navigation }) {
    const { theme } = useTheme();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const [errors, setErrors] = useState({});

    const handleLogin = async () => {
        let newErrors = {};

        // 1. Validation Clean and Specific
        if (!email.trim()) {
            newErrors.email = "⚠️ Email is required";
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email.trim())) {
                newErrors.email = "⚠️ Please enter a valid email address";
            }
        }

        if (!password) {
            newErrors.password = "⚠️ Password is required";
        } else if (password.length < 6) {
            newErrors.password = "⚠️ Password must be at least 6 characters";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
            const user = userCredential.user;

            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) {
                await setDoc(userDocRef, {
                    email: user.email,
                    displayName: user.email.split('@')[0],
                    role: "Owner",
                    createdAt: new Date().toISOString()
                });
            }

            // showToast(`✅ Welcome back, ${user.email.split('@')[0]}!`, 'success');

            setTimeout(() => {
                navigation.replace("OwnerRoot");
            }, 500);

        } catch (error) {
            const msg = {
                "auth/user-not-found": "❌ No account found with this email.",
                "auth/wrong-password": "❌ Incorrect password.",
                "auth/invalid-credential": "❌ Invalid email or password.",
                "auth/invalid-email": "❌ Invalid email format.",
                "auth/user-disabled": "❌ This account has been disabled.",
                "auth/too-many-requests": "⚠️ Too many attempts. Try again later.",
                "auth/network-request-failed": "⚠️ Network error. Check connection.",
            }[error.code] || `❌ Login failed: ${error.message}`;

            showToast(msg, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenWrapper backgroundColor={theme.primary} scrollable>
            <View style={styles.container}>
                <AppCard style={styles.card}>
                    {/* DECORATIVE STRIPES */}
                    <View style={styles.stripesTop}>
                        <View style={[styles.stripe, { backgroundColor: '#FF6B3D' }]} />
                        <View style={[styles.stripe, { backgroundColor: '#07A0F6' }]} />
                        <View style={[styles.stripe, { backgroundColor: '#00C46A' }]} />
                    </View>

                    <View style={styles.stripesBottom}>
                        <View style={[styles.stripe, { backgroundColor: '#07A0F6' }]} />
                        <View style={[styles.stripe, { backgroundColor: '#FF6B3D' }]} />
                        <View style={[styles.stripe, { backgroundColor: '#00C46A' }]} />
                    </View>

                    {/* HEADER */}
                    <View style={styles.header}>
                        <View style={styles.logoContainer}>
                            <Image
                                source={require('../../../assets/logo.png')}
                                style={styles.logo}
                            />
                        </View>
                        <Text style={styles.title}>Welcome Back!</Text>
                        <Text style={styles.subtitle}>Sign in to continue</Text>
                    </View>

                    {/* FORM */}
                    <View style={styles.form}>
                        <AppInput
                            label="Email Address"
                            placeholder="Enter your email"
                            value={email}
                            onChangeText={(text) => {
                                setEmail(text);
                                if (errors.email) setErrors({ ...errors, email: null });
                            }}
                            keyboardType="email-address"
                            icon="mail-outline"
                            error={errors.email}
                        />

                        <AppInput
                            label="Password"
                            placeholder="Enter your password"
                            value={password}
                            onChangeText={(text) => {
                                setPassword(text);
                                if (errors.password) setErrors({ ...errors, password: null });
                            }}
                            secureTextEntry
                            icon="lock-closed-outline"
                            error={errors.password}
                        />

                        <AppButton
                            title="Sign In"
                            onPress={handleLogin}
                            loading={loading}
                            style={styles.button}
                        />
                    </View>

                    {/* FOOTER */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Don't have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
                            <Text style={[styles.link, { color: theme.primary }]}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>
                </AppCard>
            </View>
        </ScreenWrapper>
    );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        paddingVertical: height * 0.05,
        minHeight: '100%',
    },
    card: {
        borderRadius: width * 0.1,
        paddingVertical: height * 0.06,
        paddingHorizontal: width * 0.08,
        alignItems: 'center',
        overflow: 'hidden',
        position: 'relative',
        width: width * 0.9,
        alignSelf: 'center',
    },
    stripesTop: {
        position: 'absolute',
        top: height * 0.03,
        left: width * 0.06,
        flexDirection: 'row',
        gap: 8,
    },
    stripesBottom: {
        position: 'absolute',
        bottom: height * 0.03,
        right: width * 0.06,
        flexDirection: 'row',
        gap: 8,
    },
    stripe: {
        width: width * 0.1,
        height: 8,
        borderRadius: 4,
    },
    header: {
        alignItems: 'center',
        marginBottom: height * 0.02,
        width: '100%',
    },
    logoContainer: {
        marginBottom: 0,
    },
    logo: {
        width: width * 0.35,
        height: width * 0.35,
        resizeMode: "contain",
    },
    title: {
        fontFamily: FONTS.bold,
        fontSize: width * 0.06, // Responsive font size
        color: COLORS.gray900,
        marginBottom: 4,
    },
    subtitle: {
        fontFamily: FONTS.regular,
        fontSize: width * 0.04,
        color: COLORS.gray500,
    },
    form: {
        width: '100%',
        marginBottom: height * 0.03,
    },
    button: {
        marginTop: height * 0.02,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
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

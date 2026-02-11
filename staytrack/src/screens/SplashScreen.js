import React, { useEffect, useRef } from "react";
import { useTranslation } from 'react-i18next';
import { View, Text, ActivityIndicator, Image, Animated, Easing, Platform, StyleSheet, Dimensions } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebase";

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ navigation }) {
    const { t } = useTranslation();
    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.5)).current;
    const logoRotate = useRef(new Animated.Value(0)).current;
    const ringRotate = useRef(new Animated.Value(0)).current;
    const textFadeAnim = useRef(new Animated.Value(0)).current;
    const textSlideAnim = useRef(new Animated.Value(30)).current;
    const dotsAnim = useRef(new Animated.Value(0)).current;
    const progressAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Logo entrance animation
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: Platform.OS !== 'web',
                easing: Easing.out(Easing.cubic),
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 6,
                tension: 50,
                useNativeDriver: Platform.OS !== 'web',
            }),
        ]).start();

        // Ring rotation animation
        Animated.loop(
            Animated.timing(ringRotate, {
                toValue: 1,
                duration: 4000,
                easing: Easing.linear,
                useNativeDriver: Platform.OS !== 'web',
            })
        ).start();

        // Logo subtle rotation
        Animated.loop(
            Animated.sequence([
                Animated.timing(logoRotate, {
                    toValue: 1,
                    duration: 2000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: Platform.OS !== 'web',
                }),
                Animated.timing(logoRotate, {
                    toValue: 0,
                    duration: 2000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: Platform.OS !== 'web',
                }),
            ])
        ).start();

        // Text animation (delayed)
        setTimeout(() => {
            Animated.parallel([
                Animated.timing(textFadeAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: Platform.OS !== 'web',
                }),
                Animated.timing(textSlideAnim, {
                    toValue: 0,
                    duration: 500,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: Platform.OS !== 'web',
                }),
            ]).start();
        }, 400);

        // Progress bar animation
        setTimeout(() => {
            Animated.timing(progressAnim, {
                toValue: 1,
                duration: 1500,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: false,
            }).start();
        }, 600);

        // Dots pulse animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(dotsAnim, {
                    toValue: 1,
                    duration: 800,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: Platform.OS !== 'web',
                }),
                Animated.timing(dotsAnim, {
                    toValue: 0,
                    duration: 800,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: Platform.OS !== 'web',
                }),
            ])
        ).start();

        const checkAppState = async () => {
            const isFirstTime = await AsyncStorage.getItem('isFirstTimeUser');

            if (isFirstTime === null) {
                setTimeout(() => navigation.replace("Onboarding"), 2500);
                return;
            }

            onAuthStateChanged(auth, (user) => {
                setTimeout(() => {
                    if (user) navigation.replace("OwnerRoot");
                    else navigation.replace("Login");
                }, 2500);
            });
        };

        checkAppState();
    }, []);

    // Rotation interpolations
    const ringRotation = ringRotate.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const logoRotation = logoRotate.interpolate({
        inputRange: [0, 1],
        outputRange: ['-5deg', '5deg'],
    });

    const progressWidth = progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '70%'],
    });

    return (
        <View style={styles.container}>
            {/* Background Gradient Effect */}
            <View style={styles.backgroundGradient}>
                <View style={styles.gradientCircle1} />
                <View style={styles.gradientCircle2} />
                <View style={styles.gradientCircle3} />
            </View>

            {/* Main Content */}
            <View style={styles.content}>
                {/* Animated Logo Container */}
                <Animated.View
                    collapsable={Platform.OS === 'web' ? undefined : false}
                    style={[
                        styles.logoContainer,
                        {
                            opacity: fadeAnim,
                            transform: [
                                { scale: scaleAnim },
                                { rotate: logoRotation }
                            ],
                        }
                    ]}
                >
                    {/* Outer Rotating Ring */}
                    <Animated.View
                        style={[
                            styles.rotatingRing,
                            { transform: [{ rotate: ringRotation }] }
                        ]}
                    >
                        <View style={styles.ringSegment1} />
                        <View style={styles.ringSegment2} />
                        <View style={styles.ringSegment3} />
                    </Animated.View>

                    {/* Logo Background Circle */}
                    <View style={styles.logoCircle}>
                        <View style={styles.logoInner}>
                            <Image
                                source={require('../../assets/logo.png')}
                                resizeMode="contain"
                                style={styles.logo}
                            />
                        </View>
                    </View>

                    {/* Accent Dots */}
                    <Animated.View
                        style={[
                            styles.accentDot,
                            styles.dot1,
                            { opacity: dotsAnim }
                        ]}
                    />
                    <Animated.View
                        style={[
                            styles.accentDot,
                            styles.dot2,
                            {
                                opacity: dotsAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [1, 0]
                                })
                            }
                        ]}
                    />
                    <Animated.View
                        style={[
                            styles.accentDot,
                            styles.dot3,
                            { opacity: dotsAnim }
                        ]}
                    />
                    <Animated.View
                        style={[
                            styles.accentDot,
                            styles.dot4,
                            {
                                opacity: dotsAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [1, 0]
                                })
                            }
                        ]}
                    />
                </Animated.View>

                {/* Animated Text */}
                <Animated.View
                    style={[
                        styles.textContainer,
                        {
                            opacity: textFadeAnim,
                            transform: [{ translateY: textSlideAnim }],
                        }
                    ]}
                >
                    <Text style={styles.brandName}>StayTrack</Text>
                    <Text style={styles.tagline}>{t('splash.tagline')}</Text>

                    {/* Progress Bar */}
                    <View style={styles.progressBarContainer}>
                        <Animated.View
                            style={[
                                styles.progressBar,
                                { width: progressWidth }
                            ]}
                        />
                    </View>
                </Animated.View>

                {/* Loading Indicator */}
                <Animated.View style={[styles.loader, { opacity: textFadeAnim }]}>
                    <ActivityIndicator size="large" color="#00A8A8" />
                    <Text style={styles.loadingText}>{t('splash.loading')}</Text>
                </Animated.View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>{t('splash.poweredBy')}</Text>
                <Text style={styles.version}>v1.0.0</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    backgroundGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
    },
    gradientCircle1: {
        position: 'absolute',
        width: 400,
        height: 400,
        borderRadius: 200,
        backgroundColor: '#E0F7F7',
        opacity: 0.5,
        top: -150,
        right: -100,
    },
    gradientCircle2: {
        position: 'absolute',
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: '#FFE5DC',
        opacity: 0.4,
        bottom: -100,
        left: -80,
    },
    gradientCircle3: {
        position: 'absolute',
        width: 250,
        height: 250,
        borderRadius: 125,
        backgroundColor: '#E3F5FF',
        opacity: 0.3,
        top: height * 0.4,
        left: width * 0.3,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    logoContainer: {
        position: 'relative',
        marginBottom: 40,
        width: 180,
        height: 180,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rotatingRing: {
        position: 'absolute',
        width: 180,
        height: 180,
        justifyContent: 'center',
        alignItems: 'center',
    },
    ringSegment1: {
        position: 'absolute',
        width: 180,
        height: 180,
        borderRadius: 90,
        borderWidth: 3,
        borderColor: 'transparent',
        borderTopColor: '#00A8A8',
        borderRightColor: '#00A8A8',
    },
    ringSegment2: {
        position: 'absolute',
        width: 160,
        height: 160,
        borderRadius: 80,
        borderWidth: 2,
        borderColor: 'transparent',
        borderBottomColor: '#FF6B3D',
        borderLeftColor: '#FF6B3D',
    },
    ringSegment3: {
        position: 'absolute',
        width: 140,
        height: 140,
        borderRadius: 70,
        borderWidth: 2,
        borderColor: 'transparent',
        borderTopColor: '#07A0F6',
    },
    logoCircle: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: '#E0F7F7',
        justifyContent: 'center',
        alignItems: 'center',
        ...Platform.select({
            web: {
                boxShadow: '0 8px 24px rgba(0, 168, 168, 0.2)'
            },
            default: {
                shadowColor: '#00A8A8',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.2,
                shadowRadius: 24,
                elevation: 12,
            }
        }),
    },
    logoInner: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: 85,
        height: 85,
    },
    accentDot: {
        position: 'absolute',
        width: 14,
        height: 14,
        borderRadius: 7,
    },
    dot1: {
        backgroundColor: '#FF6B3D',
        top: 10,
        left: 10,
    },
    dot2: {
        backgroundColor: '#07A0F6',
        top: 10,
        right: 10,
    },
    dot3: {
        backgroundColor: '#00C46A',
        bottom: 10,
        left: 10,
    },
    dot4: {
        backgroundColor: '#FFB800',
        bottom: 10,
        right: 10,
    },
    textContainer: {
        alignItems: 'center',
        marginBottom: 50,
    },
    brandName: {
        fontSize: 42,
        fontWeight: '800',
        color: '#0F172A',
        letterSpacing: -1,
        marginBottom: 8,
    },
    tagline: {
        fontSize: 16,
        color: '#6B7280',
        fontWeight: '500',
        marginBottom: 30,
    },
    progressBarContainer: {
        width: 200,
        height: 4,
        backgroundColor: '#E8EAED',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#00A8A8',
        borderRadius: 2,
    },
    loader: {
        alignItems: 'center',
        gap: 12,
    },
    loadingText: {
        fontSize: 14,
        color: '#9CA3AF',
        fontWeight: '500',
        marginTop: 8,
    },
    footer: {
        alignItems: 'center',
        paddingBottom: 30,
    },
    footerText: {
        fontSize: 12,
        color: '#9CA3AF',
        fontWeight: '500',
    },
    version: {
        fontSize: 10,
        color: '#D1D5DB',
        marginTop: 4,
    },
});
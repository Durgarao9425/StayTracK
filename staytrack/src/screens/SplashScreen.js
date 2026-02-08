import React, { useEffect, useRef } from "react";
import { View, Text, ActivityIndicator, Image, Animated, Easing } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebase";

export default function SplashScreen({ navigation }) {
    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.3)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const textFadeAnim = useRef(new Animated.Value(0)).current;
    const textSlideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        // Logo fade-in and scale animation
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
                easing: Easing.out(Easing.cubic),
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 4,
                tension: 40,
                useNativeDriver: true,
            }),
        ]).start();

        // Continuous pulse animation for logo
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.1,
                    duration: 1000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Continuous rotation for decorative ring
        Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 3000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();

        // Text fade-in and slide-up animation (delayed)
        setTimeout(() => {
            Animated.parallel([
                Animated.timing(textFadeAnim, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: true,
                }),
                Animated.timing(textSlideAnim, {
                    toValue: 0,
                    duration: 600,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
            ]).start();
        }, 300);

        const checkAppState = async () => {
            const isFirstTime = await AsyncStorage.getItem('isFirstTimeUser');

            if (isFirstTime === null) {
                setTimeout(() => navigation.replace("Onboarding"), 2000);
                return;
            }

            onAuthStateChanged(auth, (user) => {
                setTimeout(() => {
                    if (user) navigation.replace("OwnerRoot");
                    else navigation.replace("Login");
                }, 2000);
            });
        };

        checkAppState();
    }, []);

    // Rotation interpolation
    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <View className="flex-1 bg-white justify-center items-center">

            {/* ANIMATED LOGO CONTAINER */}
            <Animated.View
                style={{
                    opacity: fadeAnim,
                    transform: [
                        { scale: Animated.multiply(scaleAnim, pulseAnim) }
                    ],
                    marginBottom: 20,
                    position: 'relative',
                }}
            >
                {/* Rotating Decorative Ring */}
                <Animated.View
                    style={{
                        position: 'absolute',
                        top: -20,
                        left: -20,
                        width: 160,
                        height: 160,
                        borderRadius: 80,
                        borderWidth: 3,
                        borderColor: 'transparent',
                        borderTopColor: '#00A8A8',
                        borderRightColor: '#00A8A8',
                        transform: [{ rotate: spin }],
                    }}
                />

                {/* Outer Circle Background */}
                <View
                    style={{
                        width: 140,
                        height: 140,
                        borderRadius: 70,
                        backgroundColor: '#E0F7F7',
                        justifyContent: 'center',
                        alignItems: 'center',
                        shadowColor: '#00A8A8',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.2,
                        shadowRadius: 8,
                        elevation: 8,
                    }}
                >
                    {/* Inner Circle */}
                    <View
                        style={{
                            width: 120,
                            height: 120,
                            borderRadius: 60,
                            backgroundColor: 'white',
                            justifyContent: 'center',
                            alignItems: 'center',
                            overflow: 'hidden',
                        }}
                    >
                        {/* LOGO */}
                        <Image
                            source={require('../../assets/logo.png')}
                            style={{
                                width: 90,
                                height: 90,
                                resizeMode: "contain",
                                backgroundColor: 'transparent',
                            }}
                        />
                    </View>
                </View>

                {/* Corner Accent Dots */}
                <View style={{ position: 'absolute', top: 5, left: 5, width: 12, height: 12, borderRadius: 6, backgroundColor: '#FF6B3D' }} />
                <View style={{ position: 'absolute', top: 5, right: 5, width: 12, height: 12, borderRadius: 6, backgroundColor: '#07A0F6' }} />
                <View style={{ position: 'absolute', bottom: 5, left: 5, width: 12, height: 12, borderRadius: 6, backgroundColor: '#00C46A' }} />
                <View style={{ position: 'absolute', bottom: 5, right: 5, width: 12, height: 12, borderRadius: 6, backgroundColor: '#FFB800' }} />
            </Animated.View>

            {/* ANIMATED TEXT */}
            <Animated.View
                style={{
                    opacity: textFadeAnim,
                    transform: [{ translateY: textSlideAnim }],
                    alignItems: 'center',
                }}
            >
                {/* PROJECT NAME */}
                <Text className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
                    StayTrack
                </Text>

                <Text className="text-gray-500 text-lg mb-20">
                    Smart Hostel Management
                </Text>
            </Animated.View>

            {/* ANIMATED LOADING INDICATOR */}
            <Animated.View style={{ opacity: textFadeAnim }}>
                <ActivityIndicator size="large" color="#00A8A8" />
            </Animated.View>
        </View>
    );
}
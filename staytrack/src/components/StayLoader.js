import React, { useEffect, useRef } from "react";
import { View, Animated, Easing } from "react-native";
import { useTheme } from "../context/ThemeContext";

export default function StayLoader() {
    const { theme } = useTheme();
    const rotateAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 1200,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();
    }, []);

    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "360deg"],
    });

    // Calculate variations of the primary color for the dots
    // Since we can't easily manipulate hex in JS without a library, we'll use the primary color 
    // and some fixed complementary/accent colors or opacity if possible.
    // For simplicity and robustness, we will use the primary color and two hardcoded nice accents 
    // that usually go well, or just different opacities.
    // Actually, let's use the theme primary color and some white/gray to make it look clean on any bg,
    // or just use the primary color for all three with different opacities.

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: "transparent", // Made transparent to fit any screen
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <Animated.View
                style={{
                    width: 70,
                    height: 70,
                    borderRadius: 35,
                    justifyContent: "center",
                    alignItems: "center",
                    transform: [{ rotate: spin }],
                }}
            >
                {/* 3 dots that rotate */}
                <View
                    style={{
                        position: "absolute",
                        top: 5,
                        width: 14,
                        height: 14,
                        borderRadius: 7,
                        backgroundColor: theme.primary, // Primary Theme Color
                    }}
                />
                <View
                    style={{
                        position: "absolute",
                        right: 5,
                        width: 14,
                        height: 14,
                        borderRadius: 7,
                        backgroundColor: theme.buttonText || "#ffffff", // Secondary/White
                        opacity: 0.8
                    }}
                />
                <View
                    style={{
                        position: "absolute",
                        bottom: 5,
                        width: 14,
                        height: 14,
                        borderRadius: 7,
                        backgroundColor: theme.primary, // Primary again or lighter
                        opacity: 0.5
                    }}
                />
                <View
                    style={{
                        position: "absolute",
                        left: 5,
                        width: 14,
                        height: 14,
                        borderRadius: 7,
                        backgroundColor: theme.secondary || "#000000",
                        opacity: 0.3
                    }}
                />
            </Animated.View>
        </View>
    );
}

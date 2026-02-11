import React, { useEffect, useRef } from "react";
import { View, Animated, Easing } from "react-native";
import { useTheme } from "../context/ThemeContext";

export default function StayLoader({ size = 'medium' }) {
    const { theme } = useTheme();
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    // Size configurations
    const sizeConfig = {
        small: { container: 50, dot: 10 },
        medium: { container: 70, dot: 14 },
        large: { container: 90, dot: 18 }
    };

    const config = sizeConfig[size] || sizeConfig.medium;

    useEffect(() => {
        // Rotation animation
        Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 1200,
                easing: Easing.bezier(0.65, 0, 0.35, 1),
                useNativeDriver: true,
            })
        ).start();

        // Pulse animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(scaleAnim, {
                    toValue: 1.1,
                    duration: 600,
                    easing: Easing.ease,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 600,
                    easing: Easing.ease,
                    useNativeDriver: true,
                })
            ])
        ).start();
    }, []);

    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "360deg"],
    });

    return (
        <View
            style={{
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "transparent",
            }}
        >
            <Animated.View
                style={{
                    width: config.container,
                    height: config.container,
                    borderRadius: config.container / 2,
                    justifyContent: "center",
                    alignItems: "center",
                    transform: [{ rotate: spin }, { scale: scaleAnim }],
                }}
            >
                {/* Primary Dot - Top */}
                <View
                    style={{
                        position: "absolute",
                        top: 2,
                        width: config.dot,
                        height: config.dot,
                        borderRadius: config.dot / 2,
                        backgroundColor: theme.primary,
                        shadowColor: theme.primary,
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.5,
                        shadowRadius: 4,
                        elevation: 4,
                    }}
                />

                {/* Secondary Dot - Right */}
                <View
                    style={{
                        position: "absolute",
                        right: 2,
                        width: config.dot,
                        height: config.dot,
                        borderRadius: config.dot / 2,
                        backgroundColor: theme.primary,
                        opacity: 0.7,
                        shadowColor: theme.primary,
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.3,
                        shadowRadius: 3,
                        elevation: 3,
                    }}
                />

                {/* Tertiary Dot - Bottom */}
                <View
                    style={{
                        position: "absolute",
                        bottom: 2,
                        width: config.dot,
                        height: config.dot,
                        borderRadius: config.dot / 2,
                        backgroundColor: theme.primary,
                        opacity: 0.5,
                        shadowColor: theme.primary,
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.2,
                        shadowRadius: 2,
                        elevation: 2,
                    }}
                />

                {/* Quaternary Dot - Left */}
                <View
                    style={{
                        position: "absolute",
                        left: 2,
                        width: config.dot,
                        height: config.dot,
                        borderRadius: config.dot / 2,
                        backgroundColor: theme.primary,
                        opacity: 0.3,
                        shadowColor: theme.primary,
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 1,
                        elevation: 1,
                    }}
                />
            </Animated.View>

            {/* Center Glow Effect */}
            <View
                style={{
                    position: 'absolute',
                    width: config.container * 0.4,
                    height: config.container * 0.4,
                    borderRadius: (config.container * 0.4) / 2,
                    backgroundColor: theme.primary,
                    opacity: 0.15,
                }}
            />
        </View>
    );
}
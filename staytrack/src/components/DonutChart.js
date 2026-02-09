import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing, Platform } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function DonutChart({
    percentage = 0,
    radius = 40,
    strokeWidth = 10,
    color = '#00A8A8',
    max = 100,
    centerValue,
    centerLabel,
    bgColor = '#E5E7EB'
}) {
    const animatedValue = useRef(new Animated.Value(0)).current;

    // Safety check for radius to avoid division by zero
    const safeRadius = radius > 0 ? radius : 1;
    const halfCircle = safeRadius + strokeWidth;
    const circleCircumference = 2 * Math.PI * safeRadius;

    useEffect(() => {
        // Run animation from 0 to current percentage
        Animated.timing(animatedValue, {
            toValue: percentage,
            duration: 1000,
            delay: 500,
            useNativeDriver: false, // SVG props don't support native driver on web/some native versions
            easing: Easing.out(Easing.ease),
        }).start();
    }, [percentage]);

    // Interpolate offset based on animated value
    const strokeDashoffset = animatedValue.interpolate({
        inputRange: [0, max],
        outputRange: [circleCircumference, 0],
    });

    return (
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <View style={{
                width: halfCircle * 2,
                height: halfCircle * 2,
                position: 'relative',
            }}>
                <Svg
                    height={halfCircle * 2}
                    width={halfCircle * 2}
                    viewBox={`0 0 ${halfCircle * 2} ${halfCircle * 2}`}
                >
                    <G transform={`rotate(-90 ${halfCircle} ${halfCircle})`}>
                        {/* Background Circle */}
                        <Circle
                            cx={halfCircle}
                            cy={halfCircle}
                            r={safeRadius}
                            stroke={bgColor}
                            strokeWidth={strokeWidth}
                            fill="none"
                        />
                        {/* Animated Progress Circle */}
                        <AnimatedCircle
                            cx={halfCircle}
                            cy={halfCircle}
                            r={safeRadius}
                            stroke={color}
                            strokeWidth={strokeWidth}
                            strokeLinecap="round"
                            fill="none"
                            strokeDasharray={circleCircumference}
                            strokeDashoffset={strokeDashoffset}
                        />
                    </G>
                </Svg>

                {/* Center Text Overlay */}
                <View style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <Text style={{
                        color: '#111827',
                        fontWeight: 'bold',
                        fontSize: radius > 30 ? 18 : 14,
                    }}>
                        {centerValue !== undefined ? centerValue : `${Math.round(percentage)}%`}
                    </Text>
                    {centerLabel && (
                        <Text style={{
                            color: '#9CA3AF',
                            fontSize: 10,
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                        }}>
                            {centerLabel}
                        </Text>
                    )}
                </View>
            </View>
        </View>
    );
}
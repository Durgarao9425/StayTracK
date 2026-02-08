import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing } from 'react-native';
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
    const circleRef = useRef();
    const halfCircle = radius + strokeWidth;
    const circleCircumference = 2 * Math.PI * radius;

    useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: percentage,
            duration: 1000,
            delay: 500,
            useNativeDriver: true,
            easing: Easing.out(Easing.ease),
        }).start();
    }, [percentage]);

    const strokeDashoffset = animatedValue.interpolate({
        inputRange: [0, max],
        outputRange: [circleCircumference, 0],
        extrapolate: 'clamp',
    });

    return (
        <View className="items-center justify-center">
            <View style={{ width: radius * 2 + strokeWidth * 2, height: radius * 2 + strokeWidth * 2 }}>
                <Svg
                    height={radius * 2 + strokeWidth * 2}
                    width={radius * 2 + strokeWidth * 2}
                    viewBox={`0 0 ${halfCircle * 2} ${halfCircle * 2}`}
                >
                    <G rotation="-90" origin={`${halfCircle}, ${halfCircle}`}>
                        {/* Background Circle */}
                        <Circle
                            cx="50%"
                            cy="50%"
                            r={radius}
                            stroke={bgColor}
                            strokeWidth={strokeWidth}
                            fill="transparent"
                        />
                        {/* Foreground Circle */}
                        <AnimatedCircle
                            ref={circleRef}
                            cx="50%"
                            cy="50%"
                            r={radius}
                            stroke={color}
                            strokeWidth={strokeWidth}
                            strokeLinecap="round"
                            fill="transparent"
                            strokeDasharray={circleCircumference}
                            strokeDashoffset={strokeDashoffset}
                        />
                    </G>
                </Svg>

                {/* Center Text Overlay */}
                <View className="absolute inset-0 items-center justify-center">
                    <Text className="text-gray-900 font-bold text-lg">
                        {centerValue !== undefined ? centerValue : `${percentage}%`}
                    </Text>
                    {centerLabel && (
                        <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-tighter">
                            {centerLabel}
                        </Text>
                    )}
                </View>
            </View>
        </View>
    );
}

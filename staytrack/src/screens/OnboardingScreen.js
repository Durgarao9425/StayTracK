import React from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SHADOWS } from '../theme/theme';

const { width, height } = Dimensions.get('window');

export default function OnboardingScreen({ navigation }) {

    const handleGetStarted = async () => {
        try {
            await AsyncStorage.setItem('isFirstTimeUser', 'false');
            navigation.replace("Login");
        } catch (error) {
            console.error("Error setting first time user:", error);
            navigation.replace("Login");
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white relative">
            <StatusBar style="dark" />

            {/* Background Decorations */}
            <View className="absolute top-0 right-0 w-64 h-64 bg-teal-100 rounded-bl-full opacity-50 -mr-20 -mt-20" />
            <View className="absolute bottom-0 left-0 w-64 h-64 bg-teal-50 rounded-tr-full opacity-50 -ml-20 -mb-20" />

            <View className="flex-1 justify-between items-center px-6 py-10">

                {/* Header/Image Area - Decorated */}
                <View className="flex-1 justify-center items-center w-full mt-10">
                    <View style={{ position: 'relative' }}>

                        {/* Outer Decorative Circle */}
                        <View
                            className="w-72 h-72 bg-teal-50 rounded-full justify-center items-center"
                            style={SHADOWS.light}
                        >

                            {/* Corner Accent Dots */}
                            <View style={{ position: 'absolute', top: 20, left: 20, width: 16, height: 16, borderRadius: 8, backgroundColor: '#FF6B3D' }} />
                            <View style={{ position: 'absolute', top: 20, right: 20, width: 16, height: 16, borderRadius: 8, backgroundColor: '#07A0F6' }} />
                            <View style={{ position: 'absolute', bottom: 20, left: 20, width: 16, height: 16, borderRadius: 8, backgroundColor: '#00C46A' }} />
                            <View style={{ position: 'absolute', bottom: 20, right: 20, width: 16, height: 16, borderRadius: 8, backgroundColor: '#FFB800' }} />

                            {/* Small Accent Dots */}
                            <View style={{ position: 'absolute', top: 10, left: '50%', marginLeft: -6, width: 12, height: 12, borderRadius: 6, backgroundColor: '#FF6B3D', opacity: 0.6 }} />
                            <View style={{ position: 'absolute', bottom: 10, left: '50%', marginLeft: -6, width: 12, height: 12, borderRadius: 6, backgroundColor: '#07A0F6', opacity: 0.6 }} />

                            {/* Inner Logo Circle */}
                            <View
                                className="w-56 h-56 bg-teal-100 rounded-full justify-center items-center overflow-hidden border-4 border-white"
                                style={SHADOWS.heavy}
                            >
                                <Image
                                    source={require('../../assets/logo.png')}
                                    style={{ width: '90%', height: '90%', backgroundColor: 'transparent' }}
                                    resizeMode="contain"
                                />
                            </View>
                        </View>

                        {/* Dashed Ring */}
                        <View style={{
                            position: 'absolute',
                            top: -8,
                            left: -8,
                            width: 304,
                            height: 304,
                            borderRadius: 152,
                            borderWidth: 2,
                            borderColor: 'rgba(13, 148, 136, 0.2)',
                            borderStyle: 'dashed'
                        }} />
                    </View>
                </View>

                {/* Text Content */}
                <View className="w-full mb-10">
                    <Text className="text-4xl font-extrabold text-gray-800 text-center mb-4">
                        Manage Your Hostel <Text className="text-teal-600">Smartly</Text>
                    </Text>
                    <Text className="text-gray-500 text-center text-lg leading-relaxed px-4">
                        Track expenses, manage students, and organize your hostel operations all in one place.
                    </Text>
                </View>

                {/* Button */}
                <TouchableOpacity
                    onPress={handleGetStarted}
                    className="w-full bg-teal-600 py-4 rounded-xl active:scale-95 transition-all"
                    style={SHADOWS.heavy}
                >
                    <Text className="text-white text-center text-xl font-bold">Get Started</Text>
                </TouchableOpacity>

            </View>
        </SafeAreaView>
    );
}

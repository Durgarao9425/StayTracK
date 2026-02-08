import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';

export default function LoginScreen({ route, navigation }) {
    const { role } = route.params || {};
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = () => {
        // Just navigate for demo
        if (role === 'Owner') {
            navigation.replace('OwnerRoot');
        } else {
            navigation.replace('StudentRoot');
        }
    };

    return (
        <View className="flex-1 bg-white justify-center p-6">
            <Text className="text-3xl font-bold text-gray-900 mb-2 font-['Inter-Bold']">Welcome Back!</Text>
            <Text className="text-gray-500 mb-8 font-['Inter']">Login as {role || 'User'}</Text>

            <View className="mb-4">
                <Text className="text-gray-700 font-medium mb-1 font-['Inter']">Email</Text>
                <TextInput
                    className="border border-gray-300 rounded-lg px-4 py-3 bg-gray-50"
                    placeholder="Enter email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
            </View>

            <View className="mb-6">
                <Text className="text-gray-700 font-medium mb-1 font-['Inter']">Password</Text>
                <TextInput
                    className="border border-gray-300 rounded-lg px-4 py-3 bg-gray-50"
                    placeholder="Enter password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
            </View>

            <TouchableOpacity
                className="bg-indigo-600 rounded-lg py-4 active:bg-indigo-700"
                onPress={handleLogin}
            >
                <Text className="text-white font-bold text-center text-lg font-['Inter']">Sign In</Text>
            </TouchableOpacity>
        </View>
    );
}

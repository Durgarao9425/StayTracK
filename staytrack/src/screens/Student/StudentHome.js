import React from 'react';
import { View, Text } from 'react-native';

export default function StudentHome() {
    return (
        <View className="flex-1 items-center justify-center bg-white p-4">
            <Text className="text-xl font-bold font-['Inter-Bold'] text-gray-800">Student Dashboard</Text>
            <Text className="text-gray-500 mt-2 font-['Inter'] text-center">View your leave requests and profile.</Text>
        </View>
    );
}

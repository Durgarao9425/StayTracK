import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

export default function RoleSelection({ navigation }) {
    return (
        <View className="flex-1 bg-[#00A8A8] justify-center items-center">

            {/* White Phone Card */}
            <View className="bg-white w-[85%] rounded-[40px] pb-14 pt-12 px-8 shadow-2xl relative overflow-hidden">

                {/* TOP STRIPES */}
                <View className="absolute top-6 left-6 flex-row space-x-2">
                    <View className="w-10 h-2 rounded-full bg-[#FF6B3D]" />
                    <View className="w-10 h-2 rounded-full bg-[#07A0F6]" />
                    <View className="w-10 h-2 rounded-full bg-[#00C46A]" />
                </View>

                {/* BOTTOM STRIPES */}
                <View className="absolute bottom-6 right-6 flex-row space-x-2">
                    <View className="w-10 h-2 rounded-full bg-[#07A0F6]" />
                    <View className="w-10 h-2 rounded-full bg-[#FF6B3D]" />
                    <View className="w-10 h-2 rounded-full bg-[#00C46A]" />
                </View>

                {/* TITLE */}
                <Text className="text-3xl font-extrabold text-gray-900 text-center mb-2">
                    StayTrack
                </Text>

                <Text className="text-center text-gray-500 text-base mb-10">
                    Choose Your Role
                </Text>

                {/* OWNER BUTTON */}
                <TouchableOpacity
                    onPress={() => navigation.navigate("Login", { role: "Owner" })}
                    className="bg-[#00A8A8] py-4 rounded-2xl shadow-md mb-6"
                >
                    <Text className="text-white text-center text-lg font-semibold">
                        Owner
                    </Text>
                </TouchableOpacity>

                {/* STUDENT BUTTON */}
                <TouchableOpacity
                    onPress={() => navigation.navigate("Login", { role: "Student" })}
                    className="bg-[#00A8A8] py-4 rounded-2xl shadow-md"
                >
                    <Text className="text-white text-center text-lg font-semibold">
                        Student
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
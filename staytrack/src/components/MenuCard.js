import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function MenuCard({ icon, title, subtitle, color, bg, onPress }) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
            className="bg-white rounded-2xl p-5 mb-4 flex-row items-center shadow-sm"
            style={{
                shadowColor: "#000",
                shadowOpacity: 0.06,
                shadowRadius: 4,
                shadowOffset: { width: 0, height: 2 },
                elevation: 3,
            }}
        >
            {/* ICON BOX */}
            <View
                className="w-14 h-14 rounded-2xl items-center justify-center"
                style={{ backgroundColor: `${color}15` }}
            >
                <Ionicons name={icon} size={26} color={color} />
            </View>

            {/* TEXT */}
            <View className="flex-1 ml-4">
                <Text className="text-gray-900 font-bold text-lg">{title}</Text>
                <Text className="text-gray-500 text-xs mt-1">{subtitle}</Text>
            </View>

            <Ionicons name="chevron-forward" size={22} color="#b3b3b3" />
        </TouchableOpacity>
    );
}
import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
    Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { CommonActions } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";

import { useTheme } from "../../context/ThemeContext";
import { auth, db } from "../../config/firebase";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { uploadFile } from "../../services/storage";
import showToast from "../../utils/toast";

// -------------------------------------------------------
//     FIXED PROFILE SCREEN → MATCHES ROOMS + STUDENTS
// -------------------------------------------------------

export default function Profile({ navigation }) {
    const { theme } = useTheme();

    const [profileImage, setProfileImage] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(false);

    // Fetch user profile
    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        const user = auth.currentUser;
        if (!user) return;

        try {
            const ref = doc(db, "users", user.uid);
            const snap = await getDoc(ref);

            if (snap.exists()) {
                const data = snap.data();
                setUserData({
                    ...data,
                    displayName:
                        data.displayName ||
                        data.name ||
                        user.displayName ||
                        user.email?.split("@")[0],
                    email: data.email || user.email,
                });

                if (data.profileImage) setProfileImage(data.profileImage);
            } else {
                // No Firestore doc
                setUserData({
                    displayName: user.email?.split("@")[0],
                    email: user.email,
                    role: "Owner",
                });
            }
        } catch (e) {
            console.error(e);
            setUserData({
                displayName: user.email?.split("@")[0],
                email: user.email,
                role: "Owner",
            });
        }
    };

    // IMAGE PICKER
    const pickProfileImage = async () => {
        const choose = async (fromCamera = false) => {
            const fn = fromCamera
                ? ImagePicker.launchCameraAsync
                : ImagePicker.launchImageLibraryAsync;

            let result = await fn({
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
            });

            if (!result.canceled) uploadImage(result.assets[0].uri);
        };

        if (Platform.OS !== "web") {
            Alert.alert("Change Profile Photo", "Choose option", [
                { text: "Camera", onPress: () => choose(true) },
                { text: "Gallery", onPress: () => choose(false) },
                { text: "Cancel", style: "cancel" },
            ]);
        } else choose(false);
    };

    const uploadImage = async (uri) => {
        const user = auth.currentUser;
        if (!user) return;

        setLoading(true);

        try {
            const url = await uploadFile(uri, `users/${user.uid}/profile.jpg`);

            const ref = doc(db, "users", user.uid);
            const snap = await getDoc(ref);

            if (snap.exists()) {
                await updateDoc(ref, { profileImage: url });
            } else {
                await setDoc(ref, {
                    profileImage: url,
                    email: user.email,
                    displayName: user.email?.split("@")[0],
                    role: "Owner",
                });
            }

            setProfileImage(url);
            showToast("Profile updated!", "success");
        } catch (e) {
            showToast("Upload failed", "error");
        }

        setLoading(false);
    };

    return (
        <View style={{ flex: 1, backgroundColor: "#F5F7FA" }}>
            {/* HEADER BACKGROUND — SAME AS ROOMS + STUDENTS */}
            <View
                style={{
                    position: "absolute",
                    top: 0,
                    width: "100%",
                    height: 260,
                    backgroundColor: theme.primary,
                    borderBottomLeftRadius: 40,
                    borderBottomRightRadius: 40,
                }}
            />

            <SafeAreaView style={{ flex: 1 }}>
                {/* HEADER */}
                <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
                    <Text style={{ color: "#fff", fontSize: 32, fontWeight: "800" }}>
                        Profile000
                    </Text>
                </View>

                {/* PROFILE CARD */}
                <View
                    style={{
                        marginTop: 20,
                        marginHorizontal: 20,
                        backgroundColor: "#fff",
                        padding: 20,
                        borderRadius: 24,
                        flexDirection: "row",
                        alignItems: "center",
                        borderWidth: 1,
                        borderColor: "#F3F4F6",
                        shadowColor: "#000",
                        shadowOpacity: 0.07,
                        shadowRadius: 6,
                        elevation: 4,
                    }}
                >
                    {/* Profile Image */}
                    <TouchableOpacity onPress={pickProfileImage} disabled={loading}>
                        <View
                            style={{
                                width: 90,
                                height: 90,
                                borderRadius: 45,
                                backgroundColor: "#F3F4F6",
                                overflow: "hidden",
                                justifyContent: "center",
                                alignItems: "center",
                                borderWidth: 2,
                                borderColor: "#E5E7EB",
                            }}
                        >
                            {profileImage ? (
                                <Image
                                    source={{ uri: profileImage }}
                                    style={{ width: "100%", height: "100%" }}
                                />
                            ) : (
                                <Text style={{ fontSize: 32, fontWeight: "800", color: theme.primary }}>
                                    {userData?.displayName?.charAt(0)}
                                </Text>
                            )}
                        </View>
                    </TouchableOpacity>

                    {/* Profile Info */}
                    <View style={{ marginLeft: 16, flex: 1 }}>
                        <Text style={{ fontSize: 20, fontWeight: "800", color: "#111827" }}>
                            {userData?.displayName}
                        </Text>
                        <Text style={{ color: "#6B7280", marginTop: 2 }}>{userData?.email}</Text>
                        <Text style={{ color: theme.primary, marginTop: 2, fontWeight: "700" }}>
                            {userData?.role || "Owner"}
                        </Text>
                    </View>
                </View>

                {/* CONTENT */}
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    style={{ marginTop: 20 }}
                    contentContainerStyle={{ paddingBottom: 140 }}
                >
                    {/* OVERVIEW */}
                    <View style={{ paddingHorizontal: 20 }}>
                        <Text
                            style={{
                                fontSize: 18,
                                fontWeight: "800",
                                color: theme.primary,
                                marginBottom: 16,
                            }}
                        >
                            Overview
                        </Text>

                        {/* 4 Quick Cards */}
                        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
                            <TouchableOpacity
                                style={quickCardStyle("#3b82f6", "#DBEAFE")}
                                onPress={() => navigation.navigate("Hostels")}
                            >
                                <Ionicons name="business" size={26} color="#3b82f6" />
                                <Text style={quickTitle}>Hostels</Text>
                                <View style={tag("#3b82f6")}>
                                    <Text style={tagText("#3b82f6")}>3 ACTIVE</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={quickCardStyle("#14b8a6", "#CCFBF1")}
                                onPress={() => navigation.navigate("Payments")}
                            >
                                <Ionicons name="cash" size={26} color="#14b8a6" />
                                <Text style={quickTitle}>Fees</Text>
                                <View style={tag("#14b8a6")}>
                                    <Text style={tagText("#14b8a6")}>4 PENDING</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={quickCardStyle("#6366f1", "#E0E7FF")}
                                onPress={() => navigation.navigate("Expenses")}
                            >
                                <Ionicons name="wallet" size={26} color="#6366f1" />
                                <Text style={quickTitle}>Expenses</Text>
                                <View style={tag("#6366f1")}>
                                    <Text style={tagText("#6366f1")}>THIS MONTH</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity style={quickCardStyle("#f59e0b", "#FEF3C7")}>
                                <Ionicons name="trending-up" size={26} color="#f59e0b" />
                                <Text style={quickTitle}>Income</Text>
                                <View style={tag("#f59e0b")}>
                                    <Text style={tagText("#f59e0b")}>DAILY</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* ACCOUNT */}
                    <View style={{ marginTop: 30, paddingHorizontal: 20 }}>
                        <Text style={sectionLabel}>Account</Text>

                        <View style={blockCard}>
                            <MenuItem icon="notifications" label="Notifications" />
                            <MenuItem icon="key" label="Password" border={false} />
                        </View>
                    </View>

                    {/* SETTINGS */}
                    <View style={{ marginTop: 30, paddingHorizontal: 20 }}>
                        <Text style={sectionLabel}>Settings</Text>

                        <View style={blockCard}>
                            <MenuItem icon="language" label="Language" right="English" />
                            <MenuItem
                                icon="log-out"
                                label="Logout"
                                color="#ef4444"
                                border={false}
                                onPress={async () => {
                                    try {
                                        await auth.signOut();
                                        navigation.dispatch(
                                            CommonActions.reset({
                                                index: 0,
                                                routes: [{ name: "Auth" }],
                                            })
                                        );
                                    } catch (e) {
                                        showToast(e.message, "error");
                                    }
                                }}
                            />
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

// -----------------------------
// Helper Components & Styles
// -----------------------------

const quickCardStyle = (color, bg) => ({
    width: "48%",
    backgroundColor: "#fff",
    padding: 20,
    marginBottom: 16,
    borderRadius: 20,
    borderColor: bg,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 3,
});

const quickTitle = {
    fontSize: 18,
    fontWeight: "800",
    color: "#1F2937",
    marginTop: 12,
};

const tag = (color) => ({
    marginTop: 8,
    backgroundColor: `${color}15`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
});

const tagText = (color) => ({
    color: color,
    fontSize: 10,
    fontWeight: "800",
});

const sectionLabel = {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "700",
    marginBottom: 10,
};

const blockCard = {
    backgroundColor: "#fff",
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
};

const MenuItem = ({ icon, label, right, border = true, onPress, color }) => (
    <TouchableOpacity
        onPress={onPress}
        style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 18,
            borderBottomWidth: border ? 1 : 0,
            borderColor: "#E5E7EB",
        }}
    >
        <Ionicons name={icon} size={22} color={color || "#0f766e"} />
        <Text
            style={{
                flex: 1,
                marginLeft: 16,
                fontSize: 16,
                color: "#374151",
                fontWeight: "600",
            }}
        >
            {label}
        </Text>
        {right && (
            <Text style={{ marginRight: 6, color: "#9CA3AF", fontWeight: "600" }}>
                {right}
            </Text>
        )}
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
);
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AuthStack from './src/navigation/AuthStack';
import OwnerTabs from './src/navigation/OwnerTabs';
import Hostels from './src/screens/Owner/Hostels';
import Payments from './src/screens/Owner/PaymentsScreen';
import MessManager from './src/screens/Owner/MessManager';
import ExpensesScreen from './src/screens/Owner/ExpensesScreen';
import StudentTabs from './src/navigation/StudentTabs';
import { ThemeProvider } from './src/context/ThemeContext';

// Import Firebase to ensure it initializes
import './src/config/firebase';
import './global.css';

const Stack = createNativeStackNavigator();

export default function App() {
  let [fontsLoaded] = useFonts({
    'Inter': Inter_400Regular,
    'Inter-Bold': Inter_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Auth" component={AuthStack} />
            <Stack.Screen name="OwnerRoot" component={OwnerTabs} />
            <Stack.Screen name="Hostels" component={Hostels} />
            <Stack.Screen name="Payments" component={Payments} />
            <Stack.Screen name="MessManager" component={MessManager} />
            <Stack.Screen name="Expenses" component={ExpensesScreen} />
            <Stack.Screen name="StudentRoot" component={StudentTabs} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}

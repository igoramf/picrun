import { useEffect, useState } from 'react';
import { Stack, router, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { COLORS } from '../src/constants';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';
import { SplashScreen } from '../src/components/SplashScreen';

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    if (isLoading || showSplash) return;

    const inAuthGroup = segments[0] === 'auth';
    const inWelcome = segments[0] === 'welcome';

    if (!isAuthenticated && !inAuthGroup && !inWelcome) {
      // Redireciona para welcome se não autenticado
      router.replace('/welcome');
    } else if (isAuthenticated && (inAuthGroup || inWelcome)) {
      // Redireciona para home se já autenticado
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, segments, showSplash]);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="auth" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="run"
        options={{
          animation: 'slide_from_bottom',
          gestureEnabled: false,
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar style="dark" />
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});

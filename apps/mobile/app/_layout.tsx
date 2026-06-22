import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { DEMO_MODE } from "../lib/config";
import { SessionProvider, useSession } from "../lib/session";
import { colors } from "../lib/theme";

function RootNav() {
  const { ready, signedIn } = useSession();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    const inLogin = segments[0] === "login";
    if (DEMO_MODE) {
      if (inLogin) router.replace("/(tabs)");
      return;
    }
    if (!signedIn && !inLogin) router.replace("/login");
    else if (signedIn && inLogin) router.replace("/(tabs)");
  }, [ready, signedIn, segments, router]);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen
        name="product/[id]"
        options={{
          headerShown: true,
          headerTitle: "",
          headerTintColor: colors.text,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.bg },
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <SessionProvider>
        <RootNav />
      </SessionProvider>
    </SafeAreaProvider>
  );
}

import { router, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { clearSessionID, getSessionID } from './utils/sessionControl';
import { View, Text } from 'react-native';

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);

  const checkSession = async () => {
    try {
      // clearSessionID();
      const sessionId = await getSessionID();
      if (!sessionId) {
        router.replace('(auth)/login');
      }
    } catch (error) {
      console.error('Session check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {

    checkSession();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    )
  }

  return (
    <Stack>
      <Stack.Screen
        name="(auth)/login"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="(tabs)"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}

import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { StorageProvider } from './src/storage/StorageProvider';
import { AuthProvider, useAuth } from './src/auth/AuthProvider';
import { LoginScreen } from './src/screens/LoginScreen';
import { colors } from './src/theme';

// Decide entre Login e o app autenticado, com base na sessão do Supabase.
// Fica ACIMA do AppNavigator, que continua exatamente como estava.
function Raiz() {
  const { session, carregando } = useAuth();
  if (carregando) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }
  if (!session) return <LoginScreen />;
  return (
    <StorageProvider>
      <AppNavigator />
    </StorageProvider>
  );
}

// SafeAreaProvider precisa envolver toda a árvore: é ele quem fornece
// as informações de área segura (notch, status bar, barra de navegação
// do Android) que a navegação (tabs/headers) e o componente Screen usam.
export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <Raiz />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

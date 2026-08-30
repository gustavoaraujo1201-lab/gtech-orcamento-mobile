import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { StorageProvider } from './src/storage/StorageProvider';

// SafeAreaProvider precisa envolver toda a árvore: é ele quem fornece
// as informações de área segura (notch, status bar, barra de navegação
// do Android) que a navegação (tabs/headers) e o componente Screen usam.
export default function App() {
  return (
    <SafeAreaProvider>
      <StorageProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <AppNavigator />
        </NavigationContainer>
      </StorageProvider>
    </SafeAreaProvider>
  );
}

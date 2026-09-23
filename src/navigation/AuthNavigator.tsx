import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';

export type AuthStackParamList = { Login: undefined; Register: undefined };
const Stack = createNativeStackNavigator<AuthStackParamList>();

// Stack usada só enquanto o usuário NÃO está autenticado.
// Segue o mesmo padrão do AppNavigator: headerShown false, telas próprias.
export function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

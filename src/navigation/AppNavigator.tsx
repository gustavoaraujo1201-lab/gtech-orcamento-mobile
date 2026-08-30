import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../theme';
import { DetalheOrcamentoScreen, EditorOrcamentoScreen } from '../screens/OrcamentoScreens';
import { ConfiguracoesScreen } from '../screens/ConfiguracoesScreen';
import { HistoricoScreen } from '../screens/HistoricoScreen';
import { HomeScreen } from '../screens/HomeScreen';

export type RootStackParamList = { Tabs: undefined; Editor: { id?: string } | undefined; Detalhe: { id: string } };
const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();
function Tabs() { return <Tab.Navigator screenOptions={({ route }) => ({ headerShown: false, tabBarActiveTintColor: colors.primary, tabBarIcon: ({ color, size }) => <Ionicons name={route.name === 'Início' ? 'home-outline' : route.name === 'Orçamentos' ? 'document-text-outline' : 'settings-outline'} color={color} size={size} /> })}><Tab.Screen name="Início" component={HomeScreen} /><Tab.Screen name="Orçamentos" component={HistoricoScreen} /><Tab.Screen name="Configurações" component={ConfiguracoesScreen} /></Tab.Navigator>; }
export function AppNavigator() { return <Stack.Navigator screenOptions={{ headerShown: false }}><Stack.Screen name="Tabs" component={Tabs} /><Stack.Screen name="Editor" component={EditorOrcamentoScreen} /><Stack.Screen name="Detalhe" component={DetalheOrcamentoScreen} /></Stack.Navigator>; }

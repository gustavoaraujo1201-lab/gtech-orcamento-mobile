import 'react-native-url-polyfill/auto';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// URL e chave anônima (pública) do MESMO projeto Supabase usado pelo sistema Web
// (GTech-Orcamentos). Não são segredos — a anon key foi feita para ir dentro do
// app/navegador, desde que o RLS esteja habilitado no banco (mesma regra do Web).
// Os valores reais ficam em variáveis de ambiente (.env), nunca hardcoded aqui.
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Configuração do Supabase ausente. Crie um arquivo .env na raiz do projeto com ' +
    'EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY (veja .env.example).'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Recomendação oficial do Supabase para React Native: pausar/retomar o
// auto-refresh do token conforme o app vai para segundo plano ou volta ao primeiro plano.
AppState.addEventListener('change', (estado) => {
  if (estado === 'active') supabase.auth.startAutoRefresh();
  else supabase.auth.stopAutoRefresh();
});

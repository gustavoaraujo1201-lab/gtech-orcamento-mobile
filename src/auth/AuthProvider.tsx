import { Session } from '@supabase/supabase-js';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';

type ResultadoAuth = { erro?: string };

type AuthContextValue = {
  session: Session | null;
  carregando: boolean;
  entrar: (email: string, senha: string) => Promise<ResultadoAuth>;
  sair: () => Promise<void>;
  recuperarSenha: (email: string) => Promise<ResultadoAuth>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function mensagemAmigavel(mensagem: string): string {
  const normalizada = mensagem.toLowerCase();
  if (normalizada.includes('invalid login credentials')) return 'E-mail ou senha incorretos.';
  if (normalizada.includes('email not confirmed')) return 'Confirme seu e-mail antes de entrar.';
  if (normalizada.includes('user not found')) return 'Não encontramos uma conta com esse e-mail.';
  if (normalizada.includes('network') || normalizada.includes('fetch')) return 'Falha de conexão. Verifique sua internet e tente novamente.';
  return 'Não foi possível concluir. Tente novamente em instantes.';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setCarregando(false);
    });
    const { data: assinatura } = supabase.auth.onAuthStateChange((_evento, novaSessao) => {
      setSession(novaSessao);
    });
    return () => assinatura.subscription.unsubscribe();
  }, []);

  async function entrar(email: string, senha: string): Promise<ResultadoAuth> {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha });
    if (error) return { erro: mensagemAmigavel(error.message) };
    return {};
  }

  async function sair() {
    await supabase.auth.signOut();
  }

  async function recuperarSenha(email: string): Promise<ResultadoAuth> {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
    if (error) return { erro: mensagemAmigavel(error.message) };
    return {};
  }

  return <AuthContext.Provider value={{ session, carregando, entrar, sair, recuperarSenha }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return contexto;
}

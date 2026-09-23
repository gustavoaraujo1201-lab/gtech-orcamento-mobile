import { Session } from '@supabase/supabase-js';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';

type ResultadoAuth = { erro?: string; precisaConfirmarEmail?: boolean };

type AuthContextValue = {
  session: Session | null;
  carregando: boolean;
  entrar: (email: string, senha: string) => Promise<ResultadoAuth>;
  cadastrar: (nome: string, email: string, senha: string) => Promise<ResultadoAuth>;
  sair: () => Promise<void>;
  recuperarSenha: (email: string) => Promise<ResultadoAuth>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function mensagemAmigavel(mensagem: string): string {
  const normalizada = mensagem.toLowerCase();
  if (normalizada.includes('invalid login credentials')) return 'E-mail ou senha incorretos.';
  if (normalizada.includes('email not confirmed')) return 'Confirme seu e-mail antes de entrar.';
  if (normalizada.includes('user not found')) return 'Não encontramos uma conta com esse e-mail.';
  if (normalizada.includes('user already registered') || normalizada.includes('already registered')) return 'Já existe uma conta com esse e-mail.';
  if (normalizada.includes('password should be at least') || normalizada.includes('password') && normalizada.includes('6')) return 'A senha deve ter pelo menos 6 caracteres.';
  if (normalizada.includes('unable to validate email') || normalizada.includes('invalid email') || normalizada.includes('is invalid')) return 'Informe um e-mail válido.';
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

  async function cadastrar(nome: string, email: string, senha: string): Promise<ResultadoAuth> {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: senha,
      // "nome" fica salvo nos metadados do usuário (user_metadata).
      // Se vocês tiverem uma tabela de perfis (ex.: "perfis") sincronizada
      // por trigger no Supabase, esse metadado normalmente alimenta ela.
      options: { data: { nome: nome.trim() } },
    });
    if (error) return { erro: mensagemAmigavel(error.message) };
    // Quando a confirmação de e-mail está ativada no projeto Supabase,
    // "data.session" vem nulo aqui: o cadastro foi feito, mas o usuário
    // só consegue entrar depois de confirmar o e-mail.
    if (!data.session) {
      return { precisaConfirmarEmail: true };
    }
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

  return <AuthContext.Provider value={{ session, carregando, entrar, cadastrar, sair, recuperarSenha }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return contexto;
}

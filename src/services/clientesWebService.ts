import { supabase } from './supabaseClient';

export type ClienteWeb = {
  id: string;
  nome: string;
  cpfCnpj: string;
  telefone: string;
  endereco: string;
  email: string;
};

// A tabela "clients" já existe no Supabase do sistema Web, com RLS por usuário
// (coluna user_id). Aqui só LEMOS esses dados — nada é criado, alterado ou
// apagado nessa tabela a partir do mobile.
function normalizarLinha(linha: Record<string, unknown>): ClienteWeb {
  return {
    id: String(linha.id ?? ''),
    nome: String(linha.name ?? ''),
    cpfCnpj: String(linha.cnpj_cpf ?? ''),
    telefone: String(linha.phone ?? ''),
    endereco: String(linha.address ?? ''),
    email: String(linha.email ?? ''),
  };
}

export async function buscarClientesWeb(termo: string): Promise<ClienteWeb[]> {
  const { data: sessaoAtual } = await supabase.auth.getSession();
  const usuarioId = sessaoAtual.session?.user.id;
  if (!usuarioId) return [];

  let consulta = supabase
    .from('clients')
    .select('*')
    .eq('user_id', usuarioId)
    .order('name', { ascending: true })
    .limit(30);

  if (termo.trim()) consulta = consulta.ilike('name', `%${termo.trim()}%`);

  const { data, error } = await consulta;
  if (error || !data) return [];
  return data.map(normalizarLinha);
}

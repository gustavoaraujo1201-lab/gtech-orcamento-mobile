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
// (coluna user_id). Aqui LEMOS esses dados (buscarClientesWeb) e também
// ESCREVEMOS (salvarClienteWeb), para o mobile poder criar/editar clientes
// que também aparecem no sistema Web.
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
  if (!usuarioId) {
    console.error('[clientesWebService] nenhuma sessão ativa encontrada ao buscar clientes.');
    return [];
  }

  let consulta = supabase
    .from('clients')
    .select('*')
    .eq('user_id', usuarioId)
    .order('name', { ascending: true })
    .limit(30);

  if (termo.trim()) consulta = consulta.ilike('name', `%${termo.trim()}%`);

  const { data, error } = await consulta;
  if (error) {
    console.error('[clientesWebService] erro ao buscar clientes na tabela "clients":', JSON.stringify(error, null, 2));
    return [];
  }
  if (!data) return [];
  console.log(`[clientesWebService] ${data.length} cliente(s) encontrado(s) para usuarioId=${usuarioId}`);
  return data.map(normalizarLinha);
}

type DadosClienteParaSalvar = {
  nome: string;
  cpfCnpj?: string;
  telefone?: string;
  endereco?: string;
  // Se vier preenchido, atualiza o cliente existente; se não, cria um novo.
  clienteWebId?: string;
};

// Nota: a tabela "clients" não tem coluna de e-mail — por isso esse campo
// não é gravado aqui, mesmo que o cliente do orçamento tenha um preenchido.
export async function salvarClienteWeb(usuarioId: string, cliente: DadosClienteParaSalvar): Promise<{ id?: string; erro?: string }> {
  const nome = cliente.nome.trim();
  if (!nome) return { erro: 'O cliente precisa ter um nome para ser salvo.' };

  const payload = {
    user_id: usuarioId,
    name: nome,
    cnpj_cpf: cliente.cpfCnpj?.trim() || null,
    phone: cliente.telefone?.trim() || null,
    address: cliente.endereco?.trim() || null,
    updated_at: new Date().toISOString(),
  };

  if (cliente.clienteWebId) {
    const { data, error } = await supabase
      .from('clients')
      .update(payload)
      .eq('id', cliente.clienteWebId)
      .eq('user_id', usuarioId)
      .select('id')
      .single();
    if (error) {
      console.error('[clientesWebService] erro ao atualizar cliente:', JSON.stringify(error, null, 2));
      return { erro: error.message };
    }
    return { id: data.id };
  }

  const { data, error } = await supabase.from('clients').insert(payload).select('id').single();
  if (error) {
    console.error('[clientesWebService] erro ao criar cliente:', JSON.stringify(error, null, 2));
    return { erro: error.message };
  }
  return { id: data.id };
}

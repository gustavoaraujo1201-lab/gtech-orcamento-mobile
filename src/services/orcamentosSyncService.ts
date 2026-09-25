import { Orcamento } from '../types/orcamento';
import { resumoFinanceiro } from '../utils/calculos';
import { salvarClienteWeb } from './clientesWebService';
import { supabase } from './supabaseClient';

// Mesmo prefixo usado pelo orcamentosWebService.ts ao importar orçamentos da
// Web (id local = "web-" + id real na tabela "quotes"). Precisamos reconhecer
// esse formato aqui para saber se é uma ATUALIZAÇÃO (já existe na tabela) ou
// uma CRIAÇÃO (orçamento feito do zero no mobile, nunca sincronizado).
const PREFIXO_WEB = 'web-';

function idNaTabelaQuotes(orcamento: Orcamento): string | null {
  return orcamento.id.startsWith(PREFIXO_WEB) ? orcamento.id.slice(PREFIXO_WEB.length) : null;
}

function itensParaJson(orcamento: Orcamento) {
  return orcamento.itens.map((item) => ({
    descricao: item.descricao,
    quantidade: item.quantidade,
    valorUnitario: item.valorUnitario,
  }));
}

export async function salvarOrcamentoWeb(orcamento: Orcamento): Promise<{ orcamento?: Orcamento; erro?: string }> {
  const { data: sessaoAtual } = await supabase.auth.getSession();
  const usuarioId = sessaoAtual.session?.user.id;
  if (!usuarioId) return { erro: 'Sessão expirada. Faça login novamente para sincronizar.' };

  // 1) Garante que o cliente também exista/esteja atualizado na tabela
  // "clients", para aparecer certinho no sistema Web também.
  const clienteWeb = await salvarClienteWeb(usuarioId, {
    nome: orcamento.cliente.nome,
    cpfCnpj: orcamento.cliente.cpfCnpj,
    telefone: orcamento.cliente.telefone,
    endereco: orcamento.cliente.endereco,
    clienteWebId: orcamento.cliente.clienteWebId,
  });
  if (clienteWeb.erro) return { erro: `Falha ao salvar cliente: ${clienteWeb.erro}` };

  // 2) Usa a MESMA fórmula da tela para calcular os valores finais — a
  // tabela Web só guarda o desconto já resolvido em reais, não o tipo
  // (valor/percentual), então gravamos o resultado final, não o bruto.
  const resumo = resumoFinanceiro(orcamento);

  const agora = new Date().toISOString();
  const payloadQuote = {
    user_id: usuarioId,
    client_id: clienteWeb.id ?? null,
    numero: orcamento.numero,
    quote_number: orcamento.numero,
    items: itensParaJson(orcamento),
    subtotal: resumo.subtotal,
    desconto: resumo.desconto,
    total: resumo.total,
    notes: orcamento.observacoes || null,
    updated_at: agora,
  };

  const idExistente = idNaTabelaQuotes(orcamento);

  const resposta = idExistente
    ? await supabase.from('quotes').update(payloadQuote).eq('id', idExistente).eq('user_id', usuarioId).select('id, created_at').single()
    : await supabase.from('quotes').insert(payloadQuote).select('id, created_at').single();

  if (resposta.error) {
    console.error('[orcamentosSyncService] erro ao salvar quote:', JSON.stringify(resposta.error, null, 2));
    return { erro: 'Não foi possível salvar o orçamento no servidor. Verifique sua internet e tente novamente.' };
  }

  const linha = resposta.data;
  const orcamentoFinal: Orcamento = {
    ...orcamento,
    id: `${PREFIXO_WEB}${linha.id}`,
    criadoEm: linha.created_at ?? orcamento.criadoEm,
    atualizadoEm: agora,
    cliente: { ...orcamento.cliente, clienteWebId: clienteWeb.id },
  };
  return { orcamento: orcamentoFinal };
}

export async function excluirOrcamentoWeb(orcamento: Orcamento): Promise<{ erro?: string }> {
  const idExistente = idNaTabelaQuotes(orcamento);
  // Nunca foi sincronizado (rascunho que só existiu no aparelho): não há
  // nada pra apagar no servidor.
  if (!idExistente) return {};

  const { data: sessaoAtual } = await supabase.auth.getSession();
  const usuarioId = sessaoAtual.session?.user.id;
  if (!usuarioId) return { erro: 'Sessão expirada. Faça login novamente.' };

  const { error } = await supabase.from('quotes').delete().eq('id', idExistente).eq('user_id', usuarioId);
  if (error) {
    console.error('[orcamentosSyncService] erro ao excluir quote:', JSON.stringify(error, null, 2));
    return { erro: 'Não foi possível excluir no servidor.' };
  }
  return {};
}

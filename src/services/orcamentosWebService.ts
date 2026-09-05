import { Orcamento, ItemOrcamento } from '../types/orcamento';
import { supabase } from './supabaseClient';

// Estrutura das tabelas do sistema Web (Supabase), conferida no dashboard:
// clients: id, user_id, name, cnpj_cpf, address, phone, created_at, updated_at
// quotes:  id, user_id, issuer_id, client_id, quote_number, items (jsonb),
//          subtotal, total, notes, created_at, updated_at, numero, impostos, desconto
type ClienteWebRow = {
  id: string;
  name: string | null;
  cnpj_cpf: string | null;
  phone: string | null;
  address: string | null;
};

type QuoteWebRow = {
  id: string;
  client_id: string | null;
  quote_number: string | null;
  numero: string | null;
  items: unknown;
  notes: string | null;
  desconto: number | string | null;
  created_at: string | null;
  updated_at: string | null;
};

function paraNumero(valor: unknown): number {
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : 0;
}

function paraTexto(valor: unknown): string {
  return valor === null || valor === undefined ? '' : String(valor);
}

// Os nomes de chave dentro do JSON de "items" podem variar; tentamos as
// variações mais prováveis para não deixar um item aparecer zerado à toa.
function normalizarItem(bruto: any, indice: number): ItemOrcamento {
  return {
    id: `web-item-${indice}-${Date.now()}`,
    descricao: paraTexto(bruto?.descricao ?? bruto?.description ?? bruto?.nome ?? 'Item'),
    quantidade: paraNumero(bruto?.quantidade ?? bruto?.quantity ?? bruto?.qtd ?? 1) || 1,
    valorUnitario: paraNumero(bruto?.valorUnitario ?? bruto?.valor_unitario ?? bruto?.unitPrice ?? bruto?.unit_price ?? bruto?.preco_unitario ?? 0),
  };
}

function normalizarItens(bruto: unknown): ItemOrcamento[] {
  const lista = Array.isArray(bruto) ? bruto : (typeof bruto === 'string' ? JSON.parse(bruto || '[]') : []);
  if (!Array.isArray(lista) || lista.length === 0) return [{ id: `web-item-vazio-${Date.now()}`, descricao: 'Item', quantidade: 1, valorUnitario: 0 }];
  return lista.map(normalizarItem);
}

function normalizarOrcamento(quote: QuoteWebRow, cliente: ClienteWebRow | undefined): Orcamento {
  const criadoEm = quote.created_at ?? new Date().toISOString();
  return {
    id: `web-${quote.id}`,
    numero: paraTexto(quote.numero || quote.quote_number || quote.id.slice(0, 8)),
    cliente: {
      nome: paraTexto(cliente?.name) || 'Cliente sem nome',
      cpfCnpj: paraTexto(cliente?.cnpj_cpf),
      telefone: paraTexto(cliente?.phone),
      email: '',
      endereco: paraTexto(cliente?.address),
    },
    itens: normalizarItens(quote.items),
    // A coluna "desconto" do Web guarda um valor numérico simples (não tem
    // tipo percentual/valor separado como no mobile) — tratamos como um
    // desconto EM VALOR. Se no Web isso na verdade for percentual, é só avisar.
    desconto: { tipo: 'valor', valor: paraNumero(quote.desconto) },
    observacoes: paraTexto(quote.notes),
    // O Web não tem coluna de status equivalente à do mobile; como são
    // orçamentos que já existiam prontos, marcamos como "aprovado" por padrão.
    status: 'aprovado',
    criadoEm,
    atualizadoEm: quote.updated_at ?? criadoEm,
  };
}

export async function buscarOrcamentosWebParaImportar(): Promise<Orcamento[]> {
  const { data: sessaoAtual } = await supabase.auth.getSession();
  const usuarioId = sessaoAtual.session?.user.id;
  if (!usuarioId) {
    console.error('[orcamentosWebService] nenhuma sessão ativa encontrada.');
    return [];
  }

  const [respostaClientes, respostaQuotes] = await Promise.all([
    supabase.from('clients').select('id, name, cnpj_cpf, phone, address').eq('user_id', usuarioId),
    supabase.from('quotes').select('id, client_id, quote_number, numero, items, notes, desconto, created_at, updated_at').eq('user_id', usuarioId),
  ]);

  if (respostaClientes.error) {
    console.error('[orcamentosWebService] erro ao buscar clients:', JSON.stringify(respostaClientes.error, null, 2));
  }
  if (respostaQuotes.error) {
    console.error('[orcamentosWebService] erro ao buscar quotes:', JSON.stringify(respostaQuotes.error, null, 2));
    return [];
  }

  const clientesPorId = new Map<string, ClienteWebRow>();
  (respostaClientes.data ?? []).forEach((linha: any) => clientesPorId.set(linha.id, linha));

  const quotes = (respostaQuotes.data ?? []) as QuoteWebRow[];
  console.log(`[orcamentosWebService] ${quotes.length} orçamento(s) encontrado(s) no Web para usuarioId=${usuarioId}`);

  return quotes.map((quote) => normalizarOrcamento(quote, quote.client_id ? clientesPorId.get(quote.client_id) : undefined));
}

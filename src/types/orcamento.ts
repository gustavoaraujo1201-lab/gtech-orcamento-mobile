export type TipoDesconto = 'valor' | 'percentual';

export type Cliente = {
  nome: string;
  cpfCnpj?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  // Preenchido quando o cliente já existe na tabela "clients" do Supabase
  // (selecionado via ClienteWebPicker, ou depois da 1ª sincronização de um
  // cliente digitado manualmente). Sem isso, cada salvamento criaria um
  // cliente novo duplicado no banco em vez de atualizar o existente.
  clienteWebId?: string;
};

export type ItemOrcamento = {
  id: string;
  descricao: string;
  quantidade: number;
  valorUnitario: number;
};

export type Desconto = { tipo: TipoDesconto; valor: number };

export type Orcamento = {
  id: string;
  numero: string;
  cliente: Cliente;
  itens: ItemOrcamento[];
  desconto: Desconto;
  observacoes: string;
  criadoEm: string;
  atualizadoEm: string;
};

export type Empresa = {
  nome: string;
  telefone: string;
  whatsapp: string;
  email: string;
  endereco: string;
  site: string;
  instagram: string;
};

export type StatusOrcamento = 'rascunho' | 'enviado' | 'aprovado' | 'recusado';
export type TipoDesconto = 'valor' | 'percentual';

export type Cliente = {
  nome: string;
  cpfCnpj?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
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
  status: StatusOrcamento;
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

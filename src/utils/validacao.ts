import { Orcamento } from '../types/orcamento';

export function validarOrcamento(orcamento: Pick<Orcamento, 'cliente' | 'itens' | 'desconto'>): string | null {
  if (!orcamento.cliente.nome.trim()) return 'Informe o nome do cliente.';
  if (!orcamento.itens.length) return 'Adicione ao menos um item.';
  if (orcamento.itens.some((item) => !item.descricao.trim() || item.quantidade <= 0 || item.valorUnitario < 0)) return 'Revise descrição, quantidade e valor dos itens.';
  if (orcamento.desconto.valor < 0 || (orcamento.desconto.tipo === 'percentual' && orcamento.desconto.valor > 100)) return 'Informe um desconto válido.';
  return null;
}

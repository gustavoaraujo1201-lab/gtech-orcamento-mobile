import { Desconto, ItemOrcamento, Orcamento } from '../types/orcamento';

// Trabalha em centavos para evitar erros de ponto flutuante em valores monetários.
export function paraCentavos(valor: number): number {
  return Math.round((Number.isFinite(valor) ? valor : 0) * 100);
}

export function deCentavos(centavos: number): number { return centavos / 100; }

export function subtotalItem(item: ItemOrcamento): number {
  return deCentavos(Math.round(item.quantidade * paraCentavos(item.valorUnitario)));
}

export function subtotalOrcamento(itens: ItemOrcamento[]): number {
  return deCentavos(itens.reduce((total, item) => total + Math.round(item.quantidade * paraCentavos(item.valorUnitario)), 0));
}

export function valorDesconto(subtotal: number, desconto: Desconto): number {
  const bruto = desconto.tipo === 'percentual' ? subtotal * (desconto.valor / 100) : desconto.valor;
  return Math.min(Math.max(0, deCentavos(paraCentavos(bruto))), subtotal);
}

export function totalOrcamento(itens: ItemOrcamento[], desconto: Desconto): number {
  const subtotal = subtotalOrcamento(itens);
  return deCentavos(Math.max(0, paraCentavos(subtotal) - paraCentavos(valorDesconto(subtotal, desconto))));
}

export function resumoFinanceiro(orcamento: Orcamento) {
  const subtotal = subtotalOrcamento(orcamento.itens);
  const desconto = valorDesconto(subtotal, orcamento.desconto);
  return { subtotal, desconto, total: totalOrcamento(orcamento.itens, orcamento.desconto) };
}

export function moeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0);
}

export function dataBrasileira(data: string, incluirHora = false): string {
  return new Intl.DateTimeFormat('pt-BR', incluirHora ? { dateStyle: 'short', timeStyle: 'short' } : { dateStyle: 'short' }).format(new Date(data));
}

export function numeroOrcamento(proximo: number): string {
  return `ORC-${String(proximo).padStart(6, '0')}`;
}

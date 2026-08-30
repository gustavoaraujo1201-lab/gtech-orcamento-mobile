import { numeroOrcamento, moeda } from '../utils/formatacao';
import { subtotalItem, subtotalOrcamento, totalOrcamento, valorDesconto } from '../utils/calculos';
import { validarOrcamento } from '../utils/validacao';

const itens = [
  { id: '1', descricao: 'Formatação', quantidade: 1, valorUnitario: 150 },
  { id: '2', descricao: 'Instalação', quantidade: 2, valorUnitario: 100 },
];

describe('cálculos de orçamento', () => {
  it('calcula subtotal de item e do orçamento', () => {
    expect(subtotalItem(itens[1])).toBe(200);
    expect(subtotalOrcamento(itens)).toBe(350);
  });
  it('calcula desconto percentual e limita desconto ao subtotal', () => {
    expect(valorDesconto(500, { tipo: 'percentual', valor: 10 })).toBe(50);
    expect(totalOrcamento(itens, { tipo: 'valor', valor: 500 })).toBe(0);
  });
  it('mantém precisão de centavos', () => {
    expect(totalOrcamento([{ id: '1', descricao: 'Item', quantidade: 3, valorUnitario: 0.1 }], { tipo: 'valor', valor: 0 })).toBe(0.3);
  });
});

describe('formatação e validação', () => {
  it('gera número estável com zeros à esquerda', () => expect(numeroOrcamento(12)).toBe('ORC-000012'));
  it('formata moeda em pt-BR', () => expect(moeda(150)).toBe('R$ 150,00'));
  it('recusa orçamento sem cliente ou itens válidos', () => {
    expect(validarOrcamento({ cliente: { nome: '' }, itens: [], desconto: { tipo: 'valor', valor: 0 } })).toBeTruthy();
    expect(validarOrcamento({ cliente: { nome: 'Ana' }, itens, desconto: { tipo: 'valor', valor: 0 } })).toBeNull();
  });
});

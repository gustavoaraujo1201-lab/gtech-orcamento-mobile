import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Empresa, Orcamento } from '../types/orcamento';
import { resumoFinanceiro, subtotalItem } from '../utils/calculos';
import { dataBrasileira, moeda } from '../utils/formatacao';

const escaparHtml = (texto = '') => texto.replace(/[&<>"']/g, (caractere) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[caractere] || caractere));

export function criarHtmlPdf(orcamento: Orcamento, empresa: Empresa): string {
  const resumo = resumoFinanceiro(orcamento);
  const contato = [empresa.site, empresa.whatsapp && `WhatsApp: ${empresa.whatsapp}`, empresa.email].filter(Boolean).join(' | ');
  const linhas = orcamento.itens.map((item) => `<tr><td>${escaparHtml(item.descricao)}</td><td class="number">${item.quantidade}</td><td class="number">${moeda(item.valorUnitario)}</td><td class="number">${moeda(subtotalItem(item))}</td></tr>`).join('');
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>
    body{font-family:Arial,sans-serif;color:#17212b;padding:36px;font-size:12px}.header{border-bottom:3px solid #123b5d;padding-bottom:16px;display:flex;justify-content:space-between}.brand{color:#123b5d;font-size:20px;font-weight:bold;letter-spacing:1px}.title{font-size:22px;font-weight:bold;margin:24px 0 4px}.muted{color:#627180}.client{background:#f4f7fa;padding:14px;margin:18px 0;line-height:1.7}table{width:100%;border-collapse:collapse;margin-top:16px}th{text-align:left;background:#123b5d;color:#fff;padding:9px}td{padding:9px;border-bottom:1px solid #dce3ea}.number{text-align:right}.totals{margin:20px 0 0 auto;width:260px}.totals div{display:flex;justify-content:space-between;padding:6px 0}.total{font-weight:bold;font-size:16px;border-top:2px solid #123b5d;color:#123b5d}.footer{position:fixed;bottom:20px;left:36px;right:36px;text-align:center;color:#627180;font-size:10px;border-top:1px solid #dce3ea;padding-top:8px}
  </style></head><body><div class="header"><div><div class="brand">${escaparHtml(empresa.nome || 'GTECH PRIME')}</div><div class="muted">Orçamentos profissionais</div></div><div class="number"><b>ORÇAMENTO</b><br/>${orcamento.numero}<br/>${dataBrasileira(orcamento.criadoEm)}</div></div>
  <div class="title">ORÇAMENTO</div><div class="client"><b>Cliente</b><br/>${escaparHtml(orcamento.cliente.nome)}${orcamento.cliente.cpfCnpj ? `<br/>CPF/CNPJ: ${escaparHtml(orcamento.cliente.cpfCnpj)}` : ''}${orcamento.cliente.telefone ? `<br/>Telefone: ${escaparHtml(orcamento.cliente.telefone)}` : ''}${orcamento.cliente.email ? `<br/>E-mail: ${escaparHtml(orcamento.cliente.email)}` : ''}${orcamento.cliente.endereco ? `<br/>Endereço: ${escaparHtml(orcamento.cliente.endereco)}` : ''}</div>
  <table><thead><tr><th>Descrição</th><th class="number">Qtd.</th><th class="number">Valor unit.</th><th class="number">Subtotal</th></tr></thead><tbody>${linhas}</tbody></table>
  <div class="totals"><div><span>Subtotal</span><b>${moeda(resumo.subtotal)}</b></div><div><span>Desconto</span><b>${moeda(resumo.desconto)}</b></div><div class="total"><span>TOTAL</span><span>${moeda(resumo.total)}</span></div></div>
  ${orcamento.observacoes ? `<div class="client"><b>Observações</b><br/>${escaparHtml(orcamento.observacoes).replace(/\n/g, '<br/>')}</div>` : ''}<div class="footer">Sistema desenvolvido por Gtech Prime${contato ? `<br/>${escaparHtml(contato)}` : ''}</div></body></html>`;
}

export async function gerarPdf(orcamento: Orcamento, empresa: Empresa) {
  const temporario = await Print.printToFileAsync({ html: criarHtmlPdf(orcamento, empresa), base64: false });
  const nome = `Gtech_Prime_Orcamento_${orcamento.numero}.pdf`;
  const diretorioTemporario = FileSystem.cacheDirectory;
  if (!diretorioTemporario) throw new Error('Diretório temporário indisponível.');
  const destino = `${diretorioTemporario}${nome}`;
  await FileSystem.copyAsync({ from: temporario.uri, to: destino });
  return { uri: destino };
}
export async function compartilharPdf(uri: string, titulo: string) {
  if (!(await Sharing.isAvailableAsync())) throw new Error('O compartilhamento não está disponível neste dispositivo.');
  return Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: titulo, UTI: 'com.adobe.pdf' });
}

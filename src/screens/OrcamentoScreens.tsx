import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useMemo, useState } from 'react';
import { Screen } from '../components/Screen';
import { ScreenHeader } from '../components/ScreenHeader';
import { CampoMoeda } from '../components/CampoMoeda';
import { Card, Field, PrimaryButton, SecondaryButton } from '../components/ui';
import { ClienteWebPicker } from '../components/ClienteWebPicker';
import { ClienteWeb } from '../services/clientesWebService';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useStorage } from '../storage/StorageProvider';
import { Desconto, ItemOrcamento, Orcamento } from '../types/orcamento';
import { resumoFinanceiro, subtotalItem } from '../utils/calculos';
import { dataBrasileira, moeda, numeroOrcamento } from '../utils/formatacao';
import { validarOrcamento } from '../utils/validacao';
import { colors, spacing } from '../theme';
import { compartilharPdf, gerarPdf } from '../services/pdfService';

const novoItem = (): ItemOrcamento => ({ id: `${Date.now()}-${Math.random()}`, descricao: '', quantidade: 1, valorUnitario: 0 });
const vazio = (): Orcamento => ({ id: `${Date.now()}-${Math.random()}`, numero: '', cliente: { nome: '', cpfCnpj: '', telefone: '', email: '', endereco: '' }, itens: [novoItem()], desconto: { tipo: 'valor', valor: 0 }, observacoes: '', criadoEm: new Date().toISOString(), atualizadoEm: new Date().toISOString() });
const paraNumero = (valor: string) => Number(valor.replace(',', '.')) || 0;

export function EditorOrcamentoScreen() {
  const navigation = useNavigation<any>(); const route = useRoute<RouteProp<RootStackParamList, 'Editor'>>(); const { orcamentos, salvarOrcamento } = useStorage();
  const existente = orcamentos.find((o) => o.id === route.params?.id); const [orcamento, setOrcamento] = useState<Orcamento>(existente || vazio()); const resumo = useMemo(() => resumoFinanceiro(orcamento), [orcamento]);
  const [salvando, setSalvando] = useState(false);
  function cliente(campo: keyof Orcamento['cliente'], valor: string) { setOrcamento({ ...orcamento, cliente: { ...orcamento.cliente, [campo]: valor } }); }
  function preencherClienteWeb(clienteWeb: ClienteWeb) {
    setOrcamento({ ...orcamento, cliente: {
      nome: clienteWeb.nome || orcamento.cliente.nome,
      cpfCnpj: clienteWeb.cpfCnpj || orcamento.cliente.cpfCnpj,
      telefone: clienteWeb.telefone || orcamento.cliente.telefone,
      email: clienteWeb.email || orcamento.cliente.email,
      endereco: clienteWeb.endereco || orcamento.cliente.endereco,
      clienteWebId: clienteWeb.id,
    } });
  }
  function item(id: string, campo: keyof ItemOrcamento, valor: string) { setOrcamento({ ...orcamento, itens: orcamento.itens.map((atual) => atual.id === id ? { ...atual, [campo]: campo === 'descricao' ? valor : paraNumero(valor) } : atual) }); }
  async function salvar() {
    if (salvando) return;
    const erro = validarOrcamento(orcamento);
    if (erro) return Alert.alert('Revise o orçamento', erro);
    const ultimoNumero = orcamentos.reduce((maior, atual) => Math.max(maior, Number(atual.numero.replace('ORC-', '')) || 0), 0);
    const paraSalvar = { ...orcamento, numero: orcamento.numero || numeroOrcamento(ultimoNumero + 1), atualizadoEm: new Date().toISOString() };
    setSalvando(true);
    const resultado = await salvarOrcamento(paraSalvar);
    setSalvando(false);
    if (resultado.erro || !resultado.orcamento) {
      Alert.alert('Não foi possível salvar', resultado.erro ?? 'Verifique sua internet e tente novamente.');
      return;
    }
    navigation.replace('Detalhe', { id: resultado.orcamento.id });
  }
  return <Screen scroll header={<ScreenHeader title="Orçamento" onBack={() => navigation.goBack()} />} contentContainerStyle={styles.content}><Text style={styles.section}>Cliente</Text><ClienteWebPicker onSelecionar={preencherClienteWeb} /><Field label="Nome *" value={orcamento.cliente.nome} onChangeText={(v) => cliente('nome', v)} /><Field label="CPF/CNPJ" value={orcamento.cliente.cpfCnpj} onChangeText={(v) => cliente('cpfCnpj', v)} /><Field label="Telefone" value={orcamento.cliente.telefone} keyboardType="phone-pad" onChangeText={(v) => cliente('telefone', v)} /><Field label="E-mail" value={orcamento.cliente.email} keyboardType="email-address" autoCapitalize="none" onChangeText={(v) => cliente('email', v)} /><Field label="Endereço" value={orcamento.cliente.endereco} onChangeText={(v) => cliente('endereco', v)} />
    <Text style={styles.section}>Itens</Text>{orcamento.itens.map((atual, indice) => <Card style={styles.item} key={atual.id}><View style={styles.itemHead}><Text style={styles.itemTitle}>Item {indice + 1}</Text>{orcamento.itens.length > 1 && <Text accessibilityRole="button" onPress={() => setOrcamento({ ...orcamento, itens: orcamento.itens.filter((i) => i.id !== atual.id) })} style={styles.remove}>Excluir</Text>}</View><Field label="Descrição *" value={atual.descricao} onChangeText={(v) => item(atual.id, 'descricao', v)} /><View style={styles.twoFields}><View style={styles.half}><Field label="Quantidade *" defaultValue={String(atual.quantidade)} keyboardType="decimal-pad" onChangeText={(v) => item(atual.id, 'quantidade', v)} /></View><View style={styles.half}><CampoMoeda label="Valor unitário *" valor={atual.valorUnitario} onChangeValor={(v) => item(atual.id, 'valorUnitario', String(v))} /></View></View><Text style={styles.itemSubtotal}>Subtotal: {moeda(subtotalItem(atual))}</Text></Card>)}<SecondaryButton title="+ Adicionar item" onPress={() => setOrcamento({ ...orcamento, itens: [...orcamento.itens, novoItem()] })} />
    <Text style={styles.section}>Desconto</Text><View style={styles.discountType}><Pressable onPress={() => setOrcamento({ ...orcamento, desconto: { ...orcamento.desconto, tipo: 'valor' } })} style={[styles.typeButton, orcamento.desconto.tipo === 'valor' && styles.activeType]}><Text style={orcamento.desconto.tipo === 'valor' ? styles.activeTypeText : styles.typeText}>Em valor (R$)</Text></Pressable><Pressable onPress={() => setOrcamento({ ...orcamento, desconto: { ...orcamento.desconto, tipo: 'percentual' } })} style={[styles.typeButton, orcamento.desconto.tipo === 'percentual' && styles.activeType]}><Text style={orcamento.desconto.tipo === 'percentual' ? styles.activeTypeText : styles.typeText}>Percentual (%)</Text></Pressable></View>{orcamento.desconto.tipo === 'valor' ? <CampoMoeda label="Desconto" valor={orcamento.desconto.valor} onChangeValor={(v) => setOrcamento({ ...orcamento, desconto: { ...orcamento.desconto, valor: v } })} /> : <Field label="Desconto (%)" defaultValue={String(orcamento.desconto.valor)} keyboardType="decimal-pad" onChangeText={(v) => setOrcamento({ ...orcamento, desconto: { ...orcamento.desconto, valor: paraNumero(v) } })} />}<Field label="Observações" value={orcamento.observacoes} multiline onChangeText={(v) => setOrcamento({ ...orcamento, observacoes: v })} placeholder="Ex.: Orçamento válido por 10 dias." />
    <Card style={styles.summary}><Text>Subtotal <Text style={styles.total}>{moeda(resumo.subtotal)}</Text></Text><Text>Desconto <Text style={styles.total}>{moeda(resumo.desconto)}</Text></Text><View style={styles.totalLine}><Text style={styles.totalLabel}>TOTAL</Text><Text style={styles.totalValue}>{moeda(resumo.total)}</Text></View></Card><PrimaryButton title={salvando ? 'Salvando...' : 'Salvar orçamento'} onPress={salvar} disabled={salvando} /></Screen>;
}

export function DetalheOrcamentoScreen() {
  const navigation = useNavigation<any>(); const route = useRoute<RouteProp<RootStackParamList, 'Detalhe'>>(); const { orcamentos, empresa, excluirOrcamento } = useStorage(); const [gerando, setGerando] = useState(false); const encontrado = orcamentos.find((o) => o.id === route.params.id);
  if (!encontrado) return <Screen header={<ScreenHeader title="Detalhes do orçamento" onBack={() => navigation.goBack()} />}><View style={styles.notFound}><Text>Orçamento não encontrado.</Text></View></Screen>;
  const orcamento: Orcamento = encontrado; const resumo = resumoFinanceiro(orcamento);
  async function compartilhar() { try { setGerando(true); const arquivo = await gerarPdf(orcamento, empresa); await compartilharPdf(arquivo.uri, `Orçamento ${orcamento.numero}`); } catch { Alert.alert('Não foi possível compartilhar', 'Tente gerar o PDF novamente.'); } finally { setGerando(false); } }
  return <Screen scroll teclado={false} header={<ScreenHeader title="Detalhes do orçamento" onBack={() => navigation.goBack()} />} contentContainerStyle={styles.content}><View style={styles.detailHead}><View><Text style={styles.detailNumber}>{orcamento.numero}</Text><Text style={styles.clientName}>{orcamento.cliente.nome}</Text><Text style={styles.date}>Criado em {dataBrasileira(orcamento.criadoEm)}</Text></View></View><Card><Text style={styles.cardTitle}>Itens</Text>{orcamento.itens.map((item) => <View key={item.id} style={styles.detailItem}><View><Text style={styles.itemName}>{item.descricao}</Text><Text style={styles.date}>{item.quantidade} × {moeda(item.valorUnitario)}</Text></View><Text style={styles.itemValue}>{moeda(subtotalItem(item))}</Text></View>)}<View style={styles.totalLine}><Text style={styles.totalLabel}>TOTAL</Text><Text style={styles.totalValue}>{moeda(resumo.total)}</Text></View></Card>{orcamento.observacoes ? <Card><Text style={styles.cardTitle}>Observações</Text><Text style={styles.obs}>{orcamento.observacoes}</Text></Card> : null}<PrimaryButton title={gerando ? 'Gerando PDF...' : 'Compartilhar orçamento / WhatsApp'} onPress={compartilhar} disabled={gerando} /><View style={styles.actions}><SecondaryButton title="Editar" onPress={() => navigation.navigate('Editor', { id: orcamento.id })} /><SecondaryButton title="Excluir" onPress={() => Alert.alert('Excluir orçamento?', 'Esta ação não poderá ser desfeita.', [{ text: 'Cancelar', style: 'cancel' }, { text: 'Excluir', style: 'destructive', onPress: async () => { const resultado = await excluirOrcamento(orcamento); if (resultado.erro) { Alert.alert('Não foi possível excluir', resultado.erro); return; } navigation.popToTop(); } }])} /></View></Screen>;
}
const styles = StyleSheet.create({ page: { flex: 1, backgroundColor: colors.background }, content: { padding: spacing.md, gap: spacing.md }, section: { color: colors.text, fontSize: 18, fontWeight: '800', marginTop: 4 }, item: { gap: 2 }, itemHead: { flexDirection: 'row', justifyContent: 'space-between' }, itemTitle: { color: colors.primary, fontWeight: '800' }, remove: { color: colors.danger, fontWeight: '700' }, twoFields: { flexDirection: 'row', gap: spacing.sm }, half: { flex: 1 }, itemSubtotal: { textAlign: 'right', fontWeight: '700', color: colors.text }, discountType: { flexDirection: 'row', gap: spacing.sm }, typeButton: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 9, padding: 12, alignItems: 'center' }, activeType: { backgroundColor: colors.primary, borderColor: colors.primary }, typeText: { color: colors.text, fontWeight: '600' }, activeTypeText: { color: '#fff', fontWeight: '700' }, summary: { gap: 10 }, total: { fontWeight: '700' }, totalLine: { borderTopWidth: 1, borderColor: colors.border, paddingTop: 12, flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }, totalLabel: { color: colors.primary, fontWeight: '900', fontSize: 17 }, totalValue: { color: colors.primary, fontWeight: '900', fontSize: 17 }, notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' }, detailHead: { flexDirection: 'row', justifyContent: 'space-between' }, detailNumber: { color: colors.primary, fontWeight: '800' }, clientName: { color: colors.text, fontSize: 22, fontWeight: '800', marginTop: 4 }, date: { color: colors.muted, fontSize: 12, marginTop: 5 }, cardTitle: { color: colors.text, fontWeight: '800', marginBottom: 10 }, detailItem: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderColor: colors.border, paddingVertical: 10 }, itemName: { color: colors.text, fontWeight: '600' }, itemValue: { color: colors.text, fontWeight: '800' }, obs: { color: colors.text, lineHeight: 20 }, actions: { flexDirection: 'row', gap: spacing.sm }, });

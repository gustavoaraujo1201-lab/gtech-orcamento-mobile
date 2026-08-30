import { useNavigation } from '@react-navigation/native';
import { FlatList, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Card, StatusBadge } from '../components/ui';
import { useState } from 'react';
import { useStorage } from '../storage/StorageProvider';
import { resumoFinanceiro } from '../utils/calculos';
import { dataBrasileira, moeda } from '../utils/formatacao';
import { colors, spacing } from '../theme';

export function HistoricoScreen() {
  const navigation = useNavigation<any>(); const { orcamentos } = useStorage(); const [busca, setBusca] = useState('');
  const termo = busca.toLowerCase().trim(); const lista = orcamentos.filter((o) => !termo || [o.numero, o.cliente.nome, o.cliente.telefone].some((valor) => valor?.toLowerCase().includes(termo)));
  return <SafeAreaView style={styles.page}><FlatList data={lista} keyExtractor={(o) => o.id} contentContainerStyle={styles.content} ListHeaderComponent={<><Text style={styles.title}>Meus Orçamentos</Text><TextInput accessibilityLabel="Pesquisar orçamentos" value={busca} onChangeText={setBusca} placeholder="Pesquisar por número, cliente ou telefone" placeholderTextColor={colors.muted} style={styles.search} /></>} ListEmptyComponent={<Card><Text style={styles.empty}>{termo ? 'Nenhum orçamento encontrado.' : 'Nenhum orçamento salvo.'}</Text></Card>} renderItem={({ item }) => <Card style={styles.card}><View><Text style={styles.number}>{item.numero}</Text><Text style={styles.client}>{item.cliente.nome}</Text><Text style={styles.date}>{dataBrasileira(item.atualizadoEm)}</Text></View><View style={styles.right}><StatusBadge status={item.status} /><Text style={styles.value} onPress={() => navigation.navigate('Detalhe', { id: item.id })}>{moeda(resumoFinanceiro(item).total)}</Text><Text accessibilityRole="button" onPress={() => navigation.navigate('Detalhe', { id: item.id })} style={styles.open}>Ver detalhes</Text></View></Card>} /></SafeAreaView>;
}
const styles = StyleSheet.create({ page: { flex: 1, backgroundColor: colors.background }, content: { padding: spacing.md, gap: spacing.sm }, title: { fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: spacing.md }, search: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 10, height: 48, paddingHorizontal: 12, color: colors.text, marginBottom: spacing.sm }, card: { flexDirection: 'row', justifyContent: 'space-between' }, number: { color: colors.primary, fontWeight: '700', fontSize: 12 }, client: { color: colors.text, fontSize: 16, fontWeight: '700', marginTop: 5 }, date: { color: colors.muted, fontSize: 12, marginTop: 5 }, right: { alignItems: 'flex-end' }, value: { color: colors.text, fontWeight: '800', marginTop: 10 }, open: { color: colors.primary, fontWeight: '700', fontSize: 12, marginTop: 8 }, empty: { textAlign: 'center', color: colors.muted } });

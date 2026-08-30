import { SafeAreaView, ScrollView, StyleSheet, Text } from 'react-native';
import { useState } from 'react';
import { Field, PrimaryButton } from '../components/ui';
import { useStorage } from '../storage/StorageProvider';
import { colors, spacing } from '../theme';

export function ConfiguracoesScreen() {
  const { empresa, salvarEmpresa } = useStorage(); const [dados, setDados] = useState(empresa); const [salvo, setSalvo] = useState(false);
  function atualizar(campo: keyof typeof dados, valor: string) { setDados({ ...dados, [campo]: valor }); setSalvo(false); }
  return <SafeAreaView style={styles.page}><ScrollView contentContainerStyle={styles.content}><Text style={styles.title}>Informações da empresa</Text><Text style={styles.description}>Estes dados são usados no PDF. Preencha apenas as informações que desejar exibir.</Text><Field label="Nome da empresa" value={dados.nome} onChangeText={(v) => atualizar('nome', v)} /><Field label="Telefone" value={dados.telefone} keyboardType="phone-pad" onChangeText={(v) => atualizar('telefone', v)} /><Field label="WhatsApp" value={dados.whatsapp} keyboardType="phone-pad" onChangeText={(v) => atualizar('whatsapp', v)} /><Field label="E-mail" value={dados.email} keyboardType="email-address" autoCapitalize="none" onChangeText={(v) => atualizar('email', v)} /><Field label="Endereço" value={dados.endereco} onChangeText={(v) => atualizar('endereco', v)} /><Field label="Site" value={dados.site} autoCapitalize="none" onChangeText={(v) => atualizar('site', v)} /><Field label="Instagram" value={dados.instagram} autoCapitalize="none" onChangeText={(v) => atualizar('instagram', v)} /><PrimaryButton title={salvo ? 'Informações salvas' : 'Salvar informações'} onPress={async () => { await salvarEmpresa(dados); setSalvo(true); }} /></ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({ page: { flex: 1, backgroundColor: colors.background }, content: { padding: spacing.md }, title: { color: colors.text, fontSize: 24, fontWeight: '800', marginBottom: 8 }, description: { color: colors.muted, lineHeight: 20, marginBottom: spacing.lg } });

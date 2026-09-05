import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ClienteWeb, buscarClientesWeb } from '../services/clientesWebService';
import { colors, spacing } from '../theme';

type ClienteWebPickerProps = {
  onSelecionar: (cliente: ClienteWeb) => void;
};

/**
 * Busca clientes já cadastrados no sistema Web (mesmo Supabase) e permite
 * preencher os campos do orçamento com um toque, em vez de digitar tudo de novo.
 * Não substitui os campos manuais abaixo — é só um atalho opcional.
 */
export function ClienteWebPicker({ onSelecionar }: ClienteWebPickerProps) {
  const [aberto, setAberto] = useState(false);
  const [termo, setTermo] = useState('');
  const [resultados, setResultados] = useState<ClienteWeb[]>([]);
  const [buscando, setBuscando] = useState(false);

  async function buscar(valor: string) {
    setTermo(valor);
    setBuscando(true);
    const encontrados = await buscarClientesWeb(valor);
    setResultados(encontrados);
    setBuscando(false);
  }

  function abrir() {
    setAberto(true);
    if (resultados.length === 0) buscar('');
  }

  if (!aberto) {
    return (
      <Pressable onPress={abrir} style={styles.toggle}>
        <Text style={styles.toggleText}>Buscar cliente cadastrado</Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.painel}>
      <TextInput
        value={termo}
        onChangeText={buscar}
        placeholder="Buscar por nome..."
        placeholderTextColor={colors.muted}
        style={styles.input}
        autoFocus
      />
      {buscando ? (
        <ActivityIndicator color={colors.primary} style={styles.spinner} />
      ) : (
        <FlatList
          data={resultados}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          style={styles.lista}
          ListEmptyComponent={<Text style={styles.vazio}>Nenhum cliente encontrado.</Text>}
          renderItem={({ item }) => (
            <Pressable onPress={() => { onSelecionar(item); setAberto(false); }} style={styles.resultado}>
              <Text style={styles.nome}>{item.nome}</Text>
              {item.telefone ? <Text style={styles.detalhe}>{item.telefone}</Text> : null}
            </Pressable>
          )}
        />
      )}
      <Text accessibilityRole="button" onPress={() => setAberto(false)} style={styles.fechar}>Fechar busca</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  toggle: { borderWidth: 1, borderColor: colors.primary, borderRadius: 9, padding: 12, alignItems: 'center', marginBottom: spacing.sm },
  toggleText: { color: colors.primary, fontWeight: '700' },
  painel: { borderWidth: 1, borderColor: colors.border, borderRadius: 9, padding: spacing.sm, gap: spacing.sm, marginBottom: spacing.sm },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 10, color: colors.text },
  spinner: { paddingVertical: spacing.sm },
  lista: { maxHeight: 220 },
  resultado: { paddingVertical: 10, borderBottomWidth: 1, borderColor: colors.border },
  nome: { color: colors.text, fontWeight: '700' },
  detalhe: { color: colors.muted, fontSize: 12, marginTop: 2 },
  vazio: { color: colors.muted, textAlign: 'center', paddingVertical: spacing.sm },
  fechar: { color: colors.danger, textAlign: 'center', fontWeight: '600' },
});

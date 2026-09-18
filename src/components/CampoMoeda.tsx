import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, spacing } from '../theme';

type CampoMoedaProps = {
  label: string;
  valor: number;
  onChangeValor: (valor: number) => void;
};

// Formata uma quantidade de centavos (inteiro) no padrão brasileiro:
// vírgula decimal sempre, ponto de milhar só a partir de 1.000, e sempre
// com 2 casas decimais (mesmo quando terminam em zero).
function formatarCentavos(centavos: number): string {
  const reais = (centavos / 100).toFixed(2);
  const [inteiro, decimais] = reais.split('.');
  const inteiroComPontos = inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${inteiroComPontos},${decimais}`;
}

// A máscara trata o texto digitado como uma sequência de centavos: cada
// dígito novo "empurra" os anteriores, exatamente como em apps bancários.
// Isso elimina de vez o bug de vírgula/ponto sendo apagados ou casa decimal
// faltando zero, porque o texto exibido nunca é digitado livremente — ele é
// sempre recalculado a partir dos dígitos.
export function CampoMoeda({ label, valor, onChangeValor }: CampoMoedaProps) {
  const [texto, setTexto] = useState(() => formatarCentavos(Math.round((valor || 0) * 100)));

  function alterar(novoTexto: string) {
    const somenteDigitos = novoTexto.replace(/\D/g, '');
    const centavos = somenteDigitos ? parseInt(somenteDigitos, 10) : 0;
    setTexto(formatarCentavos(centavos));
    onChangeValor(centavos / 100);
  }

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={texto}
        onChangeText={alterar}
        keyboardType="number-pad"
        placeholderTextColor={colors.muted}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: spacing.md },
  label: { color: colors.text, fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, borderRadius: 9, minHeight: 46, paddingHorizontal: 12, color: colors.text, fontSize: 16 },
});

import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme';

type ScreenHeaderProps = {
  title: string;
  onBack: () => void;
};

/**
 * Substitui o header nativo do React Navigation nas telas que empilham
 * sobre as abas (Editor e Detalhe). Fica dentro do `Screen`, então herda
 * o mesmo respiro de Safe Area do restante da tela — o header nativo,
 * por ficar numa camada separada, não estava descontando corretamente
 * a área do notch/câmera em alguns aparelhos.
 */
export function ScreenHeader({ title, onBack }: ScreenHeaderProps) {
  return (
    <View style={styles.header}>
      <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={onBack} hitSlop={12} style={styles.backButton}>
        <Ionicons name="chevron-back" size={24} color={colors.primary} />
      </Pressable>
      <Text style={styles.title} numberOfLines={1}>{title}</Text>
      <View style={styles.spacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.sm, paddingVertical: spacing.sm, backgroundColor: colors.background },
  backButton: { padding: spacing.xs },
  title: { flex: 1, color: colors.text, fontSize: 18, fontWeight: '800', textAlign: 'center' },
  spacer: { width: 24 + spacing.xs * 2 },
});

import { ReactNode, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../theme';

export function Brand() { return <View style={styles.brandBox}><Text style={styles.brand}>GTECH PRIME</Text><Text style={styles.tagline}>ORÇAMENTOS</Text></View>; }
export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) { return <View style={[styles.card, style]}>{children}</View>; }
export function PrimaryButton({ title, onPress, disabled = false }: { title: string; onPress: () => void; disabled?: boolean }) { return <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={[styles.primary, disabled && styles.disabled]}><Text style={styles.primaryText}>{title}</Text></Pressable>; }
export function SecondaryButton({ title, onPress }: { title: string; onPress: () => void }) { return <Pressable accessibilityRole="button" onPress={onPress} style={styles.secondary}><Text style={styles.secondaryText}>{title}</Text></Pressable>; }
export function Field({ label, ...props }: TextInputProps & { label: string }) {
  const ehSenha = props.secureTextEntry === true;
  const [mostrarSenha, setMostrarSenha] = useState(false);
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          placeholderTextColor={colors.muted}
          style={[styles.input, props.multiline && styles.multiline, ehSenha && styles.inputComIcone]}
          {...props}
          secureTextEntry={ehSenha && !mostrarSenha}
        />
        {ehSenha && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
            onPress={() => setMostrarSenha((atual) => !atual)}
            style={styles.iconeOlho}
            hitSlop={10}
          >
            <Ionicons name={mostrarSenha ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.muted} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  brandBox: { alignItems: 'center' },
  brand: { color: colors.primary, fontSize: 20, fontWeight: '800', letterSpacing: 1.4, textAlign: 'center' }, tagline: { color: colors.muted, fontSize: 10, letterSpacing: 1.8, marginTop: 2, textAlign: 'center' },
  card: { backgroundColor: colors.surface, borderRadius: 14, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  primary: { backgroundColor: colors.primary, borderRadius: 10, minHeight: 50, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.md }, primaryText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secondary: { borderColor: colors.primary, borderWidth: 1, borderRadius: 10, minHeight: 46, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.md }, secondaryText: { color: colors.primary, fontWeight: '700' }, disabled: { opacity: .5 },
  field: { marginBottom: spacing.md }, label: { color: colors.text, fontWeight: '600', marginBottom: 6 }, input: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, borderRadius: 9, minHeight: 46, paddingHorizontal: 12, color: colors.text, fontSize: 16 }, multiline: { minHeight: 96, paddingTop: 12, textAlignVertical: 'top' },
  inputWrapper: { justifyContent: 'center' }, inputComIcone: { paddingRight: 44 }, iconeOlho: { position: 'absolute', right: 12, height: '100%', justifyContent: 'center' },
});

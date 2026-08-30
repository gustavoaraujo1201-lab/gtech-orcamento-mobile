import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import { colors, spacing } from '../theme';
import { StatusOrcamento } from '../types/orcamento';

export function Brand() { return <View><Text style={styles.brand}>GTECH PRIME</Text><Text style={styles.tagline}>ORÇAMENTO MOBILE</Text></View>; }
export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) { return <View style={[styles.card, style]}>{children}</View>; }
export function PrimaryButton({ title, onPress, disabled = false }: { title: string; onPress: () => void; disabled?: boolean }) { return <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={[styles.primary, disabled && styles.disabled]}><Text style={styles.primaryText}>{title}</Text></Pressable>; }
export function SecondaryButton({ title, onPress }: { title: string; onPress: () => void }) { return <Pressable accessibilityRole="button" onPress={onPress} style={styles.secondary}><Text style={styles.secondaryText}>{title}</Text></Pressable>; }
export function Field({ label, ...props }: TextInputProps & { label: string }) { return <View style={styles.field}><Text style={styles.label}>{label}</Text><TextInput placeholderTextColor={colors.muted} style={[styles.input, props.multiline && styles.multiline]} {...props} /></View>; }
export function StatusBadge({ status }: { status: StatusOrcamento }) { const labels = { rascunho: 'Rascunho', enviado: 'Enviado', aprovado: 'Aprovado', recusado: 'Recusado' }; return <View style={[styles.badge, status === 'aprovado' && styles.success, status === 'recusado' && styles.danger, status === 'enviado' && styles.warning]}><Text style={styles.badgeText}>{labels[status]}</Text></View>; }

const styles = StyleSheet.create({
  brand: { color: colors.primary, fontSize: 20, fontWeight: '800', letterSpacing: 1.4 }, tagline: { color: colors.muted, fontSize: 10, letterSpacing: 1.8, marginTop: 2 },
  card: { backgroundColor: colors.surface, borderRadius: 14, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  primary: { backgroundColor: colors.primary, borderRadius: 10, minHeight: 50, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.md }, primaryText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secondary: { borderColor: colors.primary, borderWidth: 1, borderRadius: 10, minHeight: 46, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.md }, secondaryText: { color: colors.primary, fontWeight: '700' }, disabled: { opacity: .5 },
  field: { marginBottom: spacing.md }, label: { color: colors.text, fontWeight: '600', marginBottom: 6 }, input: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, borderRadius: 9, minHeight: 46, paddingHorizontal: 12, color: colors.text, fontSize: 16 }, multiline: { minHeight: 96, paddingTop: 12, textAlignVertical: 'top' },
  badge: { alignSelf: 'flex-start', backgroundColor: '#E5EAF0', borderRadius: 20, paddingHorizontal: 9, paddingVertical: 4 }, badgeText: { color: colors.muted, fontSize: 12, fontWeight: '700' }, success: { backgroundColor: '#D9F3E4' }, warning: { backgroundColor: '#FFF0CE' }, danger: { backgroundColor: '#FBE1DF' },
});

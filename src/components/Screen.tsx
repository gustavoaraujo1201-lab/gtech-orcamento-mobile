import { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, ScrollViewProps, StyleSheet } from 'react-native';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme';

type ScreenProps = {
  children: ReactNode;
  /**
   * true para telas de formulário (o conteúdo vira rolável e reage ao teclado).
   * false para telas que já controlam sua própria rolagem (ex.: FlatList),
   * onde só precisamos da Safe Area.
   */
  scroll?: boolean;
  contentContainerStyle?: ScrollViewProps['contentContainerStyle'];
  edges?: Edge[];
  /**
   * Cabeçalho fixo (não rola com o conteúdo), renderizado dentro da Safe Area.
   * Use para substituir o header nativo quando ele precisar do mesmo
   * comportamento de Safe Area do restante da tela (ex.: telas com notch).
   */
  header?: ReactNode;
};

const DEFAULT_EDGES: Edge[] = ['top', 'left', 'right'];

/**
 * Padroniza duas coisas em todas as telas:
 * 1) Safe Area real no Android (SafeAreaView da lib react-native-safe-area-context,
 *    diferente do SafeAreaView do núcleo do React Native, que só funciona no iOS).
 * 2) Comportamento de teclado: quando `scroll` é true, o conteúdo fica dentro de um
 *    ScrollView que se ajusta ao teclado, permitindo rolar até o último campo/botão.
 */
export function Screen({ children, scroll = false, contentContainerStyle, edges = DEFAULT_EDGES, header }: ScreenProps) {
  if (!scroll) {
    return (
      <SafeAreaView style={styles.page} edges={edges}>
        {header}
        {children}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.page} edges={edges}>
      {header}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  // paddingBottom generoso garante espaço para o último campo e o botão
  // ficarem visíveis acima do teclado, mesmo em telas menores.
  scrollContent: { flexGrow: 1, padding: spacing.md, paddingBottom: spacing.xl * 2 },
});

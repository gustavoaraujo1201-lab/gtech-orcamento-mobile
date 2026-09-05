import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { Brand, Field, PrimaryButton } from '../components/ui';
import { useAuth } from '../auth/AuthProvider';
import { colors, spacing } from '../theme';

export function LoginScreen() {
  const { entrar, recuperarSenha } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');

  async function handleEntrar() {
    if (enviando) return;
    if (!email.trim() || !senha) {
      setErro('Informe e-mail e senha.');
      return;
    }
    setErro('');
    setMensagem('');
    setEnviando(true);
    const resultado = await entrar(email, senha);
    setEnviando(false);
    if (resultado.erro) setErro(resultado.erro);
  }

  async function handleEsqueciSenha() {
    if (enviando) return;
    if (!email.trim()) {
      setErro('Informe seu e-mail para receber o link de recuperação.');
      return;
    }
    setErro('');
    setMensagem('');
    setEnviando(true);
    const resultado = await recuperarSenha(email);
    setEnviando(false);
    if (resultado.erro) setErro(resultado.erro);
    else setMensagem('Enviamos um link de recuperação para o seu e-mail.');
  }

  return (
    <Screen scroll contentContainerStyle={styles.content}>
      <View style={styles.brandArea}>
        <Brand />
      </View>
      <Field label="E-mail" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" editable={!enviando} />
      <Field label="Senha" value={senha} onChangeText={setSenha} secureTextEntry editable={!enviando} />
      {erro ? <Text style={styles.erro}>{erro}</Text> : null}
      {mensagem ? <Text style={styles.mensagem}>{mensagem}</Text> : null}
      <PrimaryButton title={enviando ? 'Entrando...' : 'Entrar'} onPress={handleEntrar} disabled={enviando} />
      {enviando && <ActivityIndicator color={colors.primary} style={styles.spinner} />}
      <Text accessibilityRole="button" onPress={handleEsqueciSenha} style={styles.link}>Esqueci minha senha</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, flexGrow: 1, justifyContent: 'center' },
  brandArea: { alignItems: 'center', marginBottom: spacing.xl },
  erro: { color: colors.danger, textAlign: 'center', marginBottom: spacing.sm },
  mensagem: { color: colors.success, textAlign: 'center', marginBottom: spacing.sm },
  spinner: { marginTop: spacing.sm },
  link: { color: colors.primary, textAlign: 'center', marginTop: spacing.lg, fontWeight: '600' },
});

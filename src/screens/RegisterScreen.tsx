import { useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen } from '../components/Screen';
import { Brand, Field, PrimaryButton } from '../components/ui';
import { useAuth } from '../auth/AuthProvider';
import { colors, spacing } from '../theme';

export function RegisterScreen() {
  // TODO: troque "any" pelo tipo real da sua stack de navegação
  // (ex.: NativeStackNavigationProp<RootStackParamList, 'Register'>)
  // assim que ela estiver definida, para ter autocomplete e checagem de tipos.
  const navigation = useNavigation<any>();
  const { cadastrar } = useAuth();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');

  async function handleCadastrar() {
    if (enviando) return;

    if (!nome.trim() || !email.trim() || !senha) {
      setErro('Preencha nome, e-mail e senha.');
      return;
    }
    if (senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (senha !== confirmarSenha) {
      setErro('As senhas não conferem.');
      return;
    }

    setErro('');
    setMensagem('');
    setEnviando(true);
    const resultado = await cadastrar(nome, email, senha);
    setEnviando(false);

    if (resultado.erro) {
      setErro(resultado.erro);
      return;
    }
    if (resultado.precisaConfirmarEmail) {
      setMensagem('Cadastro realizado! Confirme seu e-mail antes de entrar.');
      return;
    }
    // Se o projeto Supabase não exige confirmação de e-mail, o usuário já
    // fica autenticado aqui, e o AuthProvider troca a tela sozinho.
  }

  return (
    <Screen scroll contentContainerStyle={styles.content}>
      <View style={styles.brandArea}>
        <Image source={require('../../assets/images/logo/gtech-prime-logo.png')} style={styles.logo} resizeMode="contain" />
        <Brand />
      </View>
      <Field label="Nome" value={nome} onChangeText={setNome} autoCapitalize="words" editable={!enviando} />
      <Field label="E-mail" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" editable={!enviando} />
      <Field label="Senha" value={senha} onChangeText={setSenha} secureTextEntry editable={!enviando} />
      <Field label="Confirmar senha" value={confirmarSenha} onChangeText={setConfirmarSenha} secureTextEntry editable={!enviando} />
      {erro ? <Text style={styles.erro}>{erro}</Text> : null}
      {mensagem ? <Text style={styles.mensagem}>{mensagem}</Text> : null}
      <PrimaryButton title={enviando ? 'Cadastrando...' : 'Criar conta'} onPress={handleCadastrar} disabled={enviando} />
      {enviando && <ActivityIndicator color={colors.primary} style={styles.spinner} />}
      <Text accessibilityRole="button" onPress={() => navigation.goBack()} style={styles.link}>Já tenho conta, entrar</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, flexGrow: 1, justifyContent: 'center' },
  brandArea: { alignItems: 'center', marginBottom: spacing.xl },
  logo: { width: 96, height: 96, marginBottom: spacing.sm },
  erro: { color: colors.danger, textAlign: 'center', marginBottom: spacing.sm },
  mensagem: { color: colors.success, textAlign: 'center', marginBottom: spacing.sm },
  spinner: { marginTop: spacing.sm },
  link: { color: colors.primary, textAlign: 'center', marginTop: spacing.lg, fontWeight: '600' },
});

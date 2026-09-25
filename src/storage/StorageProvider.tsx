import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { empresaPadrao } from '../constants/defaults';
import { Empresa, Orcamento } from '../types/orcamento';
import { useAuth } from '../auth/AuthProvider';
import { salvarOrcamentoWeb, excluirOrcamentoWeb } from '../services/orcamentosSyncService';

const ORCAMENTOS_PREFIXO = '@gtech/orcamentos';
const EMPRESA_PREFIXO = '@gtech/empresa';

type ResultadoSalvarOrcamento = { orcamento?: Orcamento; erro?: string };
type ResultadoExcluirOrcamento = { erro?: string };

type StorageContextValue = {
  orcamentos: Orcamento[];
  empresa: Empresa;
  carregando: boolean;
  salvarOrcamento: (orcamento: Orcamento) => Promise<ResultadoSalvarOrcamento>;
  excluirOrcamento: (orcamento: Orcamento) => Promise<ResultadoExcluirOrcamento>;
  salvarEmpresa: (empresa: Empresa) => Promise<void>;
};

const StorageContext = createContext<StorageContextValue | null>(null);

export function StorageProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  // Cada usuário precisa da sua própria "gaveta" no armazenamento do
  // aparelho. Sem isso, o cache de um usuário vaza para o próximo que
  // logar no mesmo dispositivo (foi exatamente o bug que encontramos).
  const usuarioId = session?.user?.id ?? 'sem-sessao';
  const ORCAMENTOS_KEY = useMemo(() => `${ORCAMENTOS_PREFIXO}:${usuarioId}`, [usuarioId]);
  const EMPRESA_KEY = useMemo(() => `${EMPRESA_PREFIXO}:${usuarioId}`, [usuarioId]);

  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [empresa, setEmpresa] = useState<Empresa>(empresaPadrao);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => { carregar(); }, [usuarioId]);
  async function carregar() {
    setCarregando(true);
    // Zera o estado em memória antes de carregar: evita mostrar por um
    // instante os dados do usuário anterior enquanto o AsyncStorage responde.
    setOrcamentos([]);
    setEmpresa(empresaPadrao);
    try {
      const [orcamentosSalvos, empresaSalva] = await Promise.all([AsyncStorage.getItem(ORCAMENTOS_KEY), AsyncStorage.getItem(EMPRESA_KEY)]);
      if (orcamentosSalvos) setOrcamentos(JSON.parse(orcamentosSalvos));
      if (empresaSalva) setEmpresa({ ...empresaPadrao, ...JSON.parse(empresaSalva) });
    } finally { setCarregando(false); }
  }

  const salvarOrcamento = useCallback(async (orcamento: Orcamento): Promise<ResultadoSalvarOrcamento> => {
    const resultado = await salvarOrcamentoWeb(orcamento);
    if (resultado.erro || !resultado.orcamento) {
      // Não salva localmente como se tivesse dado certo: assim o usuário
      // sabe que precisa tentar de novo, em vez de achar que já sincronizou.
      return { erro: resultado.erro ?? 'Não foi possível salvar o orçamento.' };
    }
    const final = resultado.orcamento;
    setOrcamentos((atuais) => {
      // Remove tanto o id "rascunho" antigo (1ª sincronização, quando o id
      // muda) quanto uma cópia antiga com o id final, se já existir.
      const semAntigos = atuais.filter((atual) => atual.id !== orcamento.id && atual.id !== final.id);
      const atualizados = [final, ...semAntigos];
      AsyncStorage.setItem(ORCAMENTOS_KEY, JSON.stringify(atualizados));
      return atualizados;
    });
    return { orcamento: final };
  }, [ORCAMENTOS_KEY]);

  const excluirOrcamento = useCallback(async (orcamento: Orcamento): Promise<ResultadoExcluirOrcamento> => {
    const resultado = await excluirOrcamentoWeb(orcamento);
    if (resultado.erro) return resultado;
    setOrcamentos((atuais) => {
      const atualizados = atuais.filter((atual) => atual.id !== orcamento.id);
      AsyncStorage.setItem(ORCAMENTOS_KEY, JSON.stringify(atualizados));
      return atualizados;
    });
    return {};
  }, [ORCAMENTOS_KEY]);

  const salvarEmpresa = useCallback(async (dados: Empresa) => {
    setEmpresa(dados);
    await AsyncStorage.setItem(EMPRESA_KEY, JSON.stringify(dados));
  }, [EMPRESA_KEY]);

  return <StorageContext.Provider value={{ orcamentos, empresa, carregando, salvarOrcamento, excluirOrcamento, salvarEmpresa }}>{children}</StorageContext.Provider>;
}

export function useStorage() {
  const context = useContext(StorageContext);
  if (!context) throw new Error('useStorage deve ser usado dentro de StorageProvider');
  return context;
}

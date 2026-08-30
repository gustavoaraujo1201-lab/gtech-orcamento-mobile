import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { empresaPadrao } from '../constants/defaults';
import { Empresa, Orcamento } from '../types/orcamento';

const ORCAMENTOS_KEY = '@gtech/orcamentos';
const EMPRESA_KEY = '@gtech/empresa';

type StorageContextValue = {
  orcamentos: Orcamento[];
  empresa: Empresa;
  carregando: boolean;
  salvarOrcamento: (orcamento: Orcamento) => Promise<void>;
  excluirOrcamento: (id: string) => Promise<void>;
  salvarEmpresa: (empresa: Empresa) => Promise<void>;
};

const StorageContext = createContext<StorageContextValue | null>(null);

export function StorageProvider({ children }: { children: ReactNode }) {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [empresa, setEmpresa] = useState<Empresa>(empresaPadrao);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => { carregar(); }, []);
  async function carregar() {
    try {
      const [orcamentosSalvos, empresaSalva] = await Promise.all([AsyncStorage.getItem(ORCAMENTOS_KEY), AsyncStorage.getItem(EMPRESA_KEY)]);
      if (orcamentosSalvos) setOrcamentos(JSON.parse(orcamentosSalvos));
      if (empresaSalva) setEmpresa({ ...empresaPadrao, ...JSON.parse(empresaSalva) });
    } finally { setCarregando(false); }
  }

  const salvarOrcamento = useCallback(async (orcamento: Orcamento) => {
    setOrcamentos((atuais) => {
      const existe = atuais.some((atual) => atual.id === orcamento.id);
      const atualizados = existe ? atuais.map((atual) => atual.id === orcamento.id ? orcamento : atual) : [orcamento, ...atuais];
      AsyncStorage.setItem(ORCAMENTOS_KEY, JSON.stringify(atualizados));
      return atualizados;
    });
  }, []);

  const excluirOrcamento = useCallback(async (id: string) => {
    setOrcamentos((atuais) => {
      const atualizados = atuais.filter((orcamento) => orcamento.id !== id);
      AsyncStorage.setItem(ORCAMENTOS_KEY, JSON.stringify(atualizados));
      return atualizados;
    });
  }, []);

  const salvarEmpresa = useCallback(async (dados: Empresa) => {
    setEmpresa(dados);
    await AsyncStorage.setItem(EMPRESA_KEY, JSON.stringify(dados));
  }, []);

  return <StorageContext.Provider value={{ orcamentos, empresa, carregando, salvarOrcamento, excluirOrcamento, salvarEmpresa }}>{children}</StorageContext.Provider>;
}

export function useStorage() {
  const context = useContext(StorageContext);
  if (!context) throw new Error('useStorage deve ser usado dentro de StorageProvider');
  return context;
}

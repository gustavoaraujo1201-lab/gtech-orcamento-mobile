# Gtech Orçamento Mobile

Aplicativo mobile offline-first para criar, salvar, consultar, gerar e compartilhar orçamentos profissionais da Gtech Prime.

## Decisão técnica

O projeto usa **Expo com React Native e TypeScript**. É a escolha mais direta para este produto: mantém Android e iOS no mesmo código, simplifica builds e oferece APIs estáveis para PDF (`expo-print`), compartilhamento nativo (`expo-sharing`) e arquivos (`expo-file-system`). O armazenamento local usa AsyncStorage, portanto criar, editar, consultar e gerar PDF não dependem de servidor ou internet após a instalação.

## Tecnologias

- React Native + Expo: aplicativo mobile.
- TypeScript: tipos simples para reduzir erros.
- React Navigation: navegação entre telas.
- AsyncStorage: orçamentos e dados da empresa no dispositivo.
- expo-print: PDF profissional criado a partir de HTML local.
- expo-sharing: abre o compartilhamento nativo. O usuário escolhe WhatsApp, e-mail, Drive etc.

## Estrutura

```text
assets/images/logo/     logo oficial (placeholder explicado no local)
assets/images/icon/     ícone do app (placeholder explicado no local)
src/components/         peças reutilizáveis da interface
src/screens/            telas do aplicativo
src/navigation/         fluxo entre as telas
src/services/           PDF e compartilhamento
src/storage/            persistência local
src/utils/              cálculos, validação e formatação
src/theme/              cores e espaçamentos centralizados
src/types/              modelo de dados simples
```

## Como executar

Requer Node.js 20+ e npm.

```bash
cd gtech-orcamento-mobile
npm install
npx expo start
```

Use o aplicativo Expo Go em um Android para testar rapidamente, ou pressione `a` com emulador Android configurado. Para conferir os testes e tipos:

```bash
npm test
npm run typecheck
```

## Gerar Android APK

Para gerar builds distribuíveis, instale e autentique o EAS CLI na sua conta Expo:

```bash
npm install -g eas-cli
eas login
eas build --platform android --profile preview
```

O perfil `preview` em `eas.json` produz APK para instalação direta; o perfil `production` mantém o formato padrão para publicação. Para desenvolvimento local por emulador/APK, instale Android Studio, Android SDK e um JDK compatível e execute `npx expo run:android`. Estes componentes não estavam instalados no ambiente de criação deste projeto.

## Logo e identidade

Coloque a logo oficial em `assets/images/logo/logo.png` e o ícone quadrado em `assets/images/icon/app-icon.png`. Os dois diretórios incluem instruções. Enquanto a logo não existir, o app usa uma marca textual neutra **GTECH PRIME**, sem inventar uma identidade visual.

As cores ficam em `src/theme/index.ts`; alterá-las muda o visual de forma centralizada. Para aplicar a logo raster no cabeçalho/PDF, adicione o arquivo e atualize somente o componente `Brand` e o trecho de cabeçalho em `src/services/pdfService.ts`.

## PDF e WhatsApp

Em **Detalhes do orçamento**, toque em **Compartilhar orçamento / WhatsApp**. O PDF é criado localmente como `Gtech_Prime_Orcamento_ORC-000123.pdf` e abre a tela nativa de compartilhamento. Escolha WhatsApp e depois o contato. O app não automatiza nem controla o WhatsApp e não utiliza APIs não oficiais.

O PDF traz dados configuráveis da empresa, cliente, itens, totais, observações e o rodapé obrigatório “Sistema desenvolvido por Gtech Prime”.

## Limitações atuais e evolução

- A logo final ainda precisa ser fornecida e adicionada nos locais indicados.
- Sem Android SDK/JDK neste computador, não foi possível executar em emulador ou gerar APK localmente.
- Os dados ficam apenas no dispositivo; backup, login, sincronização, clientes/produtos cadastrados e integração WhatsApp Business são extensões futuras, deliberadamente fora do escopo atual.

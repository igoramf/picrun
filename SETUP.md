# Setup Local - PicRun

## Pre-requisitos

- Node.js 18+
- npm ou yarn
- Celular Android com USB debugging habilitado (ou conta EAS)
- Conta Mapbox (gratis)

## 1. Configurar Mapbox

1. Crie conta em https://www.mapbox.com
2. Acesse Account > Tokens
3. Copie o "Default public token" (começa com `pk.`)
4. Crie o arquivo `.env`:

```bash
cp .env.example .env
```

5. Cole o token no `.env`:

```
EXPO_PUBLIC_MAPBOX_TOKEN=pk.seu_token_aqui
```

6. No `app.json`, substitua `SEU_TOKEN_MAPBOX_AQUI` pelo seu token secreto (começa com `sk.`):
   - Acesse Mapbox > Account > Tokens
   - Crie um novo token com scope `DOWNLOADS:READ`
   - Use esse token no `app.json` em `RNMapboxMapsDownloadToken`

## 2. Instalar dependencias

```bash
npm install
```

## 3. Rodar localmente

### Opcao A: Com celular Android via USB (Recomendado)

1. Habilite "USB Debugging" no celular:
   - Configurações > Sobre o telefone > Toque 7x em "Número da versão"
   - Configurações > Opções do desenvolvedor > Depuração USB

2. Conecte o celular via USB

3. Rode o build de desenvolvimento:

```bash
npx expo run:android
```

Isso vai:
- Compilar o app nativo (~5-10 min na primeira vez)
- Instalar no celular
- Iniciar o servidor de desenvolvimento

4. Apos o build inicial, use:

```bash
npx expo start --dev-client
```

### Opcao B: Com EAS Build (sem fio)

1. Instale o EAS CLI:

```bash
npm install -g eas-cli
```

2. Faca login:

```bash
eas login
```

3. Configure o projeto:

```bash
eas build:configure
```

4. Crie o build de desenvolvimento:

```bash
eas build --profile development --platform android
```

5. Quando terminar (~15 min), baixe o APK e instale no celular

6. Rode o servidor:

```bash
npx expo start --dev-client
```

7. Escaneie o QR code com o app instalado

### Opcao C: Emulador Android Studio (sem GPS real)

1. Instale o Android Studio
2. Crie um emulador (AVD Manager)
3. Rode:

```bash
npx expo run:android
```

**Nota:** GPS no emulador é simulado. Use as opções A ou B para testar GPS real.

## 4. Desenvolvimento

Apos o setup inicial, o fluxo é:

```bash
# Inicia servidor de desenvolvimento
npx expo start --dev-client

# O app no celular conecta automaticamente
# Hot reload funciona - edite e veja as mudanças
```

## Estrutura do Projeto

```
picrun/
├── app/                    # Telas (expo-router)
│   ├── (tabs)/             # Telas com tab bar
│   │   ├── index.tsx       # Home (mapa)
│   │   └── profile.tsx     # Perfil
│   ├── _layout.tsx         # Layout raiz
│   └── run.tsx             # Tela de corrida ativa
├── src/
│   ├── components/         # Componentes reutilizaveis
│   ├── services/           # GPS, API, etc
│   ├── utils/              # Funcoes utilitarias
│   ├── types/              # TypeScript types
│   └── constants/          # Cores, configs
├── app.json                # Config do Expo
└── package.json
```

## Comandos Uteis

```bash
# Rodar no Android
npx expo run:android

# Rodar no iOS (precisa de Mac)
npx expo run:ios

# Iniciar servidor dev
npx expo start --dev-client

# Limpar cache
npx expo start --clear

# Ver logs do dispositivo
npx react-native log-android

# Build de producao
eas build --platform android
```

## Troubleshooting

### "Mapbox token not found"
- Verifique se o `.env` existe e tem o token
- Reinicie o servidor com `npx expo start --clear`

### "Location permission denied"
- Va em Configurações > Apps > PicRun > Permissões > Localização
- Selecione "Permitir o tempo todo"

### Build demora muito
- Primeira vez é normal (~10 min local, ~15 min EAS)
- Builds seguintes são mais rápidos

### GPS impreciso
- Teste ao ar livre
- Aguarde alguns segundos para o GPS "esquentar"

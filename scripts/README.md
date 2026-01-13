# Simulando Corrida no Emulador Android

## Como funciona

O emulador Android permite simular rotas GPS usando arquivos GPX. Isso permite testar o app sem precisar correr de verdade.

## Passos para simular uma corrida

### 1. Criar arquivo GPX

Crie um arquivo `.gpx` com a rota desejada. Exemplo de estrutura:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Stride App">
  <trk>
    <name>Corrida Teste</name>
    <trkseg>
      <trkpt lat="-7.2200" lon="-35.8820"><time>2024-01-01T08:00:00Z</time></trkpt>
      <trkpt lat="-7.2195" lon="-35.8820"><time>2024-01-01T08:00:10Z</time></trkpt>
      <!-- mais pontos... -->
    </trkseg>
  </trk>
</gpx>
```

**Dica:** Use o Google Maps para pegar coordenadas. Clique com botão direito em um ponto e copie as coordenadas.

### 2. Carregar GPX no Emulador

1. Abra o emulador Android
2. Clique nos **3 pontinhos** (Extended Controls) no painel lateral
3. Vá em **Location**
4. Clique na aba **Routes**
5. Clique em **Load GPX/KML** e selecione seu arquivo
6. Ajuste a **velocidade de playback** (1x, 2x, etc.)
7. Clique em **Play route**

### 3. Testar no App

1. Com a rota rodando no emulador, abra o app Stride
2. Clique em **INICIAR CORRIDA**
3. O app vai rastrear a rota simulada
4. Quando a rota completar o circuito, clique em **FINALIZAR**
5. Se a rota fechou um circuito, o território será conquistado!

## Criando rotas que conquistam território

Para conquistar um território, a rota precisa **fechar um circuito** - ou seja, voltar próximo ao ponto inicial (menos de 50m de distância).

Exemplo de rota que conquista território:
```
    ┌──────────────┐
    │              │
    │   TERRITÓRIO │  ← Área interna será conquistada
    │              │
    └──────────────┘
    ↑ início/fim (mesmo ponto ou próximo)
```

## Coordenadas úteis (Campina Grande, PB)

Para criar rotas próximas à Rua Riachelo 847:

- **Centro aproximado:** -7.2172, -35.8811
- Use o Google Maps para pegar coordenadas exatas das ruas

## Ferramentas úteis

- [Google Maps](https://maps.google.com) - Clique direito para copiar coordenadas
- [GPX Editor](https://gpx.studio/) - Editor visual de rotas GPX
- [OpenStreetMap](https://www.openstreetmap.org) - Mapa alternativo

## Velocidade recomendada

- **Corrida normal:** ~3-4 m/s (10-15 km/h)
- **No emulador:** Use playback 2x ou 4x para acelerar o teste

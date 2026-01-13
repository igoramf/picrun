// Polyfill DEVE ser carregado primeiro (antes de qualquer outro módulo)
require('./src/utils/textEncodingPolyfill');

// Agora carrega o entry point do Expo Router
require('expo-router/entry');

// Polyfill para TextDecoder com suporte a utf-16le (necessário para h3-js no React Native/Hermes)
// Usa @borewit/text-codec que tem suporte completo a utf-16le
const { TextDecoder, TextEncoder } = require('@borewit/text-codec');

// Sempre substitui para garantir suporte a utf-16le
globalThis.TextDecoder = TextDecoder;
globalThis.TextEncoder = TextEncoder;

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { COLORS } from '../src/constants';
import { Button } from '../src/components/Button';
import { useAuth } from '../src/contexts/AuthContext';

type AuthMode = 'login' | 'register';

export default function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!email || !password) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    if (mode === 'register' && !username) {
      Alert.alert('Erro', 'Preencha o nome de usuário');
      return;
    }

    if (mode === 'register' && username.length < 3) {
      Alert.alert('Erro', 'Nome de usuário deve ter pelo menos 3 caracteres');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Erro', 'Senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        await signIn(email, password);
      } else {
        await signUp(email, username, password);
      }
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert(
        'Erro',
        error instanceof Error ? error.message : 'Erro ao fazer login'
      );
    } finally {
      setLoading(false);
    }
  }

  function toggleMode() {
    setMode(mode === 'login' ? 'register' : 'login');
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <View style={styles.header}>
          <Text style={styles.logo}>STRIDE</Text>
          <Text style={styles.subtitle}>Conquiste seu território</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.title}>
            {mode === 'login' ? 'Entrar' : 'Criar conta'}
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={COLORS.textDark}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          {mode === 'register' && (
            <TextInput
              style={styles.input}
              placeholder="Nome de usuário"
              placeholderTextColor={COLORS.textDark}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />
          )}

          <TextInput
            style={styles.input}
            placeholder="Senha"
            placeholderTextColor={COLORS.textDark}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Button
            title={mode === 'login' ? 'ENTRAR' : 'CRIAR CONTA'}
            onPress={handleSubmit}
            loading={loading}
            size="large"
          />

          <TouchableOpacity onPress={toggleMode} style={styles.toggleButton}>
            <Text style={styles.toggleText}>
              {mode === 'login'
                ? 'Não tem conta? Criar agora'
                : 'Já tem conta? Entrar'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.primary,
    letterSpacing: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textMuted,
    marginTop: 8,
  },
  form: {
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  toggleButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  toggleText: {
    color: COLORS.primary,
    fontSize: 14,
  },
});

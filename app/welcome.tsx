import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../src/constants';

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../assets/welcome-bg.png')}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <SafeAreaView style={styles.content} edges={['bottom']}>
            <View style={styles.textContainer}>
              <Text style={styles.title}>Correr não</Text>
              <Text style={styles.title}>precisa ser</Text>
              <Text style={styles.title}>chato!</Text>
            </View>

            <View style={styles.buttons}>
              <TouchableOpacity
                style={styles.registerButton}
                onPress={() => router.push({ pathname: '/auth', params: { mode: 'register' } })}
              >
                <Text style={styles.registerButtonText}>Cadastre-se</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.loginButton}
                onPress={() => router.push({ pathname: '/auth', params: { mode: 'login' } })}
              >
                <Text style={styles.loginButtonText}>Log In</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  textContainer: {
    marginBottom: 40,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: COLORS.textWhite,
    lineHeight: 50,
  },
  buttons: {
    gap: 16,
  },
  registerButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  registerButtonText: {
    color: COLORS.textWhite,
    fontSize: 18,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.textWhite,
    alignItems: 'center',
  },
  loginButtonText: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: '600',
  },
});

import { useState, useCallback } from 'react';
import { StyleSheet, View, TextInput, Pressable, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'react-native';
import { supabase } from '@/utils/supabaseClient';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import ChelonHeader from '@/components/chelon-header';
import { Spacing } from '@/constants/theme';
import { Colors } from '@/constants/theme';

export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const colorScheme = useColorScheme() === 'dark' ? 'dark' : 'light';

  const handleSignIn = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      // Sign-in successful - router will redirect based on auth state
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.message || 'Sign-in failed');
    } finally {
      setLoading(false);
    }
  }, [email, password, router]);

  const handleSignUpPress = () => {
    router.push('/auth/sign-up');
  };

  if (loading) {
    return (
      <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ThemedText>Signing in...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.formContainer}>
        <ThemedText style={styles.title}>Sign In</ThemedText>
        <ThemedText style={styles.subtitle}>Welcome back to Chelon</ThemedText>

        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={[styles.input, { color: Colors[colorScheme].text }]}
          placeholderTextColor={Colors[colorScheme].textSecondary}
          autoCapitalize="none"
          keyboardType="email-address"
          returnKeyType="next"
        />

        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          style={[styles.input, { color: Colors[colorScheme].text }]}
          placeholderTextColor={Colors[colorScheme].textSecondary}
          secureTextEntry
          returnKeyType="go"
        />

        {error && (
          <ThemedText style={styles.error}>{error}</ThemedText>
        )}

        <Pressable onPress={handleSignIn} style={styles.button}>
          <ThemedText style={styles.buttonText}>Sign In</ThemedText>
        </Pressable>

        <ThemedText style={styles.dividerText}>Or</ThemedText>

        <Pressable onPress={handleSignUpPress} style={styles.linkButton}>
          <ThemedText style={styles.linkText}>Create Account</ThemedText>
        </Pressable>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    marginBottom: Spacing.half,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: Spacing.three,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: Spacing.two,
    marginBottom: Spacing.two,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#245C42',
    borderRadius: 8,
    paddingVertical: Spacing.two,
    marginTop: Spacing.two,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600' as const,
  },
  dividerText: {
    textAlign: 'center',
    marginVertical: Spacing.two,
    color: '#666',
  },
  linkButton: {
    paddingVertical: Spacing.one,
  },
  linkText: {
    color: '#245C42',
    fontWeight: '600' as const,
    textAlign: 'center',
  },
  error: {
    color: '#FF0000',
    marginBottom: Spacing.two,
    textAlign: 'center',
  },
});
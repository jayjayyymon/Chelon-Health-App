import { useState, useCallback } from 'react';
import { StyleSheet, View, TextInput, Pressable, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'react-native';
import { supabase } from '@/utils/supabaseClient';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import ChelonHeader from '@/components/chelon-header';
import { Spacing } from '@/constants/theme';

export default function SignUpScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const colorScheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const mutedInk = colorScheme === 'dark' ? '#c1d4ca' : '#607b70';

  const handleSignUp = useCallback(async () => {
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;

      // Check if email confirmation is required
      if (data.user) {
        if (data.user.email_confirmed_at) {
          // Email is automatically confirmed
          router.replace('/(tabs)');
        } else {
          // Email confirmation required
          router.push('/auth/email-confirmation');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Sign-up failed');
    } finally {
      setLoading(false);
    }
  }, [email, password, confirmPassword, router]);

  const handleSignInPress = () => {
    router.push('/auth/sign-in');
  };

  if (loading) {
    return (
      <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ThemedText>Creating account...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.formContainer}>
        <ThemedText style={styles.title}>Create Account</ThemedText>
        <ThemedText style={styles.subtitle}>Join Chelon today</ThemedText>

        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          placeholderTextColor={mutedInk}
          autoCapitalize="none"
          keyboardType="email-address"
          returnKeyType="next"
        />

        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          placeholderTextColor={mutedInk}
          secureTextEntry
          returnKeyType="next"
        />

        <TextInput
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          style={styles.input}
          placeholderTextColor={mutedInk}
          secureTextEntry
          returnKeyType="go"
        />

        {error && (
          <ThemedText style={styles.error}>{error}</ThemedText>
        )}

        <Pressable onPress={handleSignUp} style={styles.button}>
          <ThemedText style={styles.buttonText}>Sign Up</ThemedText>
        </Pressable>

        <ThemedText style={styles.dividerText}>Already have an account?</ThemedText>

        <Pressable onPress={handleSignInPress} style={styles.linkButton}>
          <ThemedText style={styles.linkText}>Sign In</ThemedText>
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
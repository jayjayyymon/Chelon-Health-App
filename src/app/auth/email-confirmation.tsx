import { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, TextInput, Pressable, Text, ActivityIndicator } from 'react-native';
import { useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/utils/supabaseClient';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import ChelonHeader from '@/components/chelon-header';
import { Spacing } from '@/constants/theme';

export default function EmailConfirmationScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const colorScheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const mutedInk = colorScheme === 'dark' ? '#c1d4ca' : '#607b70';

  // Get email from URL params or session
  useEffect(() => {
    // In a real implementation, you might get this from session or params
    // For now, we'll leave it blank and user can enter it
  }, []);

  const handleConfirm = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { error: confirmError } = await supabase.auth.verifyOtp({
        email,
        token: '', // This would come from the email in a real implementation
        type: 'email',
      });

      if (confirmError) throw confirmError;

      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.message || 'Email confirmation failed');
    } finally {
      setLoading(false);
    }
  }, [email, router]);

  const handleResend = useCallback(async () => {
    setResending(true);
    setError(null);

    try {
      const { data, error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (resendError) throw resendError;

      // Show success message
      setError('Confirmation email resent!');
    } catch (err: any) {
      setError(err.message || 'Failed to resend confirmation');
    } finally {
      setResending(false);
    }
  }, [email]);

  if (loading) {
    return (
      <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#245C42" />
        <ThemedText style={{ marginTop: Spacing.two }}>Sending confirmation...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.formContainer}>
        <ThemedText style={styles.title}>Confirm Your Email</ThemedText>
        <ThemedText style={styles.subtitle}>
          Please check your email for a confirmation link to complete your sign-up.
        </ThemedText>

        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          placeholderTextColor={mutedInk}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        {error && (
          <ThemedText style={styles.error}>{error}</ThemedText>
        )}

        <Pressable onPress={handleConfirm} style={styles.button}>
          <ThemedText style={styles.buttonText}>Confirm Email</ThemedText>
        </Pressable>

        {!resending && (
          <Pressable onPress={handleResend} style={styles.linkButton}>
            <ThemedText style={styles.linkText}>Resend Confirmation Email</ThemedText>
          </Pressable>
        )}

        {resending && (
          <ThemedText style={styles.linkText}>Resending...</ThemedText>
        )}

        <ThemedText style={styles.dividerText}>
          Didn't receive the email? Check your spam folder.
        </ThemedText>
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
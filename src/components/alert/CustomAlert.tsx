import { Pressable, Modal, View, StyleSheet, ActivityIndicator, TouchableWithoutFeedback } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

type AlertType = 'success' | 'information' | 'warning' | 'error' | 'confirmation' | 'destructiveConfirmation';

type CustomAlertProps = {
  visible: boolean;
  onRequestClose: () => void;
  title: string;
  message: string;
  type?: AlertType;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
};

export function CustomAlert({
  visible,
  onRequestClose,
  title,
  message,
  type = 'information',
  onConfirm,
  onCancel,
  confirmText = 'OK',
  cancelText = 'Cancel',
  isLoading = false,
}: CustomAlertProps) {
  const theme = useTheme();

  // Get colors based on alert type
  const getAlertColors = () => {
    switch (type) {
      case 'success':
        return {
          background: theme.backgroundElement,
          border: '#4ca771',
          iconColor: '#4ca771',
          text: theme.text,
        };
      case 'error':
        return {
          background: theme.backgroundElement,
          border: '#b3261e',
          iconColor: '#b3261e',
          text: theme.text,
        };
      case 'warning':
        return {
          background: theme.backgroundElement,
          border: '#ff8422',
          iconColor: '#ff8422',
          text: theme.text,
        };
      case 'information':
        return {
          background: theme.backgroundElement,
          border: theme.textSecondary,
          iconColor: theme.textSecondary,
          text: theme.text,
        };
      case 'confirmation':
        return {
          background: theme.backgroundElement,
          border: '#4ca771',
          iconColor: '#4ca771',
          text: theme.text,
        };
      case 'destructiveConfirmation':
        return {
          background: theme.backgroundElement,
          border: '#b3261e',
          iconColor: '#b3261e',
          text: theme.text,
        };
      default:
        return {
          background: theme.backgroundElement,
          border: theme.textSecondary,
          iconColor: theme.textSecondary,
          text: theme.text,
        };
    }
  };

  const { background, border, iconColor, text } = getAlertColors();

  // Get icon based on alert type
  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'information':
        return 'ℹ️';
      case 'confirmation':
        return '?';
      case 'destructiveConfirmation':
        return '⚠';
      default:
        return 'ℹ️';
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal
      transparent={true}
      visible={visible}
      onRequestClose={isLoading ? () => undefined : onRequestClose}
      accessibilityViewIsModal
      animationType="fade"
    >
      <TouchableWithoutFeedback
        onPress={isLoading || type === 'confirmation' || type === 'destructiveConfirmation'
          ? undefined
          : onRequestClose}>
        <View style={styles.backdrop}>
          <View style={[styles.container, { backgroundColor: background, borderColor: border }]}>
            {/* Icon */}
            <View style={styles.iconContainer}>
              <ThemedText style={[styles.icon, { color: iconColor }]}>
                {getIcon()}
              </ThemedText>
            </View>

            {/* Title */}
            <ThemedText style={[styles.title, { color: text }]}>
              {title}
            </ThemedText>

            {/* Message */}
            <ThemedText style={[styles.message, { color: text }]}>
              {message}
            </ThemedText>

            {/* Buttons or Loading Indicator */}
            {isLoading ? (
              <ActivityIndicator size="small" color={iconColor} style={styles.loadingIndicator} />
            ) : (
              <View style={styles.buttonGroup}>
                {type === 'confirmation' || type === 'destructiveConfirmation' ? (
                  <>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={cancelText}
                      onPress={() => {
                        onCancel?.();
                        onRequestClose();
                      }}
                      style={[
                        styles.button,
                        styles.cancelButton,
                        { backgroundColor: type === 'destructiveConfirmation' ? '#b3261e' : background },
                      ]}>
                      <ThemedText style={[styles.buttonText, { color: type === 'destructiveConfirmation' ? '#ffffff' : text }]}>
                        {cancelText}
                      </ThemedText>
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={confirmText}
                      onPress={() => {
                        onConfirm?.();
                        onRequestClose();
                      }}
                      style={[
                        styles.button,
                        styles.confirmButton,
                        { backgroundColor: type === 'destructiveConfirmation' ? '#b3261e' : '#4ca771' },
                      ]}>
                      <ThemedText style={[styles.buttonText, { color: '#ffffff' }]}>
                        {confirmText}
                      </ThemedText>
                    </Pressable>
                  </>
                ) : (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="OK"
                    onPress={onRequestClose}
                    style={[
                      styles.button,
                      { backgroundColor: type === 'error' ? '#b3261e' : '#4ca771' },
                    ]}>
                    <ThemedText style={styles.buttonText}>OK</ThemedText>
                  </Pressable>
                )}
              </View>
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '80%',
    maxWidth: 300,
    padding: Spacing.three,
    borderRadius: Spacing.two,
    borderWidth: 1,
    backgroundColor: '#ffffff',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    marginBottom: Spacing.two,
  },
  icon: {
    fontSize: 24,
    lineHeight: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: Spacing.one,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: Spacing.three,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.one,
    marginHorizontal: Spacing.half,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  confirmButton: {},
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingIndicator: {
    marginVertical: Spacing.two,
  },
});
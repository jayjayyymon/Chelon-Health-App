import { useState, useCallback, type ReactElement } from 'react';
import { CustomAlert } from '@/components/alert/CustomAlert';

type AlertType = 'success' | 'information' | 'warning' | 'error' | 'confirmation' | 'destructiveConfirmation';

type UseAlertReturn = [
  boolean, // visible
  (options: AlertOptions) => void, // showAlert
  () => void, // hideAlert
  () => ReactElement | null, // AlertComponent
];

type AlertOptions = {
  title: string;
  message: string;
  type?: AlertType;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
};

export function useAlert(): UseAlertReturn {
  const [alertOptions, setAlertOptions] = useState<AlertOptions | null>(null);

  const showAlert = useCallback((options: AlertOptions) => {
    setAlertOptions(options);
  }, []);

  const hideAlert = useCallback(() => {
    setAlertOptions(null);
  }, []);

  const visible = alertOptions !== null;

  const AlertComponent = () => {
    if (!alertOptions) return null;

    return (
      <CustomAlert
        visible={visible}
        onRequestClose={hideAlert}
        title={alertOptions.title}
        message={alertOptions.message}
        type={alertOptions.type}
        onConfirm={alertOptions.onConfirm}
        onCancel={alertOptions.onCancel}
        confirmText={alertOptions.confirmText}
        cancelText={alertOptions.cancelText}
        isLoading={alertOptions.isLoading}
      />
    );
  };

  return [visible, showAlert, hideAlert, AlertComponent];
}
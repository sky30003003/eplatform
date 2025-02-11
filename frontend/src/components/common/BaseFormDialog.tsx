import { Dialog, DialogProps } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';

export interface BaseFormDialogProps extends Omit<DialogProps, 'onSubmit'> {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  successMessage: string;
  errorMessage: string;
  submitHandler: (values: any) => Promise<void>;
  children: React.ReactNode;
}

export const BaseFormDialog: React.FC<BaseFormDialogProps> = ({
  open,
  onClose,
  onSuccess,
  successMessage,
  errorMessage,
  submitHandler,
  children,
  ...dialogProps
}) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  const handleSubmit = async (values: any) => {
    try {
      await submitHandler(values);
      enqueueSnackbar(successMessage, { variant: 'success' });
      onSuccess();
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || errorMessage,
        { variant: 'error' }
      );
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      {...dialogProps}
    >
      {React.Children.map(children, child =>
        React.isValidElement(child)
          ? React.cloneElement(child, { onSubmit: handleSubmit, onCancel: onClose })
          : child
      )}
    </Dialog>
  );
}; 
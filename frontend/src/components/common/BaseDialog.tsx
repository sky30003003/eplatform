import { Dialog, DialogProps } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';

interface BaseDialogProps extends Omit<DialogProps, 'open' | 'onClose'> {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  children: React.ReactNode;
}

const BaseDialog = ({
  open,
  onClose,
  onSuccess,
  children,
  ...dialogProps
}: BaseDialogProps) => {
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const handleSuccess = () => {
    enqueueSnackbar(t('common.success'), { variant: 'success' });
    if (onSuccess) {
      onSuccess();
    }
    onClose();
  };

  const handleError = (error: any) => {
    console.error('Error:', error);
    enqueueSnackbar(
      error?.response?.data?.message || t('common.error'),
      { variant: 'error' }
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      {...dialogProps}
    >
      {children}
    </Dialog>
  );
};

export { BaseDialog };
export type { BaseDialogProps }; 
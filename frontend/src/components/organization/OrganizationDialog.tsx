import { Dialog } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { Organization } from '../../types/organization';
import { organizationService } from '../../services/organizationService';
import { OrganizationForm } from './OrganizationForm';

interface OrganizationDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  organization?: Organization;
}

export const OrganizationDialog: React.FC<OrganizationDialogProps> = ({
  open,
  onClose,
  onSuccess,
  organization,
}) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  const handleSubmit = async (values: any) => {
    try {
      if (organization) {
        await organizationService.update(organization.id, values);
        enqueueSnackbar(t('organizations.messages.updateSuccess'), { variant: 'success' });
      } else {
        await organizationService.create(values);
        enqueueSnackbar(t('organizations.messages.createSuccess'), { variant: 'success' });
      }
      onSuccess();
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || t('organizations.messages.error'),
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
    >
      <OrganizationForm
        organization={organization}
        onSubmit={handleSubmit}
        onCancel={onClose}
      />
    </Dialog>
  );
}; 
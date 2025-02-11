import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  Container,
  Typography,
  Button,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  Stack,
  Chip,
  Tooltip,
  Alert,
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  AdminPanelSettings as AdminPanelSettingsIcon 
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { organizationService } from '../../services/organizationService';
import { Organization, OrganizationStatus } from '../../types/organization';
import OrganizationForm from './OrganizationForm';
import { OrgAdminDialog } from '../../components/organization/OrgAdminDialog';
import { User } from '../../types/user';

export default function OrganizationsPage() {
  const { t } = useTranslation();
  const [openForm, setOpenForm] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [openOrgAdminDialog, setOpenOrgAdminDialog] = useState(false);
  const [orgAdmin, setOrgAdmin] = useState<User | null>(null);
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const { data: organizations, isLoading, error } = useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      try {
        const response = await organizationService.getAll();
        return response;
      } catch (error) {
        console.error('Error fetching organizations:', error);
        throw error;
      }
    },
    retry: 1,
    staleTime: 30000, // 30 secunde
    refetchOnWindowFocus: false,
  });

  const createMutation = useMutation({
    mutationFn: organizationService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      enqueueSnackbar(t('organizations.messages.createSuccess'), { variant: 'success' });
      handleCloseForm();
    },
    onError: (error: any) => {
      console.error('Error creating organization:', error);
      enqueueSnackbar(
        error.response?.data?.message || t('organizations.messages.error'),
        { variant: 'error' }
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      organizationService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      enqueueSnackbar(t('organizations.messages.updateSuccess'), { variant: 'success' });
      handleCloseForm();
    },
    onError: (error: any) => {
      enqueueSnackbar(error.response?.data?.message || t('organizations.messages.error'), { variant: 'error' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: organizationService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      enqueueSnackbar(t('organizations.messages.deleteSuccess'), { variant: 'success' });
    },
    onError: (error: any) => {
      enqueueSnackbar(error.response?.data?.message || t('organizations.messages.error'), { variant: 'error' });
    },
  });

  const handleOpenForm = (organization?: Organization) => {
    setSelectedOrganization(organization || null);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setSelectedOrganization(null);
    setOpenForm(false);
  };

  const handleSubmit = async (values: any) => {
    if (selectedOrganization) {
      updateMutation.mutate({ id: selectedOrganization.id, data: values });
    } else {
      createMutation.mutate(values);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t('organizations.messages.deleteConfirm'))) {
      deleteMutation.mutate(id);
    }
  };

  const handleOpenOrgAdminDialog = async (organization: Organization) => {
    setSelectedOrganization(organization);
    try {
      const admin = await organizationService.getOrgAdmin(organization.id);
      setOrgAdmin(admin);
      setOpenOrgAdminDialog(true);
    } catch (error) {
      enqueueSnackbar(t('organizations.messages.error'), { variant: 'error' });
    }
  };

  const handleOrgAdminSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['organizations'] });
    setOpenOrgAdminDialog(false);
    setSelectedOrganization(null);
    setOrgAdmin(null);
  };

  if (isLoading) {
    return <Typography>{t('common.loading')}</Typography>;
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {t('organizations.messages.error')}
      </Alert>
    );
  }

  if (!organizations || !Array.isArray(organizations)) {
    return (
      <Alert severity="warning" sx={{ mt: 2 }}>
        {t('organizations.messages.noData')}
      </Alert>
    );
  }

  return (
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4">{t('organizations.title')}</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenForm()}
        >
          {t('organizations.addNew')}
        </Button>
      </Stack>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('organizations.form.name')}</TableCell>
                <TableCell>{t('organizations.form.email')}</TableCell>
                <TableCell>{t('organizations.form.phone')}</TableCell>
                <TableCell>{t('organizations.form.companyCode')}</TableCell>
                <TableCell>{t('organizations.form.status')}</TableCell>
                <TableCell align="right">{t('common.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {organizations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    {t('organizations.messages.noOrganizations')}
                  </TableCell>
                </TableRow>
              ) : (
                organizations.map((org) => (
                  <TableRow key={org.id}>
                    <TableCell>{org.name}</TableCell>
                    <TableCell>{org.email}</TableCell>
                    <TableCell>{org.phone}</TableCell>
                    <TableCell>{org.companyCode}</TableCell>
                    <TableCell>
                      <Chip
                        label={t(`organizations.status.${org.status.toLowerCase()}`)}
                        color={org.status === OrganizationStatus.ACTIVE ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title={t('organizations.manageAdmin')}>
                        <IconButton onClick={() => handleOpenOrgAdminDialog(org)}>
                          <AdminPanelSettingsIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t('organizations.editOrg')}>
                        <IconButton onClick={() => handleOpenForm(org)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t('organizations.deleteOrg')}>
                        <IconButton onClick={() => handleDelete(org.id)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog
        open={openForm}
        onClose={handleCloseForm}
        maxWidth="sm"
        fullWidth
      >
        <OrganizationForm
          organization={selectedOrganization}
          onSubmit={handleSubmit}
          onCancel={handleCloseForm}
        />
      </Dialog>

      {selectedOrganization && (
        <OrgAdminDialog
          open={openOrgAdminDialog}
          onClose={() => setOpenOrgAdminDialog(false)}
          organizationId={selectedOrganization.id}
          orgAdmin={orgAdmin}
          onSuccess={handleOrgAdminSuccess}
        />
      )}
    </Container>
  );
} 
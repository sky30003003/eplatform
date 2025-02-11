import { useState, useEffect } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { Organization } from '../../types/organization';
import { User } from '../../types/user';
import { organizationService } from '../../services/organizationService';
import { OrgAdminDialog } from '../../components/organization/OrgAdminDialog';
import { OrganizationDialog } from '../../components/organization/OrganizationDialog';
import { DeleteConfirmationDialog } from '../../components/common/DeleteConfirmationDialog';
import { OrganizationList } from '../../components/organization/OrganizationList';

export default function OrganizationsPage() {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [orgAdmin, setOrgAdmin] = useState<User | null>(null);
  const [isOrgAdminDialogOpen, setIsOrgAdminDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const loadOrganizations = async () => {
    try {
      const data = await organizationService.getAll();
      setOrganizations(data);
    } catch (error) {
      enqueueSnackbar(t('organizations.messages.error'), { variant: 'error' });
    }
  };

  useEffect(() => {
    loadOrganizations();
  }, []);

  const handleCreateClick = () => {
    setIsCreateDialogOpen(true);
  };

  const handleEditClick = (organization: Organization) => {
    setSelectedOrg(organization);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (organization: Organization) => {
    setSelectedOrg(organization);
    setIsDeleteDialogOpen(true);
  };

  const handleOrgAdminClick = async (org: Organization) => {
    setSelectedOrg(org);
    try {
      const admin = await organizationService.getOrgAdmin(org.id);
      setOrgAdmin(admin);
      setIsOrgAdminDialogOpen(true);
    } catch (error) {
      enqueueSnackbar(t('orgAdmin.errors.generic'), {
        variant: 'error',
      });
    }
  };

  const handleOrgAdminSuccess = () => {
    loadOrganizations();
    setOrgAdmin(null);
    setIsOrgAdminDialogOpen(false);
  };

  const handleDelete = async () => {
    if (!selectedOrg) return;

    try {
      await organizationService.delete(selectedOrg.id);
      enqueueSnackbar(t('organizations.messages.deleteSuccess'), { variant: 'success' });
      loadOrganizations();
    } catch (error) {
      enqueueSnackbar(t('organizations.messages.error'), { variant: 'error' });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedOrg(null);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">{t('organizations.title')}</Typography>
        <Button
          variant="contained"
          onClick={handleCreateClick}
        >
          {t('organizations.addNew')}
        </Button>
      </Box>

      <OrganizationList 
        organizations={organizations}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
        onManageAdmin={handleOrgAdminClick}
      />

      <OrganizationDialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSuccess={() => {
          loadOrganizations();
          setIsCreateDialogOpen(false);
        }}
      />

      {selectedOrg && (
        <>
          <OrganizationDialog
            open={isEditDialogOpen}
            onClose={() => setIsEditDialogOpen(false)}
            onSuccess={() => {
              loadOrganizations();
              setIsEditDialogOpen(false);
              setSelectedOrg(null);
            }}
            organization={selectedOrg}
          />

          <DeleteConfirmationDialog
            open={isDeleteDialogOpen}
            onClose={() => setIsDeleteDialogOpen(false)}
            onConfirm={handleDelete}
            title={t('organizations.messages.deleteConfirm')}
            content={t('organizations.messages.deleteConfirm')}
          />

          <OrgAdminDialog
            open={isOrgAdminDialogOpen}
            onClose={() => setIsOrgAdminDialogOpen(false)}
            organizationId={selectedOrg.id}
            orgAdmin={orgAdmin}
            onSuccess={handleOrgAdminSuccess}
          />
        </>
      )}
    </Box>
  );
} 
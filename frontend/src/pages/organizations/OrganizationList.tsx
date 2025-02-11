import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { Organization } from '../../types/organization';
import { User } from '../../types/user';
import { organizationService } from '../../services/organizationService';
import { OrgAdminDialog } from '../../components/organization/OrgAdminDialog';
import { OrganizationDialog } from '../../components/organization/OrganizationDialog';
import { DeleteConfirmationDialog } from '../../components/common/DeleteConfirmationDialog';

export const OrganizationList = () => {
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
      enqueueSnackbar('Eroare la încărcarea organizațiilor', { variant: 'error' });
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
      enqueueSnackbar('Eroare la încărcarea datelor adminului organizației', {
        variant: 'error',
      });
    }
  };

  const handleOrgAdminSuccess = () => {
    loadOrganizations();
  };

  const handleDelete = async () => {
    if (!selectedOrg) return;

    try {
      await organizationService.delete(selectedOrg.id);
      enqueueSnackbar('Organizație ștearsă cu succes', { variant: 'success' });
      loadOrganizations();
    } catch (error) {
      enqueueSnackbar('Eroare la ștergerea organizației', { variant: 'error' });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedOrg(null);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Organizații</Typography>
        <Button
          variant="contained"
          onClick={handleCreateClick}
        >
          Adaugă Organizație
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nume</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Telefon</TableCell>
              <TableCell>Cod Fiscal</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Acțiuni</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {organizations.map((organization) => (
              <TableRow key={organization.id}>
                <TableCell>{organization.name}</TableCell>
                <TableCell>{organization.email}</TableCell>
                <TableCell>{organization.phone}</TableCell>
                <TableCell>{organization.companyCode}</TableCell>
                <TableCell>{organization.status}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Editează">
                      <IconButton
                        size="small"
                        onClick={() => handleEditClick(organization)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Admin Organizație">
                      <IconButton
                        size="small"
                        onClick={() => handleOrgAdminClick(organization)}
                      >
                        <AdminPanelSettingsIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Șterge">
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(organization)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

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
            title="Ștergere organizație"
            content="Sunteți sigur că doriți să ștergeți această organizație? Această acțiune nu poate fi anulată."
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
}; 
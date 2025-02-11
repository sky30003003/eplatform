import { useState } from 'react';
import {
  Box,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Chip,
  Typography
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useTranslation } from 'react-i18next';
import { Organization, OrganizationStatus } from '../../types/organization';
import { User } from '../../types/user';
import { TextFormat } from '@mui/icons-material';
import { alignProperty } from '@mui/material/styles/cssUtils';

interface OrganizationListProps {
  organizations: Organization[];
  onEdit: (organization: Organization) => void;
  onDelete: (organization: Organization) => void;
  onManageAdmin: (organization: Organization) => void;
}

export const OrganizationList = ({ 
  organizations,
  onEdit,
  onDelete,
  onManageAdmin
}: OrganizationListProps) => {
  const { t } = useTranslation();

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell width="30%">
              <Typography fontWeight="bold">
                {t('organizations.form.name')}
              </Typography>
            </TableCell>
            <TableCell width="30%">
              <Typography fontWeight="bold">
                {t('organizations.form.email')}
              </Typography>
            </TableCell>
            <TableCell width="15%">
              <Typography fontWeight="bold">
                {t('organizations.form.companyCode')}
              </Typography>
            </TableCell>
            <TableCell width="15%">
              <Typography fontWeight="bold">
                {t('organizations.form.phone')}
              </Typography>
            </TableCell>
            <TableCell width="5%" align="center">
              <Typography fontWeight="bold">
                {t('organizations.form.status')}
              </Typography>
            </TableCell>
            <TableCell width="5%" align="center">
              <Typography fontWeight="bold">
                {t('common.actions')}
              </Typography>
            </TableCell>
            <TableCell width="5%" align="center">
              <Typography fontWeight="bold">
                {t('organizations.form.orgAdmin')}
              </Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {organizations.map((organization) => (
            <TableRow key={organization.id}>
              <TableCell>{organization.name}</TableCell>
              <TableCell>{organization.email}</TableCell>
              <TableCell>{organization.companyCode}</TableCell>
              <TableCell>{organization.phone}</TableCell>
              <TableCell align="center">
                <Chip
                  label={t(`organizations.status.${organization.status.toLowerCase()}`)}
                  color={organization.status === OrganizationStatus.ACTIVE ? 'success' : 'default'}
                  size="small"
                />
              </TableCell>
              <TableCell align="center">
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                  <Tooltip title={t('organizations.editOrg')}>
                    <IconButton
                      size="small"
                      onClick={() => onEdit(organization)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t('organizations.deleteOrg')}>
                    <IconButton
                      size="small"
                      onClick={() => onDelete(organization)}
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell align="center">
                <Tooltip title={t('organizations.manageAdmin')}>
                  <IconButton
                    size="small"
                    onClick={() => onManageAdmin(organization)}
                  >
                    <AdminPanelSettingsIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}; 
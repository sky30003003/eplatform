import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  MenuItem,
  Box,
  CircularProgress,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useSnackbar } from 'notistack';
import { Organization, OrganizationStatus } from '../../types/organization';
import { organizationService } from '../../services/organizationService';

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
  const { enqueueSnackbar } = useSnackbar();
  const isEdit = Boolean(organization);

  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .min(2, 'Numele trebuie să aibă minim 2 caractere')
      .max(100, 'Numele nu poate depăși 100 de caractere')
      .required('Numele este obligatoriu'),
    email: Yup.string()
      .email('Adresa de email nu este validă')
      .required('Email-ul este obligatoriu'),
    phone: Yup.string()
      .matches(
        /^(\+4|)?(07[0-8]{1}[0-9]{1}|02[0-9]{2}|03[0-9]{2}){1}?(\s|\.|\-)?([0-9]{3}(\s|\.|\-|)){2}$/,
        'Numărul de telefon nu este valid'
      )
      .required('Numărul de telefon este obligatoriu'),
    companyCode: Yup.string()
      .required('Codul fiscal este obligatoriu'),
    status: isEdit
      ? Yup.string().oneOf(Object.values(OrganizationStatus)).required('Statusul este obligatoriu')
      : Yup.string().optional(),
  });

  const formik = useFormik({
    initialValues: {
      name: organization?.name || '',
      email: organization?.email || '',
      phone: organization?.phone || '',
      companyCode: organization?.companyCode || '',
      status: organization?.status || OrganizationStatus.ACTIVE,
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        if (isEdit && organization) {
          await organizationService.update(organization.id, values);
          enqueueSnackbar('Organizația a fost actualizată cu succes', { variant: 'success' });
        } else {
          await organizationService.create(values);
          enqueueSnackbar('Organizația a fost creată cu succes', { variant: 'success' });
        }
        onSuccess();
        onClose();
      } catch (error: any) {
        enqueueSnackbar(
          error.message || 'A apărut o eroare. Vă rugăm să încercați din nou.',
          { variant: 'error' }
        );
      }
    },
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEdit ? 'Editare Organizație' : 'Adăugare Organizație Nouă'}
      </DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Stack spacing={3}>
            <TextField
              fullWidth
              name="name"
              label="Nume Organizație"
              value={formik.values.name}
              onChange={formik.handleChange}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
            />

            <TextField
              fullWidth
              name="email"
              label="Email"
              type="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
            />

            <TextField
              fullWidth
              name="phone"
              label="Telefon"
              value={formik.values.phone}
              onChange={formik.handleChange}
              error={formik.touched.phone && Boolean(formik.errors.phone)}
              helperText={formik.touched.phone && formik.errors.phone}
            />

            <TextField
              fullWidth
              name="companyCode"
              label="Cod Fiscal"
              value={formik.values.companyCode}
              onChange={formik.handleChange}
              error={formik.touched.companyCode && Boolean(formik.errors.companyCode)}
              helperText={formik.touched.companyCode && formik.errors.companyCode}
            />

            {isEdit && (
              <TextField
                select
                fullWidth
                name="status"
                label="Status"
                value={formik.values.status}
                onChange={formik.handleChange}
                error={formik.touched.status && Boolean(formik.errors.status)}
                helperText={formik.touched.status && formik.errors.status}
              >
                <MenuItem value={OrganizationStatus.ACTIVE}>Activ</MenuItem>
                <MenuItem value={OrganizationStatus.INACTIVE}>Inactiv</MenuItem>
              </TextField>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Anulează</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={formik.isSubmitting}
            startIcon={formik.isSubmitting ? <CircularProgress size={20} /> : null}
          >
            {isEdit ? 'Salvează' : 'Adaugă'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}; 
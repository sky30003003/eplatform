import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  CircularProgress,
  Alert,
  Typography,
  Snackbar,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { User } from '../../types/user';
import { organizationService } from '../../services/organizationService';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';

interface OrgAdminDialogProps {
  open: boolean;
  onClose: () => void;
  organizationId: string;
  orgAdmin: User | null;
  onSuccess: () => void;
}

export const OrgAdminDialog: React.FC<OrgAdminDialogProps> = ({
  open,
  onClose,
  organizationId,
  orgAdmin,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const isEdit = Boolean(orgAdmin);
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  console.log('OrgAdmin data:', orgAdmin);

  const validationSchema = Yup.object().shape({
    firstName: Yup.string()
      .min(2, 'Prenumele trebuie să aibă minim 2 caractere')
      .max(50, 'Prenumele nu poate depăși 50 de caractere')
      .required('Prenumele este obligatoriu'),
    lastName: Yup.string()
      .min(2, 'Numele trebuie să aibă minim 2 caractere')
      .max(50, 'Numele nu poate depăși 50 de caractere')
      .required('Numele este obligatoriu'),
    phone: Yup.string()
      .matches(
        /^(\+4|)?(07[0-8]{1}[0-9]{1}|02[0-9]{2}|03[0-9]{2}){1}?(\s|\.|\-)?([0-9]{3}(\s|\.|\-|)){2}$/,
        'Numărul de telefon nu este valid (ex: +40744565656 sau 0744565656)'
      )
      .required('Numărul de telefon este obligatoriu'),
    email: isEdit 
      ? Yup.string()
      : Yup.string()
          .email('Adresa de email nu este validă')
          .matches(
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            'Adresa de email nu este într-un format valid'
          )
          .required('Email-ul este obligatoriu'),
    personalCode: Yup.string()
      .matches(
        /^[a-zA-Z0-9]+$/,
        'CNP/CUI poate conține doar litere și cifre'
      )
      .min(8, 'CNP/CUI trebuie să aibă minim 8 caractere')
      .max(13, 'CNP/CUI nu poate depăși 13 caractere')
      .required('CNP/CUI este obligatoriu'),
  });

  const handleClose = () => {
    setTempPassword(null);
    onClose();
  };

  const formik = useFormik({
    initialValues: {
      firstName: orgAdmin?.firstName || '',
      lastName: orgAdmin?.lastName || '',
      phone: orgAdmin?.phone || '',
      email: orgAdmin?.email || '',
      personalCode: orgAdmin?.personalCode || '',
    },
    validationSchema,
    onSubmit: async (values) => {
      console.log('Form values:', values);
      try {
        if (isEdit && orgAdmin) {
          await organizationService.updateOrgAdmin(orgAdmin.id, {
            firstName: values.firstName,
            lastName: values.lastName,
            phone: values.phone,
            personalCode: values.personalCode,
          });
          enqueueSnackbar('Admin organizație actualizat cu succes', { variant: 'success' });
        } else {
          const result = await organizationService.createOrgAdmin(organizationId, {
            email: values.email,
            firstName: values.firstName,
            lastName: values.lastName,
            phone: values.phone,
            personalCode: values.personalCode
          });
          setTempPassword(result.tempPassword);
          enqueueSnackbar('Admin organizație creat cu succes', { variant: 'success' });
        }
        onSuccess();
      } catch (error: any) {
        console.error('Error in OrgAdminDialog:', error);
        enqueueSnackbar(
          error.response?.data?.message || 'A apărut o eroare. Vă rugăm să încercați din nou.',
          { variant: 'error' }
        );
      }
    },
  });

  useEffect(() => {
    if (orgAdmin) {
      formik.resetForm({
        values: {
          firstName: orgAdmin.firstName,
          lastName: orgAdmin.lastName,
          phone: orgAdmin.phone,
          email: orgAdmin.email || '',
          personalCode: orgAdmin.personalCode || '',
        },
      });
    }
  }, [orgAdmin]);

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth
      disableEscapeKeyDown={Boolean(tempPassword)}
    >
      <DialogTitle>
        {isEdit ? 'Editare Admin Organizație' : 'Creare Admin Organizație'}
        {isEdit && orgAdmin && (
          <Typography 
            component="div"
            variant="subtitle2" 
            color="text.secondary" 
            sx={{ mt: 1 }}
          >
            {orgAdmin.email}
          </Typography>
        )}
      </DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          {tempPassword ? (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Alert severity="success" sx={{ mb: 2 }}>
                Admin-ul organizației a fost creat cu succes!
              </Alert>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Parola temporară generată pentru admin este:
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  p: 2,
                  bgcolor: 'background.paper',
                  borderRadius: 1,
                  fontFamily: 'monospace',
                  wordBreak: 'break-all'
                }}
              >
                {tempPassword}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Vă rugăm să transmiteți această parolă admin-ului în mod securizat.
                La prima autentificare, admin-ul va fi rugat să își schimbe parola.
              </Typography>
            </Box>
          ) : (
            <Box display="grid" gap={2}>
              <TextField
                fullWidth
                name="firstName"
                label="Prenume"
                value={formik.values.firstName}
                onChange={formik.handleChange}
                error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                helperText={formik.touched.firstName && formik.errors.firstName}
              />
              <TextField
                fullWidth
                name="lastName"
                label="Nume"
                value={formik.values.lastName}
                onChange={formik.handleChange}
                error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                helperText={formik.touched.lastName && formik.errors.lastName}
              />
              <TextField
                fullWidth
                name="phone"
                label="Telefon"
                placeholder="+40744565656"
                value={formik.values.phone}
                onChange={formik.handleChange}
                error={formik.touched.phone && Boolean(formik.errors.phone)}
                helperText={formik.touched.phone && formik.errors.phone}
              />
              {!isEdit ? (
                <TextField
                  fullWidth
                  name="email"
                  label="Email"
                  placeholder="exemplu@domeniu.ro"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                />
              ) : null}
              <TextField
                fullWidth
                name="personalCode"
                label="CNP/CUI"
                value={formik.values.personalCode}
                onChange={formik.handleChange}
                error={formik.touched.personalCode && Boolean(formik.errors.personalCode)}
                helperText={formik.touched.personalCode && formik.errors.personalCode}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {tempPassword ? (
            <Button onClick={handleClose} variant="contained">
              Închide
            </Button>
          ) : (
            <>
              <Button onClick={handleClose}>Anulare</Button>
              <Button
                type="submit"
                variant="contained"
                disabled={formik.isSubmitting}
                startIcon={formik.isSubmitting ? <CircularProgress size={20} /> : null}
              >
                {isEdit ? 'Salvează' : 'Creează'}
              </Button>
            </>
          )}
        </DialogActions>
      </form>
    </Dialog>
  );
}; 
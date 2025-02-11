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
  Stack,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { User } from '../../types/user';
import { organizationService } from '../../services/organizationService';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { DeleteConfirmationDialog } from '../common/DeleteConfirmationDialog';

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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  console.log('OrgAdmin data:', orgAdmin);

  const validationSchema = Yup.object().shape({
    firstName: Yup.string()
      .min(2, t('orgAdmin.validation.firstNameMin'))
      .max(50, t('orgAdmin.validation.firstNameMax'))
      .required(t('orgAdmin.validation.firstNameRequired')),
    lastName: Yup.string()
      .min(2, t('orgAdmin.validation.lastNameMin'))
      .max(50, t('orgAdmin.validation.lastNameMax'))
      .required(t('orgAdmin.validation.lastNameRequired')),
    phone: Yup.string()
      .matches(
        /^(\+4|)?(07[0-8]{1}[0-9]{1}|02[0-9]{2}|03[0-9]{2}){1}?(\s|\.|\-)?([0-9]{3}(\s|\.|\-|)){2}$/,
        t('orgAdmin.validation.phoneInvalid')
      )
      .required(t('orgAdmin.validation.phoneRequired')),
    email: isEdit 
      ? Yup.string()
      : Yup.string()
          .email(t('orgAdmin.validation.emailInvalid'))
          .matches(
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            t('orgAdmin.validation.emailFormat')
          )
          .required(t('orgAdmin.validation.emailRequired')),
    personalCode: Yup.string()
      .matches(
        /^[a-zA-Z0-9]+$/,
        t('orgAdmin.validation.personalCodeFormat')
      )
      .min(8, t('orgAdmin.validation.personalCodeMin'))
      .max(13, t('orgAdmin.validation.personalCodeMax'))
      .required(t('orgAdmin.validation.personalCodeRequired')),
  });

  const handleClose = () => {
    setTempPassword(null);
    formik.resetForm({
      values: {
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        personalCode: '',
      }
    });
    onClose();
  };

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      personalCode: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      console.log('Form values:', values);
      try {
        if (isEdit && orgAdmin) {
          await organizationService.updateOrgAdmin(orgAdmin.id, values);
          enqueueSnackbar(t('orgAdmin.messages.updateSuccess'), { variant: 'success' });
        } else {
          const result = await organizationService.createOrgAdmin(organizationId, values);
          enqueueSnackbar(
            `${t('orgAdmin.messages.createSuccess')}. ${t('orgAdmin.messages.tempPassword')} ${result.tempPassword}`,
            { 
              variant: 'success',
              autoHideDuration: 10000,
              anchorOrigin: {
                vertical: 'top',
                horizontal: 'center'
              }
            }
          );
        }
        onSuccess();
        onClose();
      } catch (error: any) {
        console.error('Error in OrgAdminDialog:', error);
        enqueueSnackbar(error.message, { 
          variant: 'error',
          autoHideDuration: 6000,
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'center'
          }
        });
      }
    },
  });

  useEffect(() => {
    if (open) {
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
      } else {
        formik.resetForm();
      }
    }
  }, [open, orgAdmin]);

  const handleDelete = async () => {
    if (!orgAdmin) return;
    
    try {
      await organizationService.deleteOrgAdmin(orgAdmin.id);
      enqueueSnackbar(t('orgAdmin.messages.deleteSuccess'), { variant: 'success' });
      onSuccess();
      onClose();
    } catch (error) {
      enqueueSnackbar(t('orgAdmin.errors.deleteError'), { variant: 'error' });
    }
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="sm" 
        fullWidth
        disableEscapeKeyDown={Boolean(tempPassword)}
      >
        <DialogTitle>
          {isEdit ? t('orgAdmin.edit') : t('orgAdmin.create')}
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
                  {t('orgAdmin.messages.createSuccess')}
                </Alert>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {t('orgAdmin.messages.tempPassword')}
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
                  {t('orgAdmin.messages.tempPasswordNote')}
                </Typography>
              </Box>
            ) : (
              <Box display="grid" gap={2}>
                <TextField
                  fullWidth
                  name="firstName"
                  label={t('orgAdmin.form.firstName')}
                  value={formik.values.firstName}
                  onChange={formik.handleChange}
                  error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                  helperText={formik.touched.firstName && formik.errors.firstName}
                />
                <TextField
                  fullWidth
                  name="lastName"
                  label={t('orgAdmin.form.lastName')}
                  value={formik.values.lastName}
                  onChange={formik.handleChange}
                  error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                  helperText={formik.touched.lastName && formik.errors.lastName}
                />
                <TextField
                  fullWidth
                  name="phone"
                  label={t('orgAdmin.form.phone')}
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
                    label={t('orgAdmin.form.email')}
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
                  label={t('orgAdmin.form.personalCode')}
                  value={formik.values.personalCode}
                  onChange={formik.handleChange}
                  error={formik.touched.personalCode && Boolean(formik.errors.personalCode)}
                  helperText={formik.touched.personalCode && formik.errors.personalCode}
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              {orgAdmin && (
                <Button
                  color="error"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  {t('orgAdmin.delete')}
                </Button>
              )}
              <Box>
                <Button onClick={handleClose}>{t('common.cancel')}</Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={formik.isSubmitting}
                  startIcon={formik.isSubmitting ? <CircularProgress size={20} /> : null}
                >
                  {isEdit ? t('common.save') : t('common.create')}
                </Button>
              </Box>
            </Box>
          </DialogActions>
        </form>
      </Dialog>

      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title={t('orgAdmin.delete')}
        content={t('orgAdmin.messages.deleteConfirm')}
      />
    </>
  );
}; 
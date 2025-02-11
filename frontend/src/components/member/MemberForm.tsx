import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  TextField,
  MenuItem,
} from '@mui/material';
import { User, UserType, UserStatus } from '../../types/user';

interface MemberFormProps {
  member?: User | null;
  onSubmit: (values: any) => void;
  onCancel: () => void;
}

export const MemberForm = ({ member, onSubmit, onCancel }: MemberFormProps) => {
  const { t } = useTranslation();
  const isEdit = Boolean(member);

  const validationSchema = Yup.object({
    firstName: Yup.string()
      .min(2, t('orgAdmin.validation.firstNameMin'))
      .max(50, t('orgAdmin.validation.firstNameMax'))
      .required(t('orgAdmin.validation.firstNameRequired')),
    lastName: Yup.string()
      .min(2, t('orgAdmin.validation.lastNameMin'))
      .max(50, t('orgAdmin.validation.lastNameMax'))
      .required(t('orgAdmin.validation.lastNameRequired')),
    email: Yup.string()
      .email(t('orgAdmin.validation.emailInvalid'))
      .required(t('orgAdmin.validation.emailRequired')),
    phone: Yup.string()
      .matches(/^(\+4|)?(07[0-8]{1}[0-9]{1}|02[0-9]{2}|03[0-9]{2}){1}?(\s|\.|\-)?([0-9]{3}(\s|\.|\-|)){2}$/, 
        t('orgAdmin.validation.phoneInvalid'))
      .required(t('orgAdmin.validation.phoneRequired')),
    personalCode: Yup.string()
      .matches(/^[a-zA-Z0-9]+$/, t('orgAdmin.validation.personalCodeFormat'))
      .min(8, t('orgAdmin.validation.personalCodeMin'))
      .max(13, t('orgAdmin.validation.personalCodeMax'))
      .required(t('orgAdmin.validation.personalCodeRequired')),
    userType: Yup.string()
      .oneOf(Object.values(UserType))
      .required('Tipul utilizatorului este obligatoriu'),
    status: isEdit
      ? Yup.string().oneOf(Object.values(UserStatus)).required('Statusul este obligatoriu')
      : Yup.string().optional(),
  });

  const formik = useFormik({
    initialValues: {
      firstName: member?.firstName || '',
      lastName: member?.lastName || '',
      email: member?.email || '',
      phone: member?.phone || '',
      personalCode: member?.personalCode || '',
      userType: member?.userType || UserType.EMPLOYEE,
      status: member?.status || UserStatus.ACTIVE,
    },
    validationSchema,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  return (
    <>
      <DialogTitle>
        {isEdit ? t('members.editTitle') : t('members.addNew')}
      </DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Stack spacing={3}>
            <TextField
              fullWidth
              label={t('orgAdmin.form.firstName')}
              {...formik.getFieldProps('firstName')}
              error={formik.touched.firstName && Boolean(formik.errors.firstName)}
              helperText={formik.touched.firstName && formik.errors.firstName}
            />

            <TextField
              fullWidth
              label={t('orgAdmin.form.lastName')}
              {...formik.getFieldProps('lastName')}
              error={formik.touched.lastName && Boolean(formik.errors.lastName)}
              helperText={formik.touched.lastName && formik.errors.lastName}
            />

            <TextField
              fullWidth
              label={t('orgAdmin.form.email')}
              type="email"
              {...formik.getFieldProps('email')}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
            />

            <TextField
              fullWidth
              label={t('orgAdmin.form.phone')}
              {...formik.getFieldProps('phone')}
              error={formik.touched.phone && Boolean(formik.errors.phone)}
              helperText={formik.touched.phone && formik.errors.phone}
            />

            <TextField
              fullWidth
              label={t('orgAdmin.form.personalCode')}
              {...formik.getFieldProps('personalCode')}
              error={formik.touched.personalCode && Boolean(formik.errors.personalCode)}
              helperText={formik.touched.personalCode && formik.errors.personalCode}
            />

            <TextField
              select
              fullWidth
              label={t('members.table.type')}
              {...formik.getFieldProps('userType')}
              error={formik.touched.userType && Boolean(formik.errors.userType)}
              helperText={formik.touched.userType && formik.errors.userType}
            >
              {Object.values(UserType).map((type) => (
                <MenuItem key={type} value={type}>
                  {t(`members.types.${type.toLowerCase()}`)}
                </MenuItem>
              ))}
            </TextField>

            {isEdit && (
              <TextField
                select
                fullWidth
                label={t('members.table.status')}
                {...formik.getFieldProps('status')}
                error={formik.touched.status && Boolean(formik.errors.status)}
                helperText={formik.touched.status && formik.errors.status}
              >
                {Object.values(UserStatus).map((status) => (
                  <MenuItem key={status} value={status}>
                    {t(`members.status.${status.toLowerCase()}`)}
                  </MenuItem>
                ))}
              </TextField>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancel}>{t('common.cancel')}</Button>
          <Button type="submit" variant="contained">
            {isEdit ? t('common.save') : t('common.add')}
          </Button>
        </DialogActions>
      </form>
    </>
  );
}; 
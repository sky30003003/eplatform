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
import { Organization, OrganizationStatus } from '../../types/organization';

interface OrganizationFormProps {
  organization?: Organization | null;
  onSubmit: (values: any) => void;
  onCancel: () => void;
}

export const OrganizationForm = ({ organization, onSubmit, onCancel }: OrganizationFormProps) => {
  const { t } = useTranslation();

  const validationSchema = Yup.object({
    name: Yup.string().required(t('organizations.validation.nameRequired')),
    email: Yup.string()
      .email(t('organizations.validation.emailInvalid'))
      .required(t('organizations.validation.emailRequired')),
    phone: Yup.string()
      .matches(/^[0-9]+$/, t('organizations.validation.phoneDigits'))
      .min(10, t('organizations.validation.phoneLength'))
      .required(t('organizations.validation.phoneRequired')),
    companyCode: Yup.string().required(t('organizations.validation.companyCodeRequired')),
    status: Yup.string().oneOf(Object.values(OrganizationStatus)).required(),
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
    onSubmit: (values) => {
      console.log('Form values:', values);
      const submitData = organization ? values : {
        name: values.name,
        email: values.email,
        phone: values.phone,
        companyCode: values.companyCode
      };
      console.log('Data to submit:', submitData);
      onSubmit(submitData);
    },
  });

  return (
    <>
      <DialogTitle>
        {organization ? t('organizations.editTitle') : t('organizations.addNew')}
      </DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Stack spacing={3}>
            <TextField
              fullWidth
              label={t('organizations.form.name')}
              {...formik.getFieldProps('name')}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
            />

            <TextField
              fullWidth
              label={t('organizations.form.email')}
              type="email"
              {...formik.getFieldProps('email')}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
            />

            <TextField
              fullWidth
              label={t('organizations.form.phone')}
              {...formik.getFieldProps('phone')}
              error={formik.touched.phone && Boolean(formik.errors.phone)}
              helperText={formik.touched.phone && formik.errors.phone}
            />

            <TextField
              fullWidth
              label={t('organizations.form.companyCode')}
              {...formik.getFieldProps('companyCode')}
              error={formik.touched.companyCode && Boolean(formik.errors.companyCode)}
              helperText={formik.touched.companyCode && formik.errors.companyCode}
            />

            {organization && (
              <TextField
                select
                fullWidth
                label={t('organizations.form.status')}
                {...formik.getFieldProps('status')}
                error={formik.touched.status && Boolean(formik.errors.status)}
                helperText={formik.touched.status && formik.errors.status}
              >
                <MenuItem value={OrganizationStatus.ACTIVE}>
                  {t('organizations.status.active')}
                </MenuItem>
                <MenuItem value={OrganizationStatus.INACTIVE}>
                  {t('organizations.status.inactive')}
                </MenuItem>
              </TextField>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancel}>{t('common.cancel')}</Button>
          <Button type="submit" variant="contained" disabled={formik.isSubmitting}>
            {organization ? t('common.save') : t('common.add')}
          </Button>
        </DialogActions>
      </form>
    </>
  );
}; 
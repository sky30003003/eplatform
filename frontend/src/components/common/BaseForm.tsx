import { useFormik, FormikConfig, FormikValues } from 'formik';
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

export interface BaseFormProps<T extends FormikValues> {
  title: string;
  initialValues: T;
  validationSchema: any;
  onSubmit: (values: T) => void;
  onCancel: () => void;
  isEdit?: boolean;
  children: (formik: ReturnType<typeof useFormik<T>>) => React.ReactNode;
}

export function BaseForm<T extends FormikValues>({ 
  title,
  initialValues,
  validationSchema,
  onSubmit,
  onCancel,
  isEdit,
  children
}: BaseFormProps<T>) {
  const { t } = useTranslation();

  const formik = useFormik<T>({
    initialValues,
    validationSchema,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  return (
    <>
      <DialogTitle>{title}</DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Stack spacing={3}>
            {children(formik)}
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
} 
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Stack,
  Alert,
  IconButton,
  InputAdornment,
  TextField,
  Button,
  CircularProgress,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import AuthLayout from '../../layouts/AuthLayout';
import { axiosInstance } from '../../utils/axios';
import { API_ENDPOINTS } from '../../config/api.config';

const ChangePasswordSchema = Yup.object().shape({
  newPassword: Yup.string()
    .min(8, 'Parola trebuie să aibă minim 8 caractere')
    .matches(/[a-z]/, 'Parola trebuie să conțină cel puțin o literă mică')
    .matches(/[A-Z]/, 'Parola trebuie să conțină cel puțin o literă mare')
    .matches(/[0-9]/, 'Parola trebuie să conțină cel puțin o cifră')
    .matches(/[^a-zA-Z0-9]/, 'Parola trebuie să conțină cel puțin un caracter special')
    .required('Parola este obligatorie'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Parolele nu coincid')
    .required('Confirmarea parolei este obligatorie'),
});

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  const formik = useFormik({
    initialValues: {
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema: ChangePasswordSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await axiosInstance.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
          newPassword: values.newPassword,
        });
        
        // După schimbarea parolei, delogăm utilizatorul pentru a-l forța să se autentifice din nou
        await logout();
        navigate('/login', { 
          state: { 
            message: 'Parola a fost schimbată cu succes. Vă rugăm să vă autentificați cu noua parolă.' 
          } 
        });
      } catch (err: any) {
        setError(err.response?.data?.message || 'A apărut o eroare la schimbarea parolei');
        setSubmitting(false);
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formik.isSubmitting) return;
    await formik.submitForm();
  };

  return (
    <AuthLayout
      title="Schimbare Parolă"
      description="Vă rugăm să vă schimbați parola pentru a continua"
    >
      <form onSubmit={handleSubmit} noValidate>
        <Stack spacing={3}>
          {error && (
            <Alert 
              severity="error" 
              onClose={() => setError('')}
              sx={{ 
                '& .MuiAlert-message': { 
                  width: '100%' 
                } 
              }}
            >
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            type={showPassword ? 'text' : 'password'}
            label="Parolă nouă"
            {...formik.getFieldProps('newPassword')}
            error={formik.touched.newPassword && Boolean(formik.errors.newPassword)}
            helperText={formik.touched.newPassword && formik.errors.newPassword}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            type={showConfirmPassword ? 'text' : 'password'}
            label="Confirmă parola"
            {...formik.getFieldProps('confirmPassword')}
            error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
            helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Stack>

        <Button
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          disabled={formik.isSubmitting}
          sx={{ mt: 3 }}
        >
          {formik.isSubmitting ? (
            <>
              Se procesează...
              <CircularProgress
                size={24}
                sx={{
                  position: 'absolute',
                  right: 16,
                }}
              />
            </>
          ) : (
            'Schimbă parola'
          )}
        </Button>
      </form>
    </AuthLayout>
  );
} 
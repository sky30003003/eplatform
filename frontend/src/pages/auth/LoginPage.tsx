import { useState } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Link,
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

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Adresa de email invalidă')
    .required('Email-ul este obligatoriu'),
  password: Yup.string()
    .required('Parola este obligatorie'),
});

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard/app';
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formik.isSubmitting) return;
    await formik.submitForm();
  };

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: LoginSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setError('');
        setSubmitting(true);
        await login(values.email, values.password);
        navigate(from, { replace: true });
      } catch (err) {
        console.error('Login error:', err);
        setError(err instanceof Error ? err.message : 'A apărut o eroare la autentificare');
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleShowPassword = () => {
    setShowPassword((show) => !show);
  };

  return (
    <AuthLayout
      title="Autentificare"
      description="Introduceți datele de autentificare pentru a continua"
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
            autoComplete="username"
            type="email"
            label="Adresa de email"
            {...formik.getFieldProps('email')}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
            disabled={formik.isSubmitting}
          />

          <TextField
            fullWidth
            autoComplete="current-password"
            type={showPassword ? 'text' : 'password'}
            label="Parola"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton 
                    onClick={handleShowPassword} 
                    edge="end"
                    disabled={formik.isSubmitting}
                    type="button"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            {...formik.getFieldProps('password')}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
            disabled={formik.isSubmitting}
          />
        </Stack>

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ my: 2 }}
        >
          <Link 
            component={RouterLink} 
            variant="subtitle2" 
            to="/reset-password"
            sx={{ 
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline'
              }
            }}
          >
            Ai uitat parola?
          </Link>
        </Stack>

        <Button
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          disabled={formik.isSubmitting}
          sx={{
            position: 'relative',
            '& .MuiCircularProgress-root': {
              marginLeft: 1
            }
          }}
        >
          Autentificare
          {formik.isSubmitting && (
            <CircularProgress
              size={24}
              sx={{
                position: 'absolute',
                right: 16,
              }}
            />
          )}
        </Button>

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="center"
          sx={{ mt: 3 }}
        >
          <Link 
            component={RouterLink} 
            variant="subtitle2" 
            to="/register"
            sx={{ 
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline'
              }
            }}
          >
            Nu ai cont? Înregistrează-te
          </Link>
        </Stack>
      </form>
    </AuthLayout>
  );
} 
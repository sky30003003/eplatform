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

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: LoginSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await login(values.email, values.password);
        navigate(from, { replace: true });
      } catch (error) {
        console.error('Login error:', error);
        setError('Credențiale invalide');
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
      <form onSubmit={formik.handleSubmit}>
        <Stack spacing={3}>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            fullWidth
            autoComplete="username"
            type="email"
            label="Adresa de email"
            {...formik.getFieldProps('email')}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
          />

          <TextField
            fullWidth
            autoComplete="current-password"
            type={showPassword ? 'text' : 'password'}
            label="Parola"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleShowPassword} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            {...formik.getFieldProps('password')}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
          />
        </Stack>

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ my: 2 }}
        >
          <Link component={RouterLink} variant="subtitle2" to="/reset-password">
            Ai uitat parola?
          </Link>
        </Stack>

        <Button
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          disabled={formik.isSubmitting}
        >
          Autentificare
        </Button>

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="center"
          sx={{ mt: 3 }}
        >
          <Link component={RouterLink} variant="subtitle2" to="/register">
            Nu ai cont? Înregistrează-te
          </Link>
        </Stack>
      </form>
    </AuthLayout>
  );
} 
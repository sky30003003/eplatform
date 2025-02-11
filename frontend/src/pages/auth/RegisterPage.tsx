import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
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
  MenuItem,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import AuthLayout from '../../layouts/AuthLayout';
import { UserType } from '../../types/user';

const userTypes = [
  { value: UserType.SUPERADMIN, label: 'Super Admin' },
  { value: UserType.ORGADMIN, label: 'Administrator Organizație' },
  { value: UserType.ADMIN, label: 'Administrator' },
  { value: UserType.COLLABORATOR, label: 'Colaborator' },
  { value: UserType.EMPLOYEE, label: 'Angajat' },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
      personalCode: '',
      userType: UserType.EMPLOYEE,
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Adresa de email invalidă')
        .required('Email-ul este obligatoriu'),
      password: Yup.string()
        .min(6, 'Parola trebuie să aibă minim 6 caractere')
        .required('Parola este obligatorie'),
      firstName: Yup.string().required('Prenumele este obligatoriu'),
      lastName: Yup.string().required('Numele este obligatoriu'),
      phone: Yup.string()
        .matches(/^[0-9]+$/, 'Numărul de telefon poate conține doar cifre')
        .min(10, 'Numărul de telefon trebuie să aibă minim 10 cifre')
        .required('Numărul de telefon este obligatoriu'),
      personalCode: Yup.string()
        .matches(/^[0-9]+$/, 'Codul personal poate conține doar cifre')
        .length(13, 'Codul personal trebuie să aibă exact 13 cifre')
        .required('Codul personal este obligatoriu'),
      userType: Yup.string().required('Tipul utilizatorului este obligatoriu'),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await register(values);
        navigate('/login', { 
          state: { 
            message: 'Contul a fost creat cu succes. Vă rugăm să vă verificați email-ul pentru confirmare.' 
          } 
        });
      } catch (err: any) {
        setError(err.response?.data?.message || 'A apărut o eroare la înregistrare');
        setSubmitting(false);
      }
    },
  });

  const handleShowPassword = () => {
    setShowPassword((show) => !show);
  };

  return (
    <AuthLayout
      title="Înregistrare"
      description="Creează-ți cont pentru a accesa platforma"
    >
      <form onSubmit={formik.handleSubmit}>
        <Stack spacing={3}>
          {error && <Alert severity="error">{error}</Alert>}

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label="Prenume"
              {...formik.getFieldProps('firstName')}
              error={formik.touched.firstName && Boolean(formik.errors.firstName)}
              helperText={formik.touched.firstName && formik.errors.firstName}
            />

            <TextField
              fullWidth
              label="Nume"
              {...formik.getFieldProps('lastName')}
              error={formik.touched.lastName && Boolean(formik.errors.lastName)}
              helperText={formik.touched.lastName && formik.errors.lastName}
            />
          </Stack>

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

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label="Telefon"
              {...formik.getFieldProps('phone')}
              error={formik.touched.phone && Boolean(formik.errors.phone)}
              helperText={formik.touched.phone && formik.errors.phone}
            />

            <TextField
              fullWidth
              label="Cod Personal"
              {...formik.getFieldProps('personalCode')}
              error={formik.touched.personalCode && Boolean(formik.errors.personalCode)}
              helperText={formik.touched.personalCode && formik.errors.personalCode}
            />
          </Stack>

          <TextField
            select
            fullWidth
            label="Tip Utilizator"
            {...formik.getFieldProps('userType')}
            error={formik.touched.userType && Boolean(formik.errors.userType)}
            helperText={formik.touched.userType && formik.errors.userType}
          >
            {userTypes.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        <Button
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          sx={{ mt: 3 }}
          disabled={formik.isSubmitting}
        >
          Înregistrare
        </Button>

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="center"
          sx={{ mt: 3 }}
        >
          <Link component={RouterLink} variant="subtitle2" to="/login">
            Ai deja cont? Autentifică-te
          </Link>
        </Stack>
      </form>
    </AuthLayout>
  );
} 
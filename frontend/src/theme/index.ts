import { createTheme, alpha } from '@mui/material/styles';

// Culori
const PRIMARY = {
  lighter: '#FFE2E2',
  light: '#FF8A80',
  main: '#D32F2F',
  dark: '#9A0007',
  darker: '#5C0011',
};

const SECONDARY = {
  lighter: '#4A4A4A',
  light: '#333333',
  main: '#212121',
  dark: '#151515',
  darker: '#000000',
};

const SUCCESS = {
  lighter: '#E8F5E9',
  light: '#69F0AE',
  main: '#00C853',
  dark: '#00963F',
  darker: '#00602A',
};

const WARNING = {
  lighter: '#FFF8E1',
  light: '#FFE57F',
  main: '#FFC107',
  dark: '#FFA000',
  darker: '#FF6F00',
};

const ERROR = {
  lighter: '#FFE7D9',
  light: '#FFA48D',
  main: '#FF4842',
  dark: '#B71C1C',
  darker: '#7A0C2E',
};

const GREY = {
  0: '#FFFFFF',
  100: '#F9FAFB',
  200: '#F4F6F8',
  300: '#DFE3E8',
  400: '#C4CDD5',
  500: '#919EAB',
  600: '#637381',
  700: '#454F5B',
  800: '#212B36',
  900: '#161C24',
};

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: PRIMARY,
    secondary: SECONDARY,
    success: SUCCESS,
    warning: WARNING,
    error: ERROR,
    grey: GREY,
    divider: alpha(GREY[500], 0.24),
    text: {
      primary: '#FFFFFF',
      secondary: GREY[400],
      disabled: GREY[600],
    },
    background: {
      paper: '#242424',
      default: '#1E1E1E',
    },
    action: {
      active: GREY[300],
      hover: alpha(GREY[500], 0.08),
      selected: alpha(PRIMARY.lighter, 0.16),
      disabled: alpha(GREY[500], 0.8),
      disabledBackground: alpha(GREY[500], 0.24),
      focus: alpha(PRIMARY.lighter, 0.24),
      hoverOpacity: 0.08,
      disabledOpacity: 0.48,
    },
  },
  typography: {
    fontFamily: '"Rajdhani", "Roboto", sans-serif',
    h1: {
      fontWeight: 700,
      lineHeight: 80 / 64,
      fontSize: '2.5rem',
      letterSpacing: 2,
      background: `linear-gradient(45deg, ${PRIMARY.main}, ${PRIMARY.light})`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    h2: {
      fontWeight: 700,
      lineHeight: 64 / 48,
      fontSize: '2rem',
      letterSpacing: 1.5,
    },
    h3: {
      fontWeight: 700,
      lineHeight: 1.5,
      fontSize: '1.75rem',
      letterSpacing: 1,
    },
    h4: {
      fontWeight: 700,
      lineHeight: 1.5,
      fontSize: '1.5rem',
      letterSpacing: 0.8,
    },
    h5: {
      fontWeight: 600,
      lineHeight: 1.5,
      fontSize: '1.25rem',
      letterSpacing: 0.5,
    },
    h6: {
      fontWeight: 600,
      lineHeight: 28 / 18,
      fontSize: '1.125rem',
      letterSpacing: 0.3,
    },
    subtitle1: {
      lineHeight: 1.5,
      fontSize: '1rem',
      letterSpacing: 0.2,
    },
    subtitle2: {
      fontWeight: 600,
      lineHeight: 22 / 14,
      fontSize: '0.875rem',
    },
    body1: {
      lineHeight: 1.5,
      fontSize: '1rem',
    },
    body2: {
      lineHeight: 22 / 14,
      fontSize: '0.875rem',
    },
    caption: {
      lineHeight: 1.5,
      fontSize: '0.75rem',
    },
    overline: {
      fontWeight: 600,
      lineHeight: 1.5,
      fontSize: '0.75rem',
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    button: {
      fontWeight: 600,
      lineHeight: 24 / 14,
      fontSize: '0.875rem',
      textTransform: 'none',
      letterSpacing: 0.4,
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0 2px 4px rgba(0,0,0,0.2)',
    '0 4px 8px rgba(0,0,0,0.2)',
    '0 8px 16px rgba(0,0,0,0.2)',
    '0 12px 24px rgba(0,0,0,0.2)',
    '0 16px 32px rgba(0,0,0,0.2)',
    '0 20px 40px rgba(0,0,0,0.2)',
    '0 24px 48px rgba(0,0,0,0.2)',
    '0 28px 56px rgba(0,0,0,0.2)',
    '0 32px 64px rgba(0,0,0,0.2)',
    '0 36px 72px rgba(0,0,0,0.2)',
    '0 40px 80px rgba(0,0,0,0.2)',
    '0 44px 88px rgba(0,0,0,0.2)',
    '0 48px 96px rgba(0,0,0,0.2)',
    '0 52px 104px rgba(0,0,0,0.2)',
    '0 56px 112px rgba(0,0,0,0.2)',
    '0 60px 120px rgba(0,0,0,0.2)',
    '0 64px 128px rgba(0,0,0,0.2)',
    '0 68px 136px rgba(0,0,0,0.2)',
    '0 72px 144px rgba(0,0,0,0.2)',
    '0 76px 152px rgba(0,0,0,0.2)',
    '0 80px 160px rgba(0,0,0,0.2)',
    '0 84px 168px rgba(0,0,0,0.2)',
    '0 88px 176px rgba(0,0,0,0.2)',
    '0 92px 184px rgba(0,0,0,0.2)',
  ],
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(45deg, #242424 30%, #2E2E2E 90%)',
          boxShadow: '0 3px 5px 2px rgba(211, 47, 47, .1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
        contained: {
          boxShadow: '0 3px 5px 2px rgba(211, 47, 47, .1)',
          '&:hover': {
            boxShadow: '0 5px 8px 2px rgba(211, 47, 47, .2)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'linear-gradient(45deg, rgba(40,40,40,0.8) 0%, rgba(50,50,50,0.8) 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(211, 47, 47, 0.1)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: 'linear-gradient(45deg, #242424 30%, #2E2E2E 90%)',
          borderRight: '1px solid rgba(211, 47, 47, 0.1)',
        },
      },
    },
  },
});

export default theme; 
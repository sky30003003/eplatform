import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, GlobalStyles } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import { BrowserRouter } from 'react-router-dom';

import { AuthProvider } from './contexts/AuthContext';
import Router from './routes';
import theme from './theme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

const globalStyles = {
  '*': {
    margin: 0,
    padding: 0,
    boxSizing: 'border-box',
  },
  html: {
    width: '100%',
    height: '100%',
    WebkitOverflowScrolling: 'touch',
  },
  body: {
    width: '100%',
    height: '100%',
  },
  '#root': {
    width: '100%',
    height: '100%',
  },
  input: {
    '&[type=number]': {
      MozAppearance: 'textfield',
      '&::-webkit-outer-spin-button': {
        margin: 0,
        WebkitAppearance: 'none',
      },
      '&::-webkit-inner-spin-button': {
        margin: 0,
        WebkitAppearance: 'none',
      },
    },
  },
  img: {
    display: 'block',
    maxWidth: '100%',
  },
  ul: {
    margin: 0,
    padding: 0,
  },
};

export default function App() {
  return (
    <BrowserRouter>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={theme}>
            <GlobalStyles styles={globalStyles} />
            <CssBaseline />
            <SnackbarProvider
              maxSnack={3}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <AuthProvider>
                <Router />
              </AuthProvider>
            </SnackbarProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </BrowserRouter>
  );
}

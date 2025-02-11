import { styled } from '@mui/material/styles';
import { Box, Typography, Container } from '@mui/material';

const StyledRoot = styled('div')(({ theme }) => ({
  display: 'flex',
  minHeight: '100vh',
  overflow: 'hidden',
}));

const StyledContent = styled('div')(({ theme }) => ({
  width: '100%',
  maxWidth: 480,
  margin: 'auto',
  display: 'flex',
  minHeight: '100vh',
  flexDirection: 'column',
  padding: theme.spacing(12, 0),
  backgroundColor: theme.palette.background.default,
}));

const StyledBackground = styled('div')(({ theme }) => ({
  flexGrow: 1,
  display: 'none',
  position: 'relative',
  [theme.breakpoints.up('md')]: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    background: `linear-gradient(135deg, 
      ${theme.palette.primary.main} 0%, 
      ${theme.palette.primary.dark} 100%)`,
    padding: theme.spacing(12, 0),
  },
}));

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export default function AuthLayout({ children, title, description }: AuthLayoutProps) {
  return (
    <StyledRoot>
      <Container component="main" sx={{ flexShrink: 0 }}>
        <StyledContent>
          <Box sx={{ px: 4, mb: 5, textAlign: 'center' }}>
            {title && (
              <Typography variant="h4" gutterBottom sx={{ mb: 2, color: 'text.primary', fontWeight: 700 }}>
                {title}
              </Typography>
            )}
            {description && (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {description}
              </Typography>
            )}
          </Box>

          <Box sx={{ px: 4 }}>
            {children}
          </Box>
        </StyledContent>
      </Container>

      <StyledBackground>
        <Box sx={{ p: 3, textAlign: 'center', color: 'common.white' }}>
          <Typography variant="h3" sx={{ mb: 2, fontWeight: 700 }}>
            ePlatform
          </Typography>
          <Typography variant="h6" sx={{ maxWidth: 480, mx: 'auto' }}>
            Platforma pentru semnături electronice avansate
          </Typography>
        </Box>
      </StyledBackground>
    </StyledRoot>
  );
} 
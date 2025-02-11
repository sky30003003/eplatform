import { Link as RouterLink } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { Button, Typography, Container, Box } from '@mui/material';

const StyledContent = styled('div')(({ theme }) => ({
  maxWidth: 480,
  margin: 'auto',
  minHeight: '100vh',
  display: 'flex',
  justifyContent: 'center',
  flexDirection: 'column',
  padding: theme.spacing(12, 0),
}));

export default function NotFoundPage() {
  return (
    <Container>
      <StyledContent>
        <Typography variant="h3" paragraph>
          Pagina nu a fost găsită!
        </Typography>

        <Typography sx={{ color: 'text.secondary' }}>
          Ne pare rău, dar pagina pe care încercați să o accesați nu există.
        </Typography>

        <Box
          component="img"
          src="/assets/illustrations/404.svg"
          sx={{ height: 260, mx: 'auto', my: { xs: 5, sm: 10 } }}
        />

        <Button to="/" size="large" variant="contained" component={RouterLink}>
          Înapoi la pagina principală
        </Button>
      </StyledContent>
    </Container>
  );
} 
import { Container, Typography, Grid, Paper, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon 
} from '@mui/icons-material';

interface StatCardProps {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ title, value, description, icon, color }: StatCardProps) {
  return (
    <Paper
      sx={{
        p: 3,
        height: '100%',
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: (theme) => theme.shadows[3],
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: `${color}.lighter`,
            color: `${color}.main`,
            mr: 2,
          }}
        >
          {icon}
        </Box>
        <Typography variant="h6" sx={{ color: 'text.primary' }}>
          {title}
        </Typography>
      </Box>
      <Typography variant="h3" sx={{ mb: 1, color: 'text.primary' }}>
        {value}
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {description}
      </Typography>
    </Paper>
  );
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const stats = [
    {
      title: t('dashboard.cards.pendingDocuments.title'),
      value: 0,
      description: t('dashboard.cards.pendingDocuments.description'),
      icon: <DescriptionIcon />,
      color: 'warning'
    },
    {
      title: t('dashboard.cards.signedDocuments.title'),
      value: 0,
      description: t('dashboard.cards.signedDocuments.description'),
      icon: <CheckCircleIcon />,
      color: 'success'
    },
    {
      title: t('dashboard.cards.rejectedDocuments.title'),
      value: 0,
      description: t('dashboard.cards.rejectedDocuments.description'),
      icon: <CancelIcon />,
      color: 'error'
    },
  ];

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 5 }}>
        {t('dashboard.welcome', { name: user?.firstName })}
      </Typography>

      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid key={index} item xs={12} md={6} lg={4}>
            <StatCard {...stat} />
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 5 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          {t('dashboard.recentActivity.title')}
        </Typography>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            {t('dashboard.recentActivity.noActivity')}
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
} 
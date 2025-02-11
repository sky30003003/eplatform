import { Box, Typography, Link } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

interface PageFooterProps {
  version?: string;
  showLinks?: boolean;
}

const StyledFooter = styled(Box)(({ theme }) => ({
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  height: '64px',
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  boxShadow: '0px -2px 4px rgba(0, 0, 0, 0.1)',
  zIndex: theme.zIndex.appBar,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    opacity: 0.5,
    background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`
  }
}));

const StyledLink = styled(Link)(({ theme }) => ({
  ...theme.typography.subtitle2,
  fontWeight: 400,
  textDecoration: 'none',
  '&:hover': {
    textDecoration: 'underline'
  }
}));

export const PageFooter = ({ version = ''/*'v1.0.0'*/, showLinks = true }: PageFooterProps) => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <StyledFooter>
      <Typography variant="subtitle2">
        ePlatform
      </Typography>

      {showLinks && (
        <Box sx={{ display: 'flex', gap: 3 }}>
          <StyledLink href="#" color="inherit">
            {t('footer.terms')}
          </StyledLink>
          <StyledLink href="#" color="inherit">
            {t('footer.privacy')}
          </StyledLink>
          <StyledLink href="#" color="inherit">
            {t('footer.contact')}
          </StyledLink>
        </Box>
      )}

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Typography variant="caption" color="text.secondary">
          {version}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          powered by ePlatform ®
        </Typography>
      </Box>
    </StyledFooter>
  );
}; 
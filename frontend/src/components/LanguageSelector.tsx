import { IconButton, Typography } from '@mui/material';
import { Language as LanguageIcon } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const languages = ['ro', 'en'] as const;

export default function LanguageSelector() {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

  useEffect(() => {
    setCurrentLanguage(i18n.language);
  }, [i18n.language]);

  const toggleLanguage = async () => {
    try {
      const nextLang = currentLanguage === 'ro' ? 'en' : 'ro';
      await i18n.changeLanguage(nextLang);
      setCurrentLanguage(nextLang);
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  return (
    <IconButton
      onClick={toggleLanguage}
      color="inherit"
      size="large"
      sx={{ position: 'relative' }}
    >
      <LanguageIcon />
      <Typography
        variant="caption"
        sx={{
          position: 'absolute',
          right: -2,
          bottom: -2,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          borderRadius: '4px',
          px: 0.5,
          fontSize: '0.7rem',
          textTransform: 'uppercase',
          fontWeight: 'bold',
        }}
      >
        {currentLanguage}
      </Typography>
    </IconButton>
  );
} 
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Configurație necesară pentru fiecare mediu
const requiredConfig = {
  development: {
    VITE_API_URL: (value) => value.startsWith('http://localhost'),
    VITE_APP_NAME: (value) => value.length > 0,
    VITE_APP_VERSION: (value) => /^\d+\.\d+\.\d+$/.test(value),
    VITE_ENABLE_AUTH: (value) => ['true', 'false'].includes(value),
    VITE_NODE_ENV: (value) => value === 'development',
    VITE_DEFAULT_LANGUAGE: (value) => ['ro', 'en'].includes(value),
    VITE_AVAILABLE_LANGUAGES: (value) => value.split(',').every(lang => ['ro', 'en'].includes(lang)),
    VITE_CACHE_TTL: (value) => !isNaN(value) && parseInt(value) > 0,
    VITE_API_TIMEOUT: (value) => !isNaN(value) && parseInt(value) > 0,
  },
  production: {
    VITE_API_URL: (value) => value.startsWith('https://'),
    VITE_APP_NAME: (value) => value.length > 0,
    VITE_APP_VERSION: (value) => /^\d+\.\d+\.\d+$/.test(value),
    VITE_ENABLE_AUTH: (value) => ['true', 'false'].includes(value),
    VITE_NODE_ENV: (value) => value === 'production',
    VITE_ANALYTICS_ID: (value) => value.length > 0,
    VITE_SENTRY_DSN: (value) => value.length > 0,
    VITE_DEFAULT_LANGUAGE: (value) => ['ro', 'en'].includes(value),
    VITE_AVAILABLE_LANGUAGES: (value) => value.split(',').every(lang => ['ro', 'en'].includes(lang)),
    VITE_CACHE_TTL: (value) => !isNaN(value) && parseInt(value) > 0,
    VITE_API_TIMEOUT: (value) => !isNaN(value) && parseInt(value) > 0,
    VITE_CSP_ENABLED: (value) => ['true', 'false'].includes(value),
    VITE_HSTS_ENABLED: (value) => ['true', 'false'].includes(value),
  }
};

function validateConfig(env, config) {
  const errors = [];
  const warnings = [];

  // Verifică variabilele necesare
  Object.entries(requiredConfig[env]).forEach(([key, validator]) => {
    if (!(key in config)) {
      errors.push(`Lipsește variabila obligatorie: ${key}`);
    } else if (!validator(config[key])) {
      errors.push(`Valoare invalidă pentru ${key}: ${config[key]}`);
    }
  });

  // Verificări specifice pentru producție
  if (env === 'production') {
    if (config.VITE_API_URL.includes('yourdomain.com')) {
      errors.push('VITE_API_URL conține încă valoarea default "yourdomain.com"');
    }
    if (config.VITE_ANALYTICS_ID === 'your_analytics_id') {
      warnings.push('VITE_ANALYTICS_ID folosește valoarea default');
    }
    if (config.VITE_SENTRY_DSN === 'your_sentry_dsn') {
      warnings.push('VITE_SENTRY_DSN folosește valoarea default');
    }
  }

  return { errors, warnings };
}

function main() {
  const environments = ['development', 'production'];
  let hasErrors = false;

  environments.forEach(env => {
    console.log(`\n🔍 Verificare configurație ${env}...`);
    
    const configPath = path.resolve(__dirname, `../config/${env}/frontend.env`);
    if (!fs.existsSync(configPath)) {
      console.error(`❌ Fișierul de configurare pentru ${env} nu există!`);
      hasErrors = true;
      return;
    }

    const config = dotenv.parse(fs.readFileSync(configPath));
    const { errors, warnings } = validateConfig(env, config);

    if (errors.length > 0) {
      console.error('\n❌ Erori găsite:');
      errors.forEach(error => console.error(`  - ${error}`));
      hasErrors = true;
    }

    if (warnings.length > 0) {
      console.warn('\n⚠️  Avertismente:');
      warnings.forEach(warning => console.warn(`  - ${warning}`));
    }

    if (errors.length === 0 && warnings.length === 0) {
      console.log('✅ Configurație validă!');
    }
  });

  process.exit(hasErrors ? 1 : 0);
}

main(); 
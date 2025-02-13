module.exports = {
  apps: [
    {
      name: 'eplatform-backend',
      cwd: './backend',
      script: 'dist/main.js',
      env: {
        NODE_ENV: 'production',
        TYPEORM_MIGRATIONS: 'false',
        TYPEORM_MIGRATIONS_RUN: 'false'
      },
      env_development: {
        NODE_ENV: 'development',
      },
    },
    {
      name: 'eplatform-frontend',
      cwd: './frontend/dist',
      script: 'serve',
      args: '-s . -l 5173',
      env: {
        NODE_ENV: 'production',
      },
      env_development: {
        NODE_ENV: 'development',
      },
    },
  ],
}; 
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
      }
    },
    {
      name: 'eplatform-frontend',
      cwd: './frontend/dist',
      script: 'npx',
      args: ['http-server', '.', '-p', '5173', '--cors', '-a', '127.0.0.1'],
      interpreter: 'none',
      env: {
        NODE_ENV: 'production',
        PATH: '/home/ubuntu/.nvm/versions/node/v20.18.3/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin'
      }
    }
  ]
}; 
module.exports = {
  apps: [
    {
      name: 'eplatform-backend',
      cwd: './backend',
      script: 'npm',
      args: 'run start:dev',
      env: {
        NODE_ENV: 'development'
      }
    },
    {
      name: 'eplatform-frontend',
      cwd: './frontend',
      script: 'npm',
      args: 'run dev',
      env: {
        NODE_ENV: 'development'
      }
    }
  ]
}; 
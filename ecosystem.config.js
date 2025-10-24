/**
 * PM2 Ecosystem Configuration
 * 
 * DESARROLLO (puertos 3000-3001):
 *   Backend: npm run dev (en carpeta ./backend)
 *   Frontend: npm run dev (en carpeta ./frontend)
 * 
 * PRODUCCIÓN (puertos 3002-3003):
 *   Backend: pm2 (desde carpeta ./backend-prod - copiado por deploy.sh)
 *   Frontend: pm2 (desde carpeta ./frontend-prod - copiado por deploy.sh)
 *   Comando: ./deploy.sh (que ejecuta pm2 start ecosystem.config.js --env production)
 * 
 * NOTA: Las carpetas *-prod son generadas automáticamente por deploy.sh
 */

module.exports = {
  apps: [
    // ==========================================
    // BACKEND API
    // ==========================================
    {
      name: 'municipal-backend-prod',
      script: 'src/server.js',
      cwd: './backend-prod',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Variables de DESARROLLO
      env: {
        NODE_ENV: 'development',
        PORT: 3001,
        DATABASE_URL: 'postgresql://municipal_user:municipal_password@localhost:5433/municipal_db',
        JWT_SECRET: 'dev-secret-key-minimum-32-characters-long',
        JWT_EXPIRES_IN: '7d',
        CORS_ORIGIN: 'http://localhost:3000,http://127.0.0.1:3000',
        MAX_FILE_SIZE: 10485760,
        UPLOAD_DIR: './public/uploads',
        LOG_LEVEL: 'debug'
      },
      
      // Variables de PRODUCCIÓN (usa misma DB que desarrollo)
      env_production: {
        NODE_ENV: 'production',
        PORT: 3003,
        DATABASE_URL: 'postgresql://municipal_user:municipal_password@localhost:5433/municipal_db',
        JWT_SECRET: 'your-super-secret-jwt-key-change-in-production-minimum-32-characters',
        JWT_EXPIRES_IN: '7d',
        CORS_ORIGIN: 'http://147.93.184.19:3002,http://localhost:3002',
        MAX_FILE_SIZE: 10485760,
        UPLOAD_DIR: './public/uploads',
        RATE_LIMIT_WINDOW_MS: 900000,
        RATE_LIMIT_MAX_REQUESTS: 100,
        LOG_LEVEL: 'info'
      }
    },
    
    // ==========================================
    // FRONTEND (Next.js)
    // ==========================================
    {
      name: 'municipal-frontend-prod',
      script: 'node_modules/.bin/next',
      args: 'start',
      cwd: './frontend-prod',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Variables de DESARROLLO
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
        NEXT_PUBLIC_API_URL: 'http://localhost:3001/api'
      },
      
      // Variables de PRODUCCIÓN
      env_production: {
        NODE_ENV: 'production',
        PORT: 3002,
        NEXT_PUBLIC_API_URL: 'http://147.93.184.19:3003/api'
      }
    }
  ]
};

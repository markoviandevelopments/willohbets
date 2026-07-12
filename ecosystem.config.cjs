/**
 * PM2 process file for WillohBets UI + agent HTTP API.
 *
 * UI uses `vite preview` (static production build), not `vite` dev.
 * Dev mode + wallet-adapter deps often exceeds 512MB and PM2 was
 * killing/restarting the process every ~30s via max_memory_restart.
 *
 * Usage:
 *   cd ~/Desktop/willohbets
 *   npm run pm2:start
 *   npm run pm2:api
 *   pm2 logs willohbets
 *   pm2 restart willohbets
 */
const path = require('path')

const appDir = path.join(__dirname, 'app')
const apiDir = path.join(__dirname, 'api')
const viteBin = path.join(appDir, 'node_modules', 'vite', 'bin', 'vite.js')

module.exports = {
  apps: [
    {
      name: 'willohbets',
      cwd: appDir,
      script: viteBin,
      // Serve pre-built dist/ (run `npm run build` in app/ before start)
      args: 'preview --host 0.0.0.0 --port 5173 --strictPort',
      interpreter: 'node',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      // Do NOT set a low max_memory_restart — Vite/wallet stack is heavy.
      // Only restart on crash, not on memory.
      min_uptime: '5s',
      max_restarts: 20,
      restart_delay: 2000,
      env: {
        NODE_ENV: 'production',
        HOST: '0.0.0.0',
        PORT: '5173',
      },
      error_file: path.join(__dirname, 'logs', 'willohbets-error.log'),
      out_file: path.join(__dirname, 'logs', 'willohbets-out.log'),
      merge_logs: true,
      time: true,
    },
    {
      name: 'willohbets-api',
      cwd: apiDir,
      script: 'server.mjs',
      interpreter: 'node',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      min_uptime: '5s',
      max_restarts: 20,
      restart_delay: 2000,
      env: {
        NODE_ENV: 'production',
        HOST: '0.0.0.0',
        PORT: '5180',
      },
      error_file: path.join(__dirname, 'logs', 'willohbets-api-error.log'),
      out_file: path.join(__dirname, 'logs', 'willohbets-api-out.log'),
      merge_logs: true,
      time: true,
    },
  ],
}

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { handleApiRequests } from './server/authHandler.js'

function apiAuthPlugin() {
  return {
    name: 'birthday-auth-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        handleApiRequests(req, res, next);
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        handleApiRequests(req, res, next);
      });
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), apiAuthPlugin()],
  server: {
    port: 5173,
    host: true
  }
})

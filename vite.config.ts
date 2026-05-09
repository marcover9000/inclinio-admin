import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// Configuració de Vite. Permet que nginx faci de proxy
// des d'admin.inclinio.localhost cap a aquest dev server.
export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    hmr: {
      // El navegador es connecta via admin.inclinio.localhost (port 80),
      // i nginx fa proxy WebSocket cap aquí.
      host: 'admin.inclinio.localhost',
      clientPort: 80,
    },
    // Llista d'hosts que Vite accepta com a `Host` header.
    allowedHosts: ['admin.inclinio.localhost', 'localhost'],
  },
});

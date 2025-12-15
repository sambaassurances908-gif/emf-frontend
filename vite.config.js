import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        port: 3000,
        host: true, // ✅ Permet l'accès depuis l'extérieur
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:8000', // ✅ IPv4 au lieu de localhost (::1)
                changeOrigin: true,
                secure: false,
                rewrite: function (path) { return path.replace(/^\/api/, '/api'); }, // ✅ Garde /api intact
            },
        },
    },
});

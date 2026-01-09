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
    build: {
        rollupOptions: {
            output: {
                manualChunks: function (id) {
                    // Séparer les vendors React
                    if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router')) {
                        return 'react-vendor';
                    }
                    // Séparer les bibliothèques de formulaires
                    if (id.includes('node_modules/react-hook-form') || id.includes('node_modules/@hookform') || id.includes('node_modules/zod')) {
                        return 'form-vendor';
                    }
                    // Séparer les bibliothèques de requêtes
                    if (id.includes('node_modules/@tanstack/react-query') || id.includes('node_modules/axios')) {
                        return 'query-vendor';
                    }
                    // Séparer les bibliothèques UI
                    if (id.includes('node_modules/lucide-react') || id.includes('node_modules/react-hot-toast')) {
                        return 'ui-vendor';
                    }
                    // Séparer les bibliothèques de PDF
                    if (id.includes('node_modules/jspdf') || id.includes('node_modules/html2canvas')) {
                        return 'pdf-vendor';
                    }
                    // Séparer les features par EMF
                    if (id.includes('src/features/contrats/bamboo')) {
                        return 'bamboo-features';
                    }
                    if (id.includes('src/features/contrats/bceg')) {
                        return 'bceg-features';
                    }
                    if (id.includes('src/features/contrats/cofidec')) {
                        return 'cofidec-features';
                    }
                    if (id.includes('src/features/contrats/edg')) {
                        return 'edg-features';
                    }
                    if (id.includes('src/features/contrats/sodec')) {
                        return 'sodec-features';
                    }
                    if (id.includes('src/features/contrats/agrpro')) {
                        return 'agrpro-features';
                    }
                    if (id.includes('src/features/contrats/ariane')) {
                        return 'ariane-features';
                    }
                    if (id.includes('src/features/contrats/cofiga')) {
                        return 'cofiga-features';
                    }
                    if (id.includes('src/features/contrats/finam')) {
                        return 'finam-features';
                    }
                },
            },
        },
        chunkSizeWarningLimit: 1500,
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

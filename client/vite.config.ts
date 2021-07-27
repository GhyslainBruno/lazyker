import { defineConfig } from 'vite'
import reactRefresh from '@vitejs/plugin-react-refresh'

// https://vitejs.dev/config/
export default defineConfig(
    {
        plugins: [reactRefresh()],
        build: {
            outDir: '../backend/src/client_build'
        },
        server: {
            proxy: {
                '/api': 'http://localhost:80/',
            }
        }
    })

import { defineConfig } from 'vite'
import reactRefresh from '@vitejs/plugin-react-refresh'

// https://vitejs.dev/config/
export default defineConfig(
  {
    plugins: [reactRefresh()],
    server: {
      proxy: {
        '/api': 'http://localhost:80/',
      }
    },
    resolve: {
      alias: [
        {
          find: /^@material-ui\/icons\/(.*)/,
          replacement: "@material-ui/icons/esm/$1",
        },
        {
          find: /^@material-ui\/core\/(.+)/,
          replacement: "@material-ui/core/es/$1",
        },
        {
          find: /^@material-ui\/core$/,
          replacement: "@material-ui/core/es",
        },
      ],
    },
    define: {
      global: "window", // fix for packages that support both node and browser
    },
  })

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { multiplayerDbPlugin } from './server/multiplayerDbPlugin.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    multiplayerDbPlugin()
  ],
  server: {
    host: true, // Exposes on local network so phones & other PCs can connect!
    port: 5173
  }
})

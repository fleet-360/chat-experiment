import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: true, // זה חושף את הפרויקט לרשת המקומית באופן אוטומטי
    port: 5173  // אפשר גם לקבע את הפורט כאן
  },
  plugins: [react(), tailwindcss()],
});

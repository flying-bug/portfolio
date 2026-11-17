import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' để chạy được cả ở user page (username.github.io)
// lẫn project page (username.github.io/ten-repo/).
export default defineConfig({
  plugins: [react()],
  base: './',
});

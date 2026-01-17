
  import { defineConfig } from 'vite';
  import react from '@vitejs/plugin-react-swc';
  import path from 'path';

  export default defineConfig({
    base: '/', // Base path for subdomain root
    publicDir: 'public', // Public directory for static assets
    plugins: [react()],
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      alias: {
        'stripe@14': 'stripe',
        'sonner@2.0.3': 'sonner',
        'react-hook-form@7.55.0': 'react-hook-form',
        'figma:asset/fbe4a14cf5d44a010ee412e3ad47c73a19a36ec6.png': path.resolve(__dirname, './src/assets/fbe4a14cf5d44a010ee412e3ad47c73a19a36ec6.png'),
        'figma:asset/f5bdca4d5226ab1536d27612a5a40bd8d39dfd9d.png': path.resolve(__dirname, './src/assets/f5bdca4d5226ab1536d27612a5a40bd8d39dfd9d.png'),
        'figma:asset/7efdab81926021083de6800ae3bf3ef54ab97a54.png': path.resolve(__dirname, './src/assets/7efdab81926021083de6800ae3bf3ef54ab97a54.png'),
        '@radix-ui/react-dialog@1.1.6': '@radix-ui/react-dialog',
        '@jsr/supabase__supabase-js@2.49.8': '@jsr/supabase__supabase-js',
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      target: 'esnext',
      outDir: 'dist',
    },
    server: {
      port: 3000,
      open: true,
    },
  });
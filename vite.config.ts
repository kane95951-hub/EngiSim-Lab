import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Le site est servi sous https://<utilisateur>.github.io/EngiSim-Lab/
// Le préfixe "base" doit donc correspondre exactement au nom du dépôt.
export default defineConfig({
  base: '/EngiSim-Lab/',
  plugins: [react()],
  test: {
    environment: 'node',
  },
})
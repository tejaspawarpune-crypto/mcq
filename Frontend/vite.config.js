// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import tailwindcss from '@tailwindcss/vite'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [
//     react(),
//     tailwindcss(),
//   ],
//   // --- ADD THIS ENTIRE 'server' BLOCK ---
//   server: {
//     proxy: {
//       // This tells Vite to forward any request starting with '/api' 
//       // to your backend server running on port 5000.
//       '/api': {
//         target: 'http://localhost:5000',
//         changeOrigin: true,
//       },
//     }
//   }
// })

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})

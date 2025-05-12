import { defineConfig } from 'vite'

// export default defineConfig({
//   root: 'src',
//   build: {
//     outDir: '../dist',
//     emptyOutDir: true,
//     rollupOptions: {
//       input: {
//         content: './index.js'
//         // hier kannst du popup.html oder andere Dateien hinzufügen
//       },
//       output: {
//         entryFileNames: 'aiservice.js'
//       }
//     }
//   }
// });
export default {
  build: {
    target: 'esnext',
    lib: {
      entry: './index.js', // oder dein Einstiegspunkt
      formats: ['es'],
      fileName: () => 'aiservice.js'
    }
  }
}

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

// Build de DEMONSTRAÇÃO apenas — gera um único arquivo HTML autocontido
// (JS + CSS inline, sem chamadas de rede para /api/dados) a partir de um
// instantâneo real da planilha (src/data/dataset-preview.json), para que o
// painel possa ser aberto diretamente em um navegador sem servidor/backend.
// Não usar em produção: a integração ao vivo com o Google Forms exige a
// Netlify Function (ver `npm run build` e docs/integracao-google-forms.md).
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  resolve: {
    alias: {
      "@": "/src",
      // Troca o carregador com import() dinâmico (code-splitting, usado na
      // build de produção) pela variante com import estático — evita que o
      // helper de preload do Vite construa uma URL relativa em tempo de
      // execução (new URL(caminho, import.meta.url)), o que lança
      // "TypeError: Failed to construct 'URL': Invalid URL" quando o HTML é
      // renderizado num contexto sem base URL válida (ex.: iframe srcdoc).
      "../components/MapaMunicipiosCarregador": "/src/components/MapaMunicipiosCarregador.demo.tsx",
    },
  },
  define: {
    "import.meta.env.VITE_MODO_DEMO": '"1"',
  },
  build: {
    outDir: "dist-demo",
    assetsInlineLimit: 100_000_000,
    cssCodeSplit: false,
    chunkSizeWarningLimit: 5000,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});

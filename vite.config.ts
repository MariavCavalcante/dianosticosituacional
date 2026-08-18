import { defineConfig, type Plugin, type Connect } from "vite";
import react from "@vitejs/plugin-react";
import type { ServerResponse } from "node:http";

/**
 * Plugin de desenvolvimento local que expõe /api/dados usando exatamente a
 * mesma camada de transformação usada pela Netlify Function em produção
 * (netlify/functions/dados.ts -> src/lib/pipeline.ts). Isso evita duplicar
 * a lógica de leitura/limpeza/anonimização entre ambiente local e produção.
 */
function apiDadosDevPlugin(): Plugin {
  return {
    name: "api-dados-dev-middleware",
    configureServer(server) {
      server.middlewares.use("/api/dados", async (req: Connect.IncomingMessage, res: ServerResponse) => {
        try {
          const { handleDadosRequest } = await server.ssrLoadModule("/src/lib/pipeline.ts");
          const force = (req.url || "").includes("force=1");
          const result = await handleDadosRequest({ forceRefresh: force });
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.setHeader("Cache-Control", "no-store");
          res.statusCode = result.status;
          res.end(JSON.stringify(result.body));
        } catch (err) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.end(JSON.stringify({ error: "Falha ao processar dados", detail: String(err) }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), apiDadosDevPlugin()],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  server: {
    host: true,
    port: 5173,
  },
  build: {
    // Code-splitting de bibliotecas pesadas (mapa e gráficos) em chunks
    // próprios — regra 2.12 ("bom desempenho, carregamento sob demanda").
    rollupOptions: {
      output: {
        manualChunks: {
          leaflet: ["leaflet", "react-leaflet"],
          recharts: ["recharts"],
        },
      },
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
  },
});

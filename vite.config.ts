import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Plugin, ViteDevServer } from 'vite';
import type { IncomingMessage, ServerResponse } from 'http';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Vite plugin: serves /api/workbook-pdf using Puppeteer during dev
function workbookPdfPlugin(): Plugin {
  return {
    name: 'workbook-pdf',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(
        '/api/workbook-pdf',
        (req: IncomingMessage, res: ServerResponse) => {
          if (req.method !== 'POST') {
            res.statusCode = 405;
            res.end(JSON.stringify({ error: 'Method not allowed' }));
            return;
          }

          let body = '';
          req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
          req.on('end', async () => {
            let textareas: string[] = [];
            let inputs: string[] = [];
            try {
              const parsed = JSON.parse(body) as { textareas?: string[]; inputs?: string[] };
              textareas = parsed.textareas ?? [];
              inputs    = parsed.inputs    ?? [];
            } catch { /* malformed body — use empty arrays */ }

            let browser;
            try {
              const { default: puppeteer } = await import('puppeteer');
              browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
              });

              const page = await browser.newPage();
              const htmlPath = path.resolve(__dirname, 'public', 'pheydrus-workbook-v3_4.html');
              await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0', timeout: 30_000 });

              // Inject user-filled form values before rendering
              if (textareas.length > 0 || inputs.length > 0) {
                await page.evaluate(
                  ({ taValues, inValues }: { taValues: string[]; inValues: string[] }) => {
                    document.querySelectorAll<HTMLTextAreaElement>('textarea').forEach((el, i) => {
                      if (taValues[i] !== undefined) el.value = taValues[i];
                    });
                    document.querySelectorAll<HTMLInputElement>('input').forEach((el, i) => {
                      if (inValues[i] !== undefined) el.value = inValues[i];
                    });
                  },
                  { taValues: textareas, inValues: inputs }
                );
              }

              const pdf = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
              });

              res.setHeader('Content-Type', 'application/pdf');
              res.setHeader('Content-Disposition', 'attachment; filename="pheydrus-workbook-v3_4.pdf"');
              res.end(pdf);
            } catch (err) {
              console.error('[workbook-pdf]', err);
              res.statusCode = 500;
              res.end(JSON.stringify({ error: String(err) }));
            } finally {
              if (browser) await browser.close().catch(() => {});
            }
          });
        }
      );
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react(), workbookPdfPlugin()],
  optimizeDeps: {
    exclude: ['sweph-wasm'],
  },
});

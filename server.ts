import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { chatRouter } from './server/routes/chat.js';
import { modelsRouter } from './server/routes/models.js';
import { providersRouter } from './server/routes/providers.js';
import { localRouter } from './server/routes/local.js';
import { preferencesRouter } from './server/routes/preferences.js';
import { feedbackRouter } from './server/routes/feedback.js';
import { compareRouter } from './server/routes/compare.js';
import { conversationsRouter } from './server/routes/conversations.js';
import { filesRouter } from './server/routes/files.js';
import { usageRouter } from './server/routes/usage.js';
import { adaptiveRouter } from './server/routes/adaptiveAi.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Mount real backend API routes
app.use('/api/chat', chatRouter);
app.use('/api/models', modelsRouter);
app.use('/api/providers', providersRouter);
app.use('/api/local', localRouter);
app.use('/api/preferences', preferencesRouter);
app.use('/api/feedback', feedbackRouter);
app.use('/api/compare', compareRouter);
app.use('/api/conversations', conversationsRouter);
app.use('/api/files', filesRouter);
app.use('/api/usage', usageRouter);
app.use('/api/adaptive', adaptiveRouter);

async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Apex Real Multi-Model AI Gateway listening on port ${PORT}`);
  });
}

startServer();

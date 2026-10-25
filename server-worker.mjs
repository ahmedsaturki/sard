
import express from "express";
import { buildConfig, getPayload } from "payload";
import config from "file:///D:/ahmed-research-lab/Bunya%20Labs/Sard/apps/lite/dist/payload.config.esm.js";

const app = express();
app.set('trust proxy', 1);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const builtConfig = await buildConfig(config.default);
const payload = await getPayload({ config: builtConfig });

const app2 = express();
app2.set('trust proxy', 1);
app2.use(express.json({ limit: '10mb' }));
app2.use(express.urlencoded({ extended: true, limit: '10mb' });

app2.use('/api', payload.router);
app2.use('/admin', payload.admin.router);
app2.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

const server = app2.listen(4321, '0.0.0.0', () => {
  console.log('[SERVER] Running on http://0.0.0.0:4321');
  console.log('[SERVER] Admin: http://0.0.0.0:4321/admin');
});

console.log('[SERVER] Server started successfully');
console.log('[SERVER] Ready for Live Preview at http://localhost:4321');

setInterval(() => {}, 1000);

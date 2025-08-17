import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createProxyMiddleware } from 'http-proxy-middleware';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'dist')));

// Proxy API requests to backend - USE DEDICATED BACKEND URL
app.use('/api', createProxyMiddleware({
    target: process.env.BACKEND_API_URL , // ← NEW VARIABLE
    timeout: 30000,        // 30 second timeout
    proxyTimeout: 30000, 
    changeOrigin: true,
    logLevel: 'info'
}));

// Proxy Socket.IO requests to backend - USE SAME BACKEND URL
app.use('/socket.io', createProxyMiddleware({
    target: process.env.BACKEND_API_URL , // ← NEW VARIABLE
    timeout: 30000,
    proxyTimeout: 30000,
    ws: true,
    changeOrigin: true,
    logLevel: 'info'
}));

// SPA fallback - serve index.html for all routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Frontend server running on port ${PORT}`);
    console.log(`Proxying to backend: ${process.env.BACKEND_API_URL}`);
});

import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import app from './src/app.js';
import { initSocket } from './src/socket.js';

const PORT = process.env.PORT || 5000;

const httpServer = http.createServer(app);

// ✅ FIX FOR CLOUDFLARE: Proper async initialization
(async () => {
  try {
    await initSocket(httpServer);
    console.log('✅ Socket.io initialized');
  } catch (error) {
    console.error('❌ Socket.io initialization failed:', error);
    process.exit(1);
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 WebSocket ready for connections`);
  });
})();
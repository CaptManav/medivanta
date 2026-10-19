import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { env } from './config/env.js';
import { corsOptions } from './config/cors.js';
import { setupSocket } from './sockets/bedSocket.js';
import { setupJobs } from './jobs/reminderJob.js';

// Route imports
import authRoutes from './routes/auth.routes.js';
import hospitalRoutes from './routes/hospital.routes.js';
import appointmentRoutes from './routes/appointment.routes.js';
import adminRoutes from './routes/admin.routes.js';
import superRoutes from './routes/super.routes.js';
import chatRoutes from './routes/chat.routes.js';

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: corsOptions,
});
setupSocket(io);

// Security & utility middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'MEDIVANTA API', time: new Date().toISOString() });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/super', superRoutes);
app.use('/api/chat', chatRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.originalUrl} not found` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Global Error Handler caught:', err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    error: err.message || 'Internal server error',
  });
});

// Initialize Cron Jobs
setupJobs();

// Start Server if directly executed
if (process.env.NODE_ENV !== 'test') {
  server.listen(env.PORT, () => {
    console.log(`===============================================`);
    console.log(`  🏥 MEDIVANTA API Server running on port ${env.PORT}`);
    console.log(`  🌐 Environment: ${env.NODE_ENV}`);
    console.log(`  🔗 Client URL: ${env.CLIENT_URL}`);
    console.log(`===============================================`);
  });
}

export { app, server, io };

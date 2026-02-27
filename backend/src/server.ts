import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getDatabase, initializeSchema } from './db/database';

// Routes
import patientsRouter from './routes/patients.routes';
import alertsRouter from './routes/alerts.routes';
import doctorsRouter from './routes/doctors.routes';
import analyticsRouter from './routes/analytics.routes';
import webhookRoutes from './routes/webhook.routes';
import triageRouter from './routes/triage.routes';

// Load environment variables
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;

// Middleware (proper order)
app.use(cors());

// Body parsing middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.path.includes('/webhook')) {
    console.log('📦 Webhook request headers:', req.headers);
    console.log('📦 Webhook request body:', req.body);
  }
  next();
});

// Initialize database
try {
  getDatabase();
  initializeSchema();
  console.log('✅ Database initialized successfully');
} catch (error) {
  console.error('❌ Database initialization failed:', error);
  process.exit(1);
}

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'HealthGuard AI Backend',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/patients', patientsRouter);
app.use('/api/alerts', alertsRouter);
app.use('/api/doctors', doctorsRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/webhook', webhookRoutes);
app.use('/api/triage', triageRouter);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'HealthGuard AI Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      patients: '/api/patients',
      alerts: '/api/alerts',
      doctors: '/api/doctors',
      analytics: '/api/analytics',
      webhook: '/api/webhook',
      triage: '/api/triage'
    }
  });
});

// 404 handler - must come after all routes
app.use((req: Request, res: Response) => {
  console.warn(`⚠️  404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ 
    error: 'Route not found',
    method: req.method,
    path: req.path,
    timestamp: new Date().toISOString()
  });
});

// Basic error handler middleware - must be last
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('❌ Server Error:', {
    message: err.message,
    stack: err.stack,
    method: req.method,
    path: req.path,
    timestamp: new Date().toISOString()
  });

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(500).json({ 
    error: 'Internal server error',
    message: isDevelopment ? err.message : 'Something went wrong',
    timestamp: new Date().toISOString(),
    ...(isDevelopment && { stack: err.stack })
  });
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 HealthGuard AI Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API Base: http://localhost:${PORT}/api`);
  console.log(`📱 WhatsApp Webhook: http://localhost:${PORT}/api/webhook/whatsapp`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import healthRoutes from './routes/health.js';
import userRoutes from './routes/users.js';
import workoutRoutes from './routes/workouts.js';
import metabolicRoutes from './routes/metabolic.js';
import nutritionRoutes from './routes/nutrition.js';
import foodRoutes from './routes/foods.js';
import onboardingRoutes from './routes/onboarding.js';
import adminRoutes from './routes/admin.js';
import messageRoutes from './routes/messages.js';
import coachRoutes from './routes/coach.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';

dotenv.config();

const app = express();

// ─── Security headers ────────────────────────────────────────────────────
app.use(helmet());

// ─── CORS: restrict to frontend origin ───────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// ─── Body parser with size limit (prevents memory exhaustion) ────────────
app.use(express.json({ limit: '2mb' }));

// ─── Rate limiting on all API routes ─────────────────────────────────────
app.use('/api', apiLimiter);

// ─── Routes ──────────────────────────────────────────────────────────────
app.use('/health', healthRoutes);
app.use('/api/users', userRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/metabolic', metabolicRoutes);
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/coach', coachRoutes);

// ─── Error handler ───────────────────────────────────────────────────────
app.use(errorHandler);

export default app;

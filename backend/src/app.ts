import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth.routes';
import checkRoutes from './routes/check.routes';
import personRoutes from './routes/person.routes';
import costRoutes from './routes/cost.routes';
import statsRoutes from './routes/stats.routes';
import transferRoutes from './routes/transfer.routes';
import groupRoutes from './routes/group.routes';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/checks', checkRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api', personRoutes);
app.use('/api', costRoutes);
app.use('/api', statsRoutes);
app.use('/api', transferRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to SplitCheck API' });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Closing HTTP server and database connection...');
  await prisma.$disconnect();
  process.exit(0);
});

export default app; 
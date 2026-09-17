import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import changelogRoutes from './routes/changelogRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// db connection
connectDB();

// middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server running' });
});

// routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/changelogs', changelogRoutes);
app.use('/api/v1/changelog', changelogRoutes); // alias for /api/v1/changelog/feed requirement

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

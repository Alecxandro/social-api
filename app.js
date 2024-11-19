import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import connectDB from './utils/dbConnection.js';
import authRoutes from './routes/authRoutes.js'
import userRoutes from './routes/userRoutes.js'
import postRoutes from './routes/postRoutes.js'
import timelineRoutes from './routes/timelineRoutes.js'

import errorHandlerMiddleware from './middlewares/errorHandlerMiddleware.js';

dotenv.config()

const app = express();

connectDB();

app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/timeline', timelineRoutes)
app.use(errorHandlerMiddleware)

export default app;
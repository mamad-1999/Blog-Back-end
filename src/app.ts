import dotenv from 'dotenv';
import path from 'path';
dotenv.config();
import express, { Response, Request } from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';

import corsOptions from './configs/corsOptions';
import credential from './middleware/credential';
import connectDB from './database/connectDB';

// Routes
import authRouter from './routes/auth';
import postRouter from './routes/post';
import userRouter from './routes/user';
import adminRouter from './routes/admin';
import uploadImageRouter from './routes/profile';
import superAdminRouter from './routes/superAdmin';
import errorController from './middleware/errorController';

const app = express();

// connect to Database
connectDB();

app.use(cookieParser());

app.use(credential);

app.use(cors(corsOptions));

app.use(express.json());

app.use(helmet());
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

app.use('/uploads', express.static(path.join(__dirname, 'src', 'uploads')));

app.use('/auth', authRouter);
app.use('/posts', postRouter);
app.use('/users', userRouter);
app.use('/admins', adminRouter);
app.use('/super-admin', superAdminRouter);
app.use('/profile', uploadImageRouter);

app.all('*', (req: Request, res: Response) => {
  res.status(404).json({ message: '404 Not Found' });
});

app.use(errorController);

export default app;

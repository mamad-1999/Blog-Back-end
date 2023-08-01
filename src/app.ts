import dotenv from "dotenv"
dotenv.config()
import express from "express";
import helmet from "helmet";
import cors from "cors";

import corsOptions from "./configs/corsOptions";
import credential from "./middleware/credential";
import connectDB from "./database/connectDB";

// Routes
import authRouter from './routes/auth';

const app = express();

// connect to Database
connectDB()

app.use(credential)

app.use(cors(corsOptions))

app.use(express.json());

app.use(helmet());
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

app.use('/auth', authRouter)

app.all("*", (req: Request, res: Response) => {
    res.status(404).json({ message: "404 Not Found" });
});

export default app;

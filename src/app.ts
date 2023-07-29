import dotenv from "dotenv"
dotenv.config()
import express from "express";
import helmet from "helmet";
import cors from "cors";

import corsOptions from "./configs/corsOptions";
import credential from "./middleware/credential";
import connectDB from "./database/connectDB";

const app = express();

// connect to Database
connectDB()

app.use(credential)

app.use(helmet());
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

app.use(cors(corsOptions))

app.use(express.json());

export default app;

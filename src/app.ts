import dotenv from "dotenv"
dotenv.config()
import express from "express";
import helmet from "helmet";
import cors from "cors";

import corsOptions from "./configs/corsOptions";
import credential from "./middleware/credential";

const app = express();

app.use(credential)

app.use(helmet());
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

app.use(cors(corsOptions))

app.use(express.json());

export default app;

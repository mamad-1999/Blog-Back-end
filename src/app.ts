import express from "express";
import helmet from "helmet";
import cors from "cors";

import corsOptions from "./configs/corsOptions";

require("dotenv").config();

const app = express();

app.use(helmet());
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

app.use(cors(corsOptions))

app.use(express.json());

export default app;

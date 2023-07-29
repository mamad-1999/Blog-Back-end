import express from "express"
import helmet from "helmet";

require("dotenv").config();

const app = express();

app.use(helmet());
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

app.use(express.json());

export default app;

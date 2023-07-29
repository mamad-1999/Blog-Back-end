import express from "express"

require("dotenv").config();

const app = express();

app.use(express.json());

export default app;

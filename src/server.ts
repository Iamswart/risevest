import dotenv from "dotenv";

dotenv.config();
import logger from "./logger";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";

import db from "./database/models/index";
import { handleError, unknownResourceError } from "./error";

import httpLogger from "./httpLogger";
import { routes } from "./routes";


const app = express();
const PORT = process.env.PORT || 3000;
app.use(helmet());

app.use(express.json());

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
});

app.use(limiter);
app.use(cors());

app.use(httpLogger);
app.use(routes);



process.on("uncaughtException", (err) => {
  logger.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  logger.error(err);
  logger.error(err.name, err.message);
  process.exit(1);
});

app.get("/actuator/health", async (request: Request, response: Response) => {
  try {
    await db.sequelize.authenticate().then(() => {
      logger.info("Connected to database!");
    });

    response.status(200).json({
      message: "Server Okay, Redis Okay and database connection OK",
      info: {
        url: `${request.protocol}://${request.hostname}${request.path}`,
      },
    });
  } catch (error) {
    response.status(500).json({
      message: "Database connection failed",
      error: error.message,
      info: {
        url: `${request.protocol}://${request.hostname}${request.path}`,
      },
    });
  }
});

app.use(function (request: Request, response: Response) {
  logger.error(`Route not found: ${request.path}`);
  throw unknownResourceError(
    `The route you are trying to reach (${request.path}) does not exist`
  );
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  handleError(err, res);
});

app.listen(PORT, () => {
  logger.info(`App is listening on port ${PORT}`);
});

import { format } from "winston";
import { Request, Response, NextFunction } from "express";
import moment from "moment";
import logger from "./logger";

const httpLogger = (req: Request, res: Response, next: NextFunction) => {
  const { method, url, headers } = req;

  const filteredHeaders = { ...headers };
  delete filteredHeaders.authorization;

  const start = process.hrtime();
  res.on("finish", () => {
    const elapsed = process.hrtime(start)[1] / 1000000;
    const responseTime = elapsed.toFixed(3);

    const ip =
      req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;

    const logData = {
      timestamp: moment().format(),
      ip,
      method,
      url,
      headers: filteredHeaders,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
    };

    logger.info("HTTP Request Log", logData);
  });

  next();
};
export default httpLogger;

import moment from "moment";
import { createLogger, format, transports } from "winston";

const { combine, timestamp, colorize, printf } = format;

const customFormat = printf(({ level, message, timestamp, stack = "" }) => {
  const ts = moment(timestamp).local().format("HH:MM:ss.SSS");
  return `${ts} ${level}: ${message} \n ${stack}`;
});

const options = {
  file: {
    level: "info",
    filename: "./logs/app.log",
    handleExceptions: true,
    json: true,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    colorize: false,
  },
  console: {
    level: "debug",
    handleExceptions: true,
    json: false,
    colorize: true,
  },
};

const localFormat = {
  level: "debug",
  transports: [
    new transports.File({
      filename: "./logs/error.log",
      level: "error",
    }),

    new transports.File(options.file),
    new transports.Console(options.console),
  ],
};

const logger = createLogger(localFormat);

export const stream = {
  write: (message: string): void => {
    logger.info(message);
  },
};

export default logger;

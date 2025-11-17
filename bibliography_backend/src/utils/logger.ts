import winston, { Logger } from 'winston';
import { config } from '../config/environment';

// Adapted from editor auth-service logger pattern

const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
  trace: 4
};

const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'cyan',
  debug: 'green',
  trace: 'magenta'
};

winston.addColors(logColors);

const jsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, service, requestId, userId, action, ...meta }) => {
    const logEntry: any = {
      timestamp,
      level,
      service: service || 'bibliography-service',
      message
    };

    if (requestId) logEntry.requestId = requestId;
    if (userId) logEntry.userId = userId;
    if (action) logEntry.action = action;

    Object.assign(logEntry, meta);
    return JSON.stringify(logEntry);
  })
);

const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, service, requestId, userId, action, ...meta }) => {
    let log = `${timestamp} [${level}] ${service || 'bibliography-service'}`;

    if (requestId) log += ` [${requestId}]`;
    if (userId) log += ` [user:${userId}]`;
    if (action) log += ` [${action}]`;

    log += `: ${message}`;

    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }

    return log;
  })
);

const createLogger = (): Logger => {
  const isTestEnv = config.nodeEnv === 'test' || process.env.JEST_WORKER_ID !== undefined;
  const transports: winston.transport[] = [];

  if (config.nodeEnv !== 'production' && !isTestEnv) {
    transports.push(
      new winston.transports.Console({
        format: consoleFormat,
        level: 'debug'
      })
    );
  }

  // In test environment, only log errors to console
  if (isTestEnv) {
    transports.push(
      new winston.transports.Console({
        format: consoleFormat,
        level: 'error',
        silent: false // Set to true to completely silence logs in tests
      })
    );
  }

  if (config.nodeEnv === 'production') {
    transports.push(
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        format: jsonFormat,
        maxsize: 5242880,
        maxFiles: 5
      })
    );

    transports.push(
      new winston.transports.File({
        filename: 'logs/combined.log',
        format: jsonFormat,
        maxsize: 5242880,
        maxFiles: 5
      })
    );
  }

  return winston.createLogger({
    level: 'debug',
    levels: logLevels,
    format: jsonFormat,
    transports,
    exitOnError: false
  });
};

const logger = createLogger();

export interface ApplicationLogContext {
  requestId?: string;
  userId?: string;
  component?: string;
  method?: string;
  duration?: number;
  metadata?: any;
  ip?: string;
  url?: string;
  error?: Error | string;
  action?: string;
  referenceId?: string;
  collectionId?: string;
  tagName?: string;
  [key: string]: any; // Allow any additional fields
}

export class ApplicationLogger {
  static info(message: string, context?: ApplicationLogContext): void {
    logger.info(message, { ...context, category: 'APPLICATION' });
  }

  static error(message: string, error?: Error, context?: ApplicationLogContext): void {
    logger.error(message, {
      ...context,
      error: error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : undefined,
      category: 'APPLICATION'
    });
  }

  static warn(message: string, context?: ApplicationLogContext): void {
    logger.warn(message, { ...context, category: 'APPLICATION' });
  }

  static debug(message: string, context?: ApplicationLogContext): void {
    logger.debug(message, { ...context, category: 'APPLICATION' });
  }

  static httpRequest(method: string, url: string, statusCode: number, duration: number, context?: ApplicationLogContext): void {
    logger.info('HTTP Request', {
      ...context,
      method,
      url,
      statusCode,
      duration,
      category: 'HTTP'
    });
  }
}

export const requestLogger = (req: any, res: any, next: any) => {
  const startTime = Date.now();
  const requestId = req.id || Math.random().toString(36).substring(7);

  req.requestId = requestId;

  ApplicationLogger.info('Request started', {
    requestId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    component: 'HTTP_REQUEST'
  });

  const originalEnd = res.end;
  res.end = function(...args: any[]) {
    const duration = Date.now() - startTime;

    ApplicationLogger.httpRequest(
      req.method,
      req.originalUrl,
      res.statusCode,
      duration,
      {
        requestId,
        userId: req.user?.id,
        ip: req.ip
      }
    );

    originalEnd.apply(this, args);
  };

  next();
};

export { logger };
export default logger;

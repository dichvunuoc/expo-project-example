/**
 * Secure Logger Utility
 * Replaces console.log for production safety and better debugging
 */

// Types for logger
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: any;
  stack?: string;
  component?: string;
  action?: string;
  userId?: string;
  sessionId?: string;
  requestId?: string;
}

export interface LoggerConfig {
  enabled: boolean;
  level: LogLevel;
  showTimestamp: boolean;
  showLevel: boolean;
  maxLogEntries: number;
  enableConsoleColors: boolean;
}

// Logger configuration
const DEFAULT_CONFIG: LoggerConfig = {
  enabled: __DEV__,
  level: 'debug',
  showTimestamp: true,
  showLevel: true,
  maxLogEntries: 1000,
  enableConsoleColors: __DEV__,
};

// Emojis for different log levels
const LOG_EMOJIS = {
  debug: '🔍',
  info: 'ℹ️',
  warn: '⚠️',
  error: '❌',
};

// Console colors for development
const CONSOLE_COLORS = {
  debug: '#6B7280',
  info: '#3B82F6',
  warn: '#F59E0B',
  error: '#EF4444',
};

// Session tracking
let sessionId: string = generateSessionId();

function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

// In-memory log storage for debugging
const logStorage: LogEntry[] = [];

/**
 * Main logger class
 */
class Logger {
  private config: LoggerConfig;
  private currentUserId?: string;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Set current user for context
   */
  setUser(userId: string): void {
    this.currentUserId = userId;
  }

  /**
   * Clear current user
   */
  clearUser(): void {
    this.currentUserId = undefined;
  }

  /**
   * Generate new session
   */
  newSession(): void {
    sessionId = generateSessionId();
  }

  /**
   * Get current session ID
   */
  getSessionId(): string {
    return sessionId;
  }

  /**
   * Core logging method
   */
  private log(
    level: LogLevel,
    message: string,
    data?: any,
    options: {
      component?: string;
      action?: string;
      requestId?: string;
      stack?: string;
    } = {}
  ): void {
    // Skip if logging is disabled
    if (!this.config.enabled) {
      return;
    }

    // Skip based on log level
    const levelPriority = { debug: 0, info: 1, warn: 2, error: 3 };
    if (levelPriority[level] < levelPriority[this.config.level]) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      data,
      component: options.component,
      action: options.action,
      requestId: options.requestId,
      stack: options.stack,
      userId: this.currentUserId,
      sessionId,
    };

    // Store in memory (limited entries)
    logStorage.push(entry);
    if (logStorage.length > this.config.maxLogEntries) {
      logStorage.shift();
    }

    // Output based on environment
    if (__DEV__) {
      this.outputToConsole(entry);
    } else {
      this.outputToProduction(entry);
    }
  }

  /**
   * Output to console in development
   */
  private outputToConsole(entry: LogEntry): void {
    const emoji = LOG_EMOJIS[entry.level];
    const color = CONSOLE_COLORS[entry.level];
    const timestamp = this.config.showTimestamp ? `[${entry.timestamp}] ` : '';
    const levelTag = this.config.showLevel
      ? `[${entry.level.toUpperCase()}] `
      : '';

    let prefix = '';
    const parts: string[] = [];

    if (entry.component) parts.push(`[${entry.component}]`);
    if (entry.action) parts.push(`(${entry.action})`);
    if (entry.requestId) parts.push(`[${entry.requestId}]`);

    if (parts.length > 0) {
      prefix = parts.join(' ') + ' ';
    }

    // Format the output
    const formattedMessage = `${emoji} ${timestamp}${levelTag}${prefix}${entry.message}`;

    // Choose appropriate console method
    const consoleMethod =
      entry.level === 'error'
        ? console.error
        : entry.level === 'warn'
          ? console.warn
          : entry.level === 'info'
            ? console.info
            : console.log;

    if (this.config.enableConsoleColors && color) {
      // Apply color styling (works in browsers and some terminals)
      consoleMethod(
        `%c${formattedMessage}`,
        `color: ${color}; font-weight: bold;`,
        entry.data || ''
      );
    } else {
      consoleMethod(formattedMessage, entry.data || '');
    }

    // Show stack trace for errors
    if (entry.stack && entry.level === 'error') {
      console.error('Stack trace:', entry.stack);
    }
  }

  /**
   * Output to production monitoring
   */
  private outputToProduction(entry: LogEntry): void {
    // Only send errors and warnings to production monitoring
    if (entry.level === 'error' || entry.level === 'warn') {
      // TODO: Send to Sentry or other error tracking service
      this.sendToErrorTracking(entry);
    }

    // TODO: Send to analytics/monitoring service if needed
    // this.sendToAnalytics(entry);
  }

  /**
   * Send to error tracking service (Sentry, etc.)
   */
  private sendToErrorTracking(entry: LogEntry): void {
    try {
      // Example for Sentry (would need @sentry/react-native installed)
      // import * as Sentry from '@sentry/react-native';
      // Sentry.captureException(new Error(entry.message), {
      //   tags: {
      //     component: entry.component,
      //     action: entry.action,
      //     level: entry.level,
      //   },
      //   extra: {
      //     data: entry.data,
      //     userId: entry.userId,
      //     sessionId: entry.sessionId,
      //     requestId: entry.requestId,
      //     timestamp: entry.timestamp,
      //   },
      //   contexts: {
      //     logger: {
      //       name: 'AppLogger',
      //       version: '1.0.0',
      //     },
      //   },
      // });

      // For now, just log to error tracking service placeholder
      console.error('[PRODUCTION ERROR TRACKING]', {
        message: entry.message,
        level: entry.level,
        component: entry.component,
        action: entry.action,
        data: entry.data,
        userId: entry.userId,
        sessionId: entry.sessionId,
        timestamp: entry.timestamp,
        stack: entry.stack,
      });
    } catch (error) {
      // Fallback to prevent logger errors from crashing the app
      console.error('Error tracking failed:', error);
    }
  }

  /**
   * Public logging methods
   */
  debug(
    message: string,
    data?: any,
    options?: Parameters<Logger['log']>[3]
  ): void {
    this.log('debug', message, data, options);
  }

  info(
    message: string,
    data?: any,
    options?: Parameters<Logger['log']>[3]
  ): void {
    this.log('info', message, data, options);
  }

  warn(
    message: string,
    data?: any,
    options?: Parameters<Logger['log']>[3]
  ): void {
    this.log('warn', message, data, options);
  }

  error(
    message: string,
    data?: any,
    options?: Parameters<Logger['log']>[3]
  ): void {
    this.log('error', message, data, options);
  }

  /**
   * Log API requests
   */
  apiRequest(
    method: string,
    url: string,
    data?: any,
    requestId?: string
  ): void {
    this.debug(
      'API Request',
      {
        method: method.toUpperCase(),
        url,
        data: this.sanitizeData(data),
      },
      {
        component: 'API',
        action: method.toUpperCase(),
        requestId,
      }
    );
  }

  /**
   * Log API responses
   */
  apiResponse(
    method: string,
    url: string,
    status: number,
    data?: any,
    requestId?: string
  ): void {
    this.info(
      'API Response',
      {
        method: method.toUpperCase(),
        url,
        status,
        data: this.sanitizeData(data),
      },
      {
        component: 'API',
        action: method.toUpperCase(),
        requestId,
      }
    );
  }

  /**
   * Log API errors
   */
  apiError(method: string, url: string, error: any, requestId?: string): void {
    this.error(
      'API Error',
      {
        method: method.toUpperCase(),
        url,
        error: this.sanitizeError(error),
      },
      {
        component: 'API',
        action: method.toUpperCase(),
        requestId,
        stack: error?.stack,
      }
    );
  }

  /**
   * Log user actions
   */
  userAction(action: string, data?: any): void {
    this.info(`User Action: ${action}`, data, {
      component: 'User',
      action,
    });
  }

  /**
   * Log performance metrics
   */
  performance(metric: string, value: number, unit?: string): void {
    this.info(
      `Performance: ${metric}`,
      {
        value,
        unit: unit || 'ms',
      },
      {
        component: 'Performance',
        action: metric,
      }
    );
  }

  /**
   * Get all stored logs
   */
  getLogs(): LogEntry[] {
    return [...logStorage];
  }

  /**
   * Clear all stored logs
   */
  clearLogs(): void {
    logStorage.length = 0;
  }

  /**
   * Export logs for debugging
   */
  exportLogs(): string {
    return JSON.stringify(logStorage, null, 2);
  }

  /**
   * Sanitize data for logging (remove sensitive info)
   */
  private sanitizeData(data: any): any {
    if (!data || typeof data !== 'object') return data;

    const sensitiveFields = [
      'password',
      'token',
      'secret',
      'key',
      'creditCard',
      'ssn',
    ];
    const sanitized = Array.isArray(data) ? [...data] : { ...data };

    const sanitizeValue = (obj: any): any => {
      if (Array.isArray(obj)) {
        return obj.map(sanitizeValue);
      }

      if (obj && typeof obj === 'object') {
        const result: any = {};
        for (const [key, value] of Object.entries(obj)) {
          if (
            sensitiveFields.some((field) =>
              key.toLowerCase().includes(field.toLowerCase())
            )
          ) {
            result[key] = '[REDACTED]';
          } else if (typeof value === 'object' && value !== null) {
            result[key] = sanitizeValue(value);
          } else {
            result[key] = value;
          }
        }
        return result;
      }

      return obj;
    };

    return sanitizeValue(sanitized);
  }

  /**
   * Sanitize error objects
   */
  private sanitizeError(error: any): any {
    if (!error) return error;

    return {
      message: error.message,
      status: error.status,
      code: error.code,
      stack: error.stack,
      // Include non-sensitive details
      ...(error.details && { details: error.details }),
    };
  }

  /**
   * Update logger configuration
   */
  updateConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): LoggerConfig {
    return { ...this.config };
  }
}

// Create singleton logger instance
const logger = new Logger();

// Export convenience methods
export const debug = (
  message: string,
  data?: any,
  options?: Parameters<Logger['log']>[3]
) => logger.debug(message, data, options);

export const info = (
  message: string,
  data?: any,
  options?: Parameters<Logger['log']>[3]
) => logger.info(message, data, options);

export const warn = (
  message: string,
  data?: any,
  options?: Parameters<Logger['log']>[3]
) => logger.warn(message, data, options);

export const error = (
  message: string,
  data?: any,
  options?: Parameters<Logger['log']>[3]
) => logger.error(message, data, options);

// Export specialized methods
export const api = {
  request: (method: string, url: string, data?: any, requestId?: string) =>
    logger.apiRequest(method, url, data, requestId),
  response: (
    method: string,
    url: string,
    status: number,
    data?: any,
    requestId?: string
  ) => logger.apiResponse(method, url, status, data, requestId),
  error: (method: string, url: string, error: any, requestId?: string) =>
    logger.apiError(method, url, error, requestId),
};

export const user = {
  action: (action: string, data?: any) => logger.userAction(action, data),
  setUser: (userId: string) => logger.setUser(userId),
  clearUser: () => logger.clearUser(),
};

export const performance = {
  log: (metric: string, value: number, unit?: string) =>
    logger.performance(metric, value, unit),
};

export const session = {
  new: () => logger.newSession(),
  getId: () => logger.getSessionId(),
};

// Export main logger instance and utilities
export { logger, LogEntry, LogLevel, LoggerConfig };
export default logger;

// Monitoring and Observability utilities

interface LogLevel {
  ERROR: "error";
  WARN: "warn";
  INFO: "info";
  DEBUG: "debug";
}

const LOG_LEVELS: LogLevel = {
  ERROR: "error",
  WARN: "warn",
  INFO: "info",
  DEBUG: "debug",
};

interface LogEntry {
  level: string;
  message: string;
  timestamp: string;
  context?: any;
  userId?: string;
  requestId?: string;
  error?: Error;
}

class Logger {
  private serviceName: string;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
  }

  private log(level: string, message: string, context?: any, error?: Error) {
    const logEntry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: {
        ...context,
        service: this.serviceName,
      },
      error: error
        ? ({
            message: error.message,
            stack: error.stack,
            name: error.name,
          } as any)
        : undefined,
    };

    // In production, send to logging service (e.g., Datadog, CloudWatch)
    if (process.env.NODE_ENV === "production") {
      this.sendToLoggingService(logEntry);
    }

    // Console logging for development
    const logMethod =
      level === "error"
        ? console.error
        : level === "warn"
        ? console.warn
        : console.log;
    logMethod(
      `[${level.toUpperCase()}] ${this.serviceName}:`,
      message,
      context || ""
    );
  }

  info(message: string, context?: any) {
    this.log(LOG_LEVELS.INFO, message, context);
  }

  warn(message: string, context?: any) {
    this.log(LOG_LEVELS.WARN, message, context);
  }

  error(message: string, error?: Error, context?: any) {
    this.log(LOG_LEVELS.ERROR, message, context, error);
  }

  debug(message: string, context?: any) {
    if (process.env.NODE_ENV !== "production") {
      this.log(LOG_LEVELS.DEBUG, message, context);
    }
  }

  private sendToLoggingService(logEntry: LogEntry) {
    // Implement integration with logging service
    // Examples: Datadog, New Relic, CloudWatch, Sentry
    if (process.env.DATADOG_API_KEY) {
      // Send to Datadog
      fetch("https://http-intake.logs.datadoghq.com/v1/input", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "DD-API-KEY": process.env.DATADOG_API_KEY,
        },
        body: JSON.stringify(logEntry),
      }).catch(console.error);
    }
  }
}

// Metrics tracking
class MetricsCollector {
  private metrics: Map<string, number> = new Map();

  increment(metric: string, value: number = 1, tags?: Record<string, string>) {
    const current = this.metrics.get(metric) || 0;
    this.metrics.set(metric, current + value);

    // Send to metrics service (e.g., Prometheus, Datadog)
    if (process.env.NODE_ENV === "production") {
      this.sendMetric(metric, current + value, "counter", tags);
    }
  }

  gauge(metric: string, value: number, tags?: Record<string, string>) {
    this.metrics.set(metric, value);

    if (process.env.NODE_ENV === "production") {
      this.sendMetric(metric, value, "gauge", tags);
    }
  }

  histogram(metric: string, value: number, tags?: Record<string, string>) {
    if (process.env.NODE_ENV === "production") {
      this.sendMetric(metric, value, "histogram", tags);
    }
  }

  private sendMetric(
    name: string,
    value: number,
    type: string,
    tags?: Record<string, string>
  ) {
    // Implement metrics service integration
    // Example: Prometheus, Datadog, CloudWatch
  }

  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }
}

// Performance monitoring
export function measurePerformance<T>(
  operation: string,
  fn: () => T | Promise<T>
): T | Promise<T> {
  const start = performance.now();

  try {
    const result = fn();

    if (result instanceof Promise) {
      return result.finally(() => {
        const duration = performance.now() - start;
        logger.info(`Performance: ${operation}`, {
          duration: `${duration.toFixed(2)}ms`,
        });
        metrics.histogram(`performance.${operation}`, duration);
      }) as T;
    } else {
      const duration = performance.now() - start;
      logger.info(`Performance: ${operation}`, {
        duration: `${duration.toFixed(2)}ms`,
      });
      metrics.histogram(`performance.${operation}`, duration);
      return result;
    }
  } catch (error) {
    const duration = performance.now() - start;
    logger.error(`Performance error: ${operation}`, error as Error, {
      duration: `${duration.toFixed(2)}ms`,
    });
    throw error;
  }
}

// Request tracing
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Health check endpoint
export function getHealthStatus(): {
  status: "healthy" | "unhealthy";
  timestamp: string;
  version: string;
  uptime: number;
  metrics: Record<string, number>;
} {
  return {
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || "1.0.0",
    uptime: process.uptime(),
    metrics: metrics.getMetrics(),
  };
}

// Export instances
export const logger = new Logger("TravelHub");
export const metrics = new MetricsCollector();

// Error tracking
export function trackError(error: Error, context?: any) {
  logger.error("Unhandled error", error, context);

  // Send to error tracking service (e.g., Sentry)
  if (process.env.SENTRY_DSN) {
    // Sentry.captureException(error, { extra: context });
  }
}

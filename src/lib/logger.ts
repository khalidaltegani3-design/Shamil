// Enhanced logging utility for better debugging
interface LogLevel {
  ERROR: 'error';
  WARN: 'warn';
  INFO: 'info';
  DEBUG: 'debug';
}

const LOG_LEVELS: LogLevel = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug'
};

class Logger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  private formatMessage(level: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    
    if (data) {
      return `${prefix} ${message} | Data: ${JSON.stringify(data, null, 2)}`;
    }
    
    return `${prefix} ${message}`;
  }

  error(message: string, error?: any): void {
    if (this.isDevelopment) {
      console.error(this.formatMessage(LOG_LEVELS.ERROR, message, error));
    }
  }

  warn(message: string, data?: any): void {
    if (this.isDevelopment) {
      console.warn(this.formatMessage(LOG_LEVELS.WARN, message, data));
    }
  }

  info(message: string, data?: any): void {
    if (this.isDevelopment) {
      console.info(this.formatMessage(LOG_LEVELS.INFO, message, data));
    }
  }

  debug(message: string, data?: any): void {
    if (this.isDevelopment) {
      console.debug(this.formatMessage(LOG_LEVELS.DEBUG, message, data));
    }
  }

  // Special method for system errors (instead of Firebase errors)
  systemError(operation: string, error: any): void {
    this.error(`نظام بلدية الريان - فشل في ${operation}`, {
      code: error?.code,
      message: error?.message,
      stack: error?.stack
    });
  }

  // Special method for lease errors
  leaseError(error: any): void {
    this.warn('نظام بلدية الريان - خطأ في قاعدة البيانات (عادة ما يكون غير ضار في بيئة التطوير)', {
      message: error?.message,
      suggestion: 'هذا الخطأ عادة ما يحل نفسه ولا يؤثر على الوظائف'
    });
  }
}

export const logger = new Logger();
export default logger;

/**
 * Standardized Logger for the application.
 * In production, we prevent console.log/console.error from leaking to production logs.
 * We can easily hook this up to Sentry, Crashlytics, etc. by modifying the functions below.
 */

export const logger = {
  log: (...args: any[]) => {
    if (__DEV__) {
      console.log(...args);
    }
  },

  warn: (...args: any[]) => {
    if (__DEV__) {
      console.warn(...args);
    }
  },

  error: (error: any, context?: string) => {
    if (__DEV__) {
      console.error(`[${context || 'ERROR'}]:`, error);
    } else {
      // TODO: Connect production error logging (e.g., Sentry, Firebase Crashlytics)
      // Example: Sentry.captureException(error);
    }
  },
  
  info: (...args: any[]) => {
      if (__DEV__) {
          console.info(...args);
      }
  }
};

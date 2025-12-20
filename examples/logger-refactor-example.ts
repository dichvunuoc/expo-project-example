// Example file showing before/after refactor from console.log to logger
// This is for demonstration purposes only

// ============================================
// BEFORE REFACTOR (using console.log directly)
// ============================================

// Example 1: API logging
const oldApiLogging = {
  request: (config: any) => {
    console.log('🚀 API Request:', config);
  },
  response: (response: any) => {
    console.log('✅ API Response:', response);
  },
  error: (error: any) => {
    console.error('❌ API Error:', error);
  },
};

// Example 2: Component lifecycle
const oldComponentLogging = {
  componentDidMount: () => {
    console.log('Component mounted');
  },
  componentDidUpdate: (props: any) => {
    console.log('Component updated with props:', props);
  },
  error: (error: any) => {
    console.error('Component error:', error);
  },
};

// Example 3: User actions
const oldUserLogging = {
  login: (user: any) => {
    console.log('User logged in:', user);
  },
  logout: () => {
    console.log('User logged out');
  },
  error: (error: any) => {
    console.error('Auth error:', error);
  },
};

// Example 4: Debug information
const oldDebugLogging = {
  debug: (message: string, data?: any) => {
    console.debug('DEBUG:', message, data);
  },
  info: (message: string, data?: any) => {
    console.info('INFO:', message, data);
  },
  warn: (message: string, data?: any) => {
    console.warn('WARNING:', message, data);
  },
};

// ============================================
// AFTER REFACTOR (using logger utility)
// ============================================

import { logger, api, user, debug, info, warn, error } from '@/utils/logger';
import { Component } from 'react';

// Example 1: API logging (now more structured and secure)
const newApiLogging = {
  request: (method: string, url: string, data?: any, requestId?: string) => {
    // Automatically sanitizes sensitive data
    api.request(method, url, data, requestId);

    // Additional context can be added
    logger.debug(
      'API Request initiated',
      {
        method,
        url,
        hasData: !!data,
        requestId,
      },
      {
        component: 'ApiClient',
        action: 'request',
      }
    );
  },
  response: (
    method: string,
    url: string,
    status: number,
    data?: any,
    requestId?: string
  ) => {
    // Uses appropriate log level
    api.response(method, url, status, data, requestId);

    // Performance tracking
    if (status >= 200 && status < 300) {
      logger.info(
        'API Request successful',
        {
          method,
          url,
          status,
          requestId,
        },
        {
          component: 'ApiClient',
          action: 'response',
        }
      );
    }
  },
  error: (method: string, url: string, error: any, requestId?: string) => {
    // Secure error logging with context
    api.error(method, url, error, requestId);

    // User tracking
    user.action('api_error', {
      method,
      url,
      errorType: error.name || 'Unknown',
      requestId,
    });
  },
};

// Example 2: Component lifecycle logging
class NewComponent extends Component<any, any> {
  componentDidMount(): void {
    // Structured component lifecycle logging
    logger.info(
      'Component mounted',
      {
        componentName: this.constructor.name,
        props: this.props,
      },
      {
        component: this.constructor.name,
        action: 'componentDidMount',
      }
    );
  }

  componentDidUpdate(prevProps: any): void {
    // Track prop changes with specific action
    logger.debug(
      'Component props updated',
      {
        componentName: this.constructor.name,
        prevProps,
        currentProps: this.props,
        changedKeys: Object.keys(this.props).filter(
          (key) => this.props[key] !== prevProps[key]
        ),
      },
      {
        component: this.constructor.name,
        action: 'componentDidUpdate',
      }
    );
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Comprehensive error logging
    logger.error(
      'Component error caught',
      {
        componentName: this.constructor.name,
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
        errorInfo: {
          componentStack: errorInfo.componentStack,
          errorBoundary: true,
        },
      },
      {
        component: this.constructor.name,
        action: 'componentDidCatch',
      }
    );
  }
}

// Example 3: User actions logging (with tracking)
const newUserLogging = {
  login: (user: any) => {
    // User action tracking
    user.action('login_success', {
      userId: user.id,
      email: user.email,
      timestamp: new Date().toISOString(),
    });

    // Success log
    logger.info(
      'User logged in successfully',
      {
        userId: user.id,
        email: user.email,
      },
      {
        component: 'AuthService',
        action: 'login',
      }
    );
  },
  logout: () => {
    // User action tracking
    user.action('logout_success');

    // Info log
    logger.info(
      'User logged out',
      {},
      {
        component: 'AuthService',
        action: 'logout',
      }
    );
  },
  error: (error: any, context?: string) => {
    // Structured error logging
    logger.error(
      'Authentication error',
      {
        error: {
          name: error.name,
          message: error.message,
          code: error.code,
          status: error.status,
        },
        context,
      },
      {
        component: 'AuthService',
        action: 'auth_error',
      }
    );

    // User tracking
    user.action('auth_error', {
      errorName: error.name,
      errorMessage: error.message,
      context,
    });
  },
};

// Example 4: Debug information (with levels and context)
const newDebugLogging = {
  debug: (message: string, data?: any, component?: string) => {
    debug(message, data, {
      component,
      action: 'debug',
    });
  },
  info: (message: string, data?: any, component?: string) => {
    info(message, data, {
      component,
      action: 'info',
    });
  },
  warn: (message: string, data?: any, component?: string) => {
    warn(message, data, {
      component,
      action: 'warning',
    });
  },
  error: (message: string, data?: any, component?: string, stack?: string) => {
    error(message, data, {
      component,
      action: 'error',
      stack,
    });
  },
};

// ============================================
// USAGE COMPARISON
// ============================================

// OLD WAY (insecure, no structure)
const oldUsageExample = () => {
  console.log('Starting user registration');
  console.log('Form data:', {
    email: 'user@example.com',
    password: 'secret123',
  });
  console.warn('Email already exists');
  console.error('Registration failed:', new Error('Server error'));
};

// NEW WAY (secure, structured, production-ready)
const newUsageExample = () => {
  logger.info(
    'Starting user registration',
    {
      step: 'initiation',
    },
    {
      component: 'RegistrationScreen',
      action: 'start_registration',
    }
  );

  logger.debug(
    'Form data submitted',
    {
      email: 'user@example.com',
      password: '[REDACTED]', // Automatically redacted sensitive data
    },
    {
      component: 'RegistrationScreen',
      action: 'form_submit',
    }
  );

  logger.warn(
    'Email already exists',
    {
      email: 'user@example.com',
    },
    {
      component: 'RegistrationScreen',
      action: 'duplicate_email',
    }
  );

  logger.error(
    'Registration failed',
    {
      error: {
        name: 'ServerError',
        message: 'Server error',
        status: 500,
      },
      email: 'user@example.com',
    },
    {
      component: 'RegistrationScreen',
      action: 'registration_failed',
    }
  );
};

export {
  oldApiLogging,
  oldComponentLogging,
  oldUserLogging,
  oldDebugLogging,
  newApiLogging,
  NewComponent,
  newUserLogging,
  newDebugLogging,
  oldUsageExample,
  newUsageExample,
};

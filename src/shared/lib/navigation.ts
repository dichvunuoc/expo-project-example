/**
 * Deep Linking Configuration
 * Centralized configuration for app deep linking and URL handling
 */

import * as Linking from 'expo-linking';
import { logger, user } from '@/shared/lib/logger';

// App configuration from environment
const APP_CONFIG = {
  scheme: process.env.EXPO_PUBLIC_SCHEME || 'expoapp',
  host: process.env.EXPO_PUBLIC_DEEP_LINK_HOST || 'expoapp.example.com',
  fallback: '/',
};

// Supported deep link routes
export const DEEP_LINK_ROUTES = {
  // User profile routes
  USER_PROFILE: 'user/:userId',
  USER_SETTINGS: 'user/settings',
  USER_EDIT: 'user/:userId/edit',

  // Product routes
  PRODUCT_DETAIL: 'product/:productId',
  PRODUCT_REVIEW: 'product/:productId/review',
  PRODUCT_SHARE: 'product/:productId/share',

  // Authentication routes
  AUTH_LOGIN: 'auth',
  AUTH_REGISTER: 'auth/register',
  AUTH_RESET_PASSWORD: 'auth/reset',
  AUTH_VERIFY_EMAIL: 'auth/verify/:token',

  // Content routes
  BLOG_POST: 'blog/:postId',
  CATEGORY: 'category/:categoryId',
  SEARCH: 'search',

  // Settings routes
  SETTINGS_PROFILE: 'settings/profile',
  SETTINGS_NOTIFICATIONS: 'settings/notifications',
  SETTINGS_SECURITY: 'settings/security',

  // Social routes
  INVITE: 'invite/:code',
  SHARE: 'share/:type/:id',
  REFERRAL: 'ref/:code',
} as const;

// URL patterns for validation
const URL_PATTERNS = {
  USER_PROFILE: /^\/user\/([a-zA-Z0-9_-]+)(\/.*)?$/,
  PRODUCT_DETAIL: /^\/product\/([a-zA-Z0-9_-]+)(\/.*)?$/,
  BLOG_POST: /^\/blog\/([a-zA-Z0-9_-]+)(\/.*)?$/,
  AUTH_VERIFY: /^\/auth\/verify\/([a-zA-Z0-9_-]+)$/,
  INVITE_CODE: /^\/invite\/([a-zA-Z0-9_-]+)$/,
  SHARE_LINK: /^\/share\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_-]+)$/,
} as const;

/**
 * Deep link types
 */
export type DeepLinkRoute = keyof typeof DEEP_LINK_ROUTES;

export interface ParsedDeepLink {
  url: string;
  scheme?: string;
  host?: string;
  path?: string;
  route?: DeepLinkRoute;
  params?: Record<string, string | string[]>;
  isValid: boolean;
}

/**
 * Deep link validation result
 */
export interface DeepLinkValidation {
  isValid: boolean;
  route?: DeepLinkRoute;
  params?: Record<string, string | string[]>;
  errors: string[];
}

/**
 * Linking configuration class
 */
class LinkingConfig {
  private linkingPrefixes: string[];

  constructor() {
    this.linkingPrefixes = this.buildLinkingPrefixes();
  }

  /**
   * Get all configured prefixes
   */
  getPrefixes(): string[] {
    return [...this.linkingPrefixes];
  }

  /**
   * Parse a URL into components
   */
  parseUrl(url: string): ParsedDeepLink {
    try {
      const parsed = Linking.parse(url);

      logger.debug(
        'Parsing deep link URL',
        {
          url,
          parsed,
        },
        {
          component: 'LinkingConfig',
          action: 'parseUrl',
        }
      );

      // Determine if this is a valid deep link
      const validation = this.validateUrl(parsed);

      return {
        url,
        scheme: parsed.scheme,
        host: parsed.host,
        path: parsed.path,
        route: validation.route,
        params: validation.params,
        isValid: validation.isValid,
      };
    } catch (error) {
      logger.error('Failed to parse deep link URL', error, {
        url,
        component: 'LinkingConfig',
        action: 'parseUrlError',
      });

      return {
        url,
        isValid: false,
      };
    }
  }

  /**
   * Validate URL against supported routes
   */
  private validateUrl(parsed: any): DeepLinkValidation {
    const errors: string[] = [];
    let route: DeepLinkRoute | undefined;
    let params: Record<string, string | string[]> = {};

    // Check if scheme is supported
    const isSupportedScheme = this.linkingPrefixes.some((prefix) =>
      parsed.url?.startsWith(prefix)
    );

    if (!isSupportedScheme) {
      errors.push(`Unsupported scheme: ${parsed.scheme}`);
    }

    // Validate path and extract params
    if (parsed.path) {
      // Check against known patterns
      for (const [routeName, routePattern] of Object.entries(
        DEEP_LINK_ROUTES
      )) {
        const pattern = URL_PATTERNS[routeName as keyof typeof URL_PATTERNS];

        if (pattern && pattern.test(parsed.path)) {
          const matches = parsed.path.match(pattern);
          if (matches) {
            route = routeName as DeepLinkRoute;
            params = this.extractParamsFromMatches(routePattern, matches);
            break;
          }
        }
      }

      // If no specific route found, try generic matching
      if (!route) {
        const genericMatch = this.tryGenericRouteMatching(parsed.path);
        if (genericMatch.route) {
          route = genericMatch.route;
          params = genericMatch.params;
        }
      }
    } else {
      errors.push('No path provided in URL');
    }

    return {
      isValid: errors.length === 0 && !!route,
      route,
      params,
      errors,
    };
  }

  /**
   * Extract parameters from regex matches
   */
  private extractParamsFromMatches(
    routePattern: string,
    matches: RegExpMatchArray
  ): Record<string, string | string[]> {
    const params: Record<string, string | string[]> = {};

    // Extract parameter names from route pattern
    const paramNames = (routePattern.match(/:(\w+)/g) || []).map((match) =>
      match.substring(1)
    );

    // Map matches to parameter names
    for (let i = 0; i < paramNames.length && i < matches.length - 1; i++) {
      const paramName = paramNames[i];
      const paramValue = matches[i + 1]; // Skip first match (full string)

      if (paramName && paramValue) {
        params[paramName] = decodeURIComponent(paramValue);
      }
    }

    return params;
  }

  /**
   * Try generic route matching for dynamic routes
   */
  private tryGenericRouteMatching(path: string): {
    route?: DeepLinkRoute;
    params: Record<string, string | string[]>;
  } {
    const segments = path.split('/').filter(Boolean);
    const params: Record<string, string | string[]> = {};

    // Generic pattern matching
    if (segments.length >= 2) {
      const [feature, ...featureSegments] = segments;

      // Try to match feature-based routes
      switch (feature) {
        case 'user':
          if (featureSegments.length === 1) {
            return {
              route: 'USER_PROFILE',
              params: { userId: featureSegments[0] },
            };
          }
          break;

        case 'product':
          if (featureSegments.length === 1) {
            return {
              route: 'PRODUCT_DETAIL',
              params: { productId: featureSegments[0] },
            };
          }
          break;

        case 'blog':
          if (featureSegments.length === 1) {
            return {
              route: 'BLOG_POST',
              params: { postId: featureSegments[0] },
            };
          }
          break;

        case 'auth':
          if (featureSegments.length === 2 && featureSegments[0] === 'verify') {
            return {
              route: 'AUTH_VERIFY_EMAIL',
              params: { token: featureSegments[1] },
            };
          }
          break;

        case 'share':
          if (featureSegments.length >= 2) {
            return {
              route: 'SHARE',
              params: {
                type: featureSegments[0],
                id: featureSegments[1],
              },
            };
          }
          break;
      }
    }

    return { params };
  }

  /**
   * Build linking prefixes
   */
  private buildLinkingPrefixes(): string[] {
    const prefixes: string[] = [];

    // Custom scheme prefix
    if (APP_CONFIG.scheme) {
      prefixes.push(`${APP_CONFIG.scheme}://`);
    }

    // HTTPS prefix for universal links
    if (APP_CONFIG.host) {
      prefixes.push(`https://${APP_CONFIG.host}`);
      prefixes.push(`http://${APP_CONFIG.host}`);
    }

    return prefixes;
  }

  /**
   * Generate deep link URL for a route
   */
  generateUrl(
    route: DeepLinkRoute,
    params: Record<string, string | number> = {},
    useHttps: boolean = true
  ): string {
    const baseScheme = useHttps ? 'https' : APP_CONFIG.scheme;
    const baseUrl = useHttps ? APP_CONFIG.host : '';
    const routePattern = DEEP_LINK_ROUTES[route];

    if (!routePattern) {
      throw new Error(`Unknown route: ${route}`);
    }

    let path = routePattern;

    // Replace parameters in route pattern
    for (const [paramName, paramValue] of Object.entries(params)) {
      const paramRegex = new RegExp(`:${paramName}\\b`, 'g');
      path = path.replace(paramRegex, String(paramValue));
    }

    const url =
      baseScheme && baseUrl
        ? `${baseScheme}://${baseUrl}/${path.replace(/^\//, '')}`
        : `${baseScheme}://${path}`;

    logger.debug(
      'Generated deep link URL',
      {
        route,
        params,
        url,
        useHttps,
      },
      {
        component: 'LinkingConfig',
        action: 'generateUrl',
      }
    );

    return url;
  }

  /**
   * Validate if URL belongs to our app
   */
  isAppUrl(url: string): boolean {
    const parsed = this.parseUrl(url);
    return parsed.isValid;
  }

  /**
   * Get route information from URL
   */
  getRouteFromUrl(url: string): {
    route?: DeepLinkRoute;
    params?: Record<string, string | string[]>;
  } {
    const parsed = this.parseUrl(url);
    return {
      route: parsed.route,
      params: parsed.params,
    };
  }
}

// Create singleton instance
export const linkingConfig = new LinkingConfig();

// Export convenience functions
export const { parseUrl, generateUrl, getPrefixes, isAppUrl, getRouteFromUrl } =
  linkingConfig;

// Export configuration for use in components
export const DEEP_LINK_CONFIG = {
  ...APP_CONFIG,
  routes: DEEP_LINK_ROUTES,
  patterns: URL_PATTERNS,
} as const;

import { PAGES } from './pages.config';

/**
 * An Array of routes that are used for authentication
 * These routes don't require authentication
 * @type {string[]}
 */
export const publicRoutes = [PAGES.HOME, PAGES.VERIFY];

/**
 * An Array of routes that are used for authentication
 * These routes will redirect logged in users to /settings
 * @type {string[]}
 */
export const authRoutes = [
  PAGES.LOGIN,
  PAGES.REGISTER,
  PAGES.FORGOT_PASSWORD,
  PAGES.ERROR,
];

/**
 * The prefix for API auth routes
 * Routes that start with this prefix are used for API authentication purposes
 * @type {string}
 */
export const apiAuthPrefix = '/api/auth';

/**
 * Routes that require authentication
 * @type {string[]}
 */
export const protectedRoutes = [
  PAGES.SETTINGS,
  PAGES.PROFILE,
  PAGES.POST_CREATE,
];

/**
 * The default route to redirect logged in users to
 * @type {string}
 */
export const DEFAULT_LOGIN_REDIRECT = PAGES.HOME;

/**
 * Route to redirect unauthenticated users to
 * @type {string}
 */
export const DEFAULT_LOGIN_PAGE = PAGES.LOGIN;

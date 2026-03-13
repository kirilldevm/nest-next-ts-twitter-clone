export const PAGES = {
  HOME: '/',
  FEED: '/feed',

  //Auth
  LOGIN: '/signin',
  REGISTER: '/signup',
  FORGOT_PASSWORD: '/reset-password',
  // NEW_PASSWORD: '/new-password',
  ERROR: '/error',
  VERIFY: '/verify',

  // Protected
  SETTINGS: '/settings',
  PROFILE: '/profile',
  PROFILE_BY_ID: (id: string) => `/profile/${id}`,
  POST_CREATE: '/posts/create',
  POST_PAGE: (id: string) => `/posts/${id}`,
  POST_EDIT: (id: string) => `/posts/${id}/edit`,
} as const;

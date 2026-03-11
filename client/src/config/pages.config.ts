export const PAGES = {
  HOME: '/',

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
} as const;

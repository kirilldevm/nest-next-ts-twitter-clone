export const ENDPOINTS = {
  AUTH: {
    SIGNUP: '/auth/signup',
    SIGNIN: '/auth/signin',
    SIGNIN_WITH_GOOGLE: '/auth/signin-with-google',
    FORGOT_PASSWORD: '/auth/forgot-password',
  },
  USER: {
    ME: '/user',
    BY_ID: (id: string) => `/user/${id}`,
  },
  POST: {
    LIST: '/post',
    BY_ID: (id: string) => `/post/${id}`,
  },
  REACTION: {
    SET: '/reaction',
    GET: '/reaction',
  },
};

export const ENDPOINTS = {
  AUTH: {
    SIGNUP: '/auth/signup',
    SIGNIN: '/auth/signin',
    SIGNIN_WITH_GOOGLE: '/auth/signin-with-google',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESEND_VERIFICATION_EMAIL: '/auth/resend-verification-email',
  },
  USER: {
    ME: '/user',
    BY_ID: (id: string) => `/user/${id}`,
    SEND_VERIFICATION_EMAIL: `/user/send-verification-email`,
  },
  POST: {
    LIST: '/post',
    SEARCH: '/post/search',
    BY_ID: (id: string) => `/post/${id}`,
  },
  REACTION: {
    SET: '/reaction',
    GET: '/reaction',
  },
  COMMENT: {
    LIST: '/comment',
    BY_ID: (id: string) => `/comment/${id}`,
  },
};

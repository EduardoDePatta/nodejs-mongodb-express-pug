export const consts = {
  QUERY: {
    EXCLUDED_FIELDS: ['page', 'sort', 'limit', 'fields'],
    ALIAS_TOP_TOURS: {
      limit: '5',
      sort: '-ratingsAvarage,price',
      fields: 'name,price,ratingsAvarage,summary,difficulty',
    },
  },
  PARAMS: {
    WHITELIST: [
      'duration',
      'ratingsQuantity',
      'ratingsAvarage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  },
  ERRORS: {
    CAST_ERROR: 'CastError',
    DUPLICATE_FIELD: 1100,
    VALIDATION_ERROR: 'ValidationError',
    UNHANDLED_REJECTION: 'unhandledRejection',
    UNCAUGHT_EXCEPTION: 'uncaughtException',
    JSON_WEBTOKEN_ERROR: 'JsonWebTokenError',
    TOKEN_EXPIRED_ERROR: 'TokenExpiredError',
  },
  MODE: {
    PROD: 'production',
    DEV: 'development',
  },
  AUTH: {
    ROLES: {
      ADMIN: 'admin',
      GUIDE: 'guide',
      LEAD_GUIDE: 'lead-guide',
      USER: 'user',
      ALL: ['admin', 'guide', 'lead-guide', 'user'],
    },
  },
  EMAIL_TEMPLATES: {
    WELCOME: 'welcome',
    PASSWORD_RESET: 'passwordReset',
  },
}

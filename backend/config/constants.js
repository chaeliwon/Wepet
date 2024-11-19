exports.FRONTEND_ORIGIN = [
  "https://main.d2agnx57wvpluz.amplifyapp.com",
  "http://localhost:3000",
];

exports.CORS_OPTIONS = {
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Cookie",
    "Location",
  ],
  exposedHeaders: ["Set-Cookie", "Location"],
  maxAge: 86400,
};

exports.CORS_HEADERS = {
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS,PATCH",
  "Access-Control-Allow-Headers":
    "Content-Type,Authorization,X-Requested-With,Accept,Cookie,Location",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Expose-Headers": "Set-Cookie,Location",
  "Access-Control-Max-Age": "86400",
  Vary: "Origin",
};

exports.STATUS_CODES = {
  OK: 200,
  REDIRECT: 302,
  SERVER_ERROR: 500,
};

exports.OAUTH = {
  KAKAO: {
    TOKEN_URL: "https://kauth.kakao.com/oauth/token",
    AUTH_URL: "https://kauth.kakao.com/oauth/authorize",
    USER_INFO_URL: "https://kapi.kakao.com/v2/user/me",
  },
  GOOGLE: {
    TOKEN_URL: "https://oauth2.googleapis.com/token",
    AUTH_URL: "https://accounts.google.com/o/oauth2/auth",
    USER_INFO_URL: "https://www.googleapis.com/oauth2/v2/userinfo",
    SCOPE: "profile email",
  },
};

exports.HEADERS = {
  CACHE_CONTROL: "no-cache",
};

exports.JWT_OPTIONS = {
  expiresIn: "1h",
};

exports.COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "None",
};

const express = require("express");
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const serverless = require("serverless-http");

const userRouter = require("./routes/userRouter");
const mainRouter = require("./routes/mainRouter");
const authRouter = require("./routes/authRouter");
const likeRouter = require("./routes/likeRouter");
const findfetRouter = require("./routes/findfetRouter");

require("./config/passport");

const app = express();

// CORS 옵션 설정
const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
  ],
  exposedHeaders: ["Set-Cookie"],
  maxAge: 86400,
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

// CORS 미들웨어 설정
app.use(cors(corsOptions));

// preflight 요청을 위한 OPTIONS 처리
app.options("*", cors(corsOptions));

// CORS 미들웨어
const corsMiddleware = (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
};

app.use(corsMiddleware);

// 모든 라우트에 대해 OPTIONS 요청 처리
app.options("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );
  res.header("Access-Control-Allow-Credentials", "true");
  res.status(204).send();
});

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());

// 세션 설정
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true,
      sameSite: "none",
      maxAge: 3600000,
    },
    proxy: true,
  })
);

// 라우터 설정
app.use("/user", userRouter);
app.use("/main", mainRouter);
app.use("/auth", authRouter);
app.use("/findfet", findfetRouter);
app.use("/like", likeRouter);

// 에러 핸들링 미들웨어
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Lambda 핸들러
const handler = serverless(app);

module.exports.handler = async (event, context) => {
  // 요청의 origin 확인
  const origin = event.headers.origin || "http://localhost:3000";

  // CORS 헤더 정의
  const corsHeaders = {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS,PATCH",
    "Access-Control-Allow-Headers":
      "Content-Type,Authorization,X-Requested-With,Accept",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Expose-Headers": "Set-Cookie",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };

  // Express response 객체에 CORS 헤더 추가하는 미들웨어
  if (!event.requestContext) event.requestContext = {};
  if (!event.requestContext.http) event.requestContext.http = {};

  // OPTIONS 요청 처리
  if (event.requestContext.http.method === "OPTIONS") {
    return {
      statusCode: 204,
      headers: corsHeaders,
      body: "",
    };
  }

  try {
    // 경로 처리
    if (event.rawPath) {
      const path = event.rawPath.replace("/dev", "");
      event.path = path;
      event.rawPath = path;
      if (event.requestContext?.http) {
        event.requestContext.http.path = path;
      }
    }

    // 기존의 Express 앱 처리
    const response = await handler(event, context);

    // 응답에 CORS 헤더 추가
    return {
      statusCode: response.statusCode || 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        ...(response.headers || {}),
      },
      body:
        typeof response.body === "string"
          ? response.body
          : JSON.stringify(response.body || ""),
    };
  } catch (error) {
    console.error("Error:", error);

    return {
      statusCode: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: "Internal Server Error",
        message: error.message,
      }),
    };
  }
};

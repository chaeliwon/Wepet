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
      secure: true, // HTTPS 사용
      httpOnly: true,
      sameSite: "none", // API Gateway를 통한 크로스 도메인 요청 허용
      maxAge: 3600000, // 1시간
      domain: ".execute-api.ap-northeast-2.amazonaws.com", // API Gateway 도메인
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
  // 요청 로깅
  console.log("Request event:", {
    method: event.requestContext?.http?.method,
    path: event.rawPath,
    headers: event.headers,
    body: event.body,
  });

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

  if (!event.requestContext) event.requestContext = {};
  if (!event.requestContext.http) event.requestContext.http = {};

  // OPTIONS 요청 처리
  if (event.requestContext.http.method === "OPTIONS") {
    console.log("Handling OPTIONS request");
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

    // Express 앱 처리
    const response = await handler(event, context);

    // 응답 로깅
    console.log("Express response:", {
      statusCode: response.statusCode,
      headers: response.headers,
      body: response.body,
      cookies: response.multiValueHeaders?.["Set-Cookie"],
    });

    // 쿠키 처리를 위한 multiValueHeaders 설정
    const finalResponse = {
      statusCode: response.statusCode || 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        ...(response.headers || {}),
      },
      multiValueHeaders: {
        "Set-Cookie": response.multiValueHeaders?.["Set-Cookie"] || [],
      },
      body:
        typeof response.body === "string"
          ? response.body
          : JSON.stringify(response.body || ""),
    };

    // 최종 응답 로깅
    console.log("Final Lambda response:", finalResponse);

    return finalResponse;
  } catch (error) {
    console.error("Error in Lambda handler:", error);

    return {
      statusCode: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: "Internal Server Error",
        message: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      }),
    };
  }
};

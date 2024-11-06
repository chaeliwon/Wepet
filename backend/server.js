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
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["Set-Cookie"],
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

// CORS 미들웨어 설정
app.use(cors(corsOptions));

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
  // 경로 정보를 rawPath에서 가져오기
  let path = event.rawPath;
  console.log("Original Path:", path);

  // /dev 제거
  if (path) {
    path = path.replace("/dev", "");
    // event 객체 업데이트
    event.path = path;
    event.rawPath = path;
    if (event.requestContext && event.requestContext.http) {
      event.requestContext.http.path = path;
    }
  }

  console.log("Modified Path:", path);
  console.log("HTTP Method:", event.requestContext.http.method);

  if (event.requestContext.http.method === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin": "http://localhost:3000",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers":
          "Content-Type, Authorization, X-Requested-With",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Max-Age": "86400",
        "Access-Control-Expose-Headers": "Set-Cookie",
      },
      body: "",
    };
  }

  try {
    // 일반 요청 처리
    const response = await handler(event, context);

    return {
      statusCode: response.statusCode || 200,
      body:
        typeof response.body === "string"
          ? response.body
          : JSON.stringify(response.body || ""),
      headers: {
        "Access-Control-Allow-Origin": "http://localhost:3000",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers":
          "Content-Type, Authorization, X-Requested-With",
        "Access-Control-Expose-Headers": "Set-Cookie",
        "Content-Type": "application/json",
        ...response.headers,
      },
    };
  } catch (error) {
    console.error("Error in handler:", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "http://localhost:3000",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers":
          "Content-Type, Authorization, X-Requested-With",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: "Internal Server Error",
        details: error.message,
      }),
    };
  }
};

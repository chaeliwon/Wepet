require("dotenv").config();
const express = require("express");
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const serverless = require("serverless-http");

// 다른 라우터들 import
const userRouter = require("./routes/userRouter");
const mainRouter = require("./routes/mainRouter");
const likeRouter = require("./routes/likeRouter");
const findfetRouter = require("./routes/findfetRouter");

const app = express();
const FRONTEND_ORIGIN = "https://main.d2agnx57wvpluz.amplifyapp.com";

// CORS 옵션 설정
const corsOptions = {
  origin: FRONTEND_ORIGIN,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Cookie",
  ],
  exposedHeaders: ["Set-Cookie"],
  maxAge: 86400,
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

console.log("Environment variables:", {
  KAKAO_CLIENT_ID: process.env.KAKAO_CLIENT_ID,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  JWT_SECRET: process.env.JWT_SECRET,
});

app.use(cors(corsOptions));
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
      httpOnly: true,
      sameSite: "none",
      maxAge: 3600000,
    },
    proxy: true,
  })
);

// authRouter 초기화 및 설정
const authRouter = require("./routes/authRouter")({
  KAKAO_CLIENT_ID: process.env.KAKAO_CLIENT_ID,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  JWT_SECRET: process.env.JWT_SECRET,
});

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
    error: err.message,
  });
});

// Lambda 핸들러
const handler = serverless(app);

module.exports.handler = async (event, context) => {
  console.log("Incoming event:", JSON.stringify(event, null, 2));

  const corsHeaders = {
    "Access-Control-Allow-Origin": FRONTEND_ORIGIN,
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS,PATCH",
    "Access-Control-Allow-Headers":
      "Content-Type,Authorization,X-Requested-With,Accept,Cookie",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Expose-Headers": "Set-Cookie,Location",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };

  // OPTIONS 요청 처리
  if (event.requestContext?.http?.method === "OPTIONS") {
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

    // 로깅 추가
    console.log("Raw response:", response);

    // 카카오 로그인 리다이렉션 특별 처리
    if (event.path === "/auth/kakao") {
      console.log("Processing Kakao auth request");
      const kakaoAuthURL = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${
        process.env.KAKAO_CLIENT_ID
      }&redirect_uri=${encodeURIComponent(
        "https://5zld3up4c4.execute-api.ap-northeast-2.amazonaws.com/dev/auth/kakao/callback"
      )}`;

      console.log("Redirecting to:", kakaoAuthURL);
      return {
        statusCode: 302,
        headers: {
          Location: kakaoAuthURL,
          ...corsHeaders,
        },
      };
    }

    // 일반적인 리다이렉트 응답 처리
    if (response.statusCode === 302 && response.headers?.Location) {
      console.log("Processing redirect to:", response.headers.Location);
      return {
        statusCode: 302,
        headers: {
          Location: response.headers.Location,
          ...corsHeaders,
        },
      };
    }

    // 쿠키 처리
    let cookies = [];
    if (response.headers?.["set-cookie"]) {
      cookies = Array.isArray(response.headers["set-cookie"])
        ? response.headers["set-cookie"]
        : [response.headers["set-cookie"]];
      console.log("Processing cookies:", cookies);
    }

    const finalResponse = {
      statusCode: response.statusCode || 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
      multiValueHeaders:
        cookies.length > 0
          ? {
              "Set-Cookie": cookies.map(
                (cookie) => `${cookie}; Secure; SameSite=None`
              ),
            }
          : undefined,
      body:
        typeof response.body === "string"
          ? response.body
          : JSON.stringify(response.body || ""),
    };

    console.log("Final response:", finalResponse);
    return finalResponse;
  } catch (error) {
    console.error("Handler error:", error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: "Internal Server Error",
        message: error.message,
        stack: error.stack,
      }),
    };
  }
};

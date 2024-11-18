require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const serverless = require("serverless-http");
const passport = require("passport");
require("./config/passport"); // passport 설정 로드

// 다른 라우터들 import
const userRouter = require("./routes/userRouter");
const mainRouter = require("./routes/mainRouter");
const likeRouter = require("./routes/likeRouter");
const findfetRouter = require("./routes/findfetRouter");
const authRouter = require("./routes/authRouter");

const app = express();
const FRONTEND_ORIGIN = [
  "https://main.d2agnx57wvpluz.amplifyapp.com",
  "http://localhost:3000",
];

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
};

app.use(passport.initialize());
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 라우터 설정
app.use("/user", userRouter);
app.use("/main", mainRouter);
app.use("/findfet", findfetRouter);
app.use("/like", likeRouter);
app.use("/auth", authRouter);

// Lambda 핸들러
const handler = serverless(app);

module.exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  console.log("Incoming event:", JSON.stringify(event, null, 2));

  // 요청의 origin을 확인하고 허용된 origin 반환
  const origin = event.headers?.origin || event.headers?.Origin;
  const allowedOrigin = FRONTEND_ORIGIN.includes(origin)
    ? origin
    : FRONTEND_ORIGIN[0];

  const corsHeaders = {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS,PATCH",
    "Access-Control-Allow-Headers":
      "Content-Type,Authorization,X-Requested-With,Accept,Cookie",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Expose-Headers": "Set-Cookie,Location",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };

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

    // OPTIONS 요청 처리
    if (event.requestContext?.http?.method === "OPTIONS") {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: "",
      };
    }

    // 일반 요청 처리
    const response = await handler(event, context);

    // 쿠키 처리
    let cookies = [];
    if (response.headers?.["set-cookie"]) {
      cookies = Array.isArray(response.headers["set-cookie"])
        ? response.headers["set-cookie"]
        : [response.headers["set-cookie"]];
      console.log("Processing cookies:", cookies);
    }

    // 응답 반환
    return {
      statusCode: response.statusCode || 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
      multiValueHeaders:
        cookies.length > 0
          ? {
              "Set-Cookie": cookies.map(
                (cookie) => `${cookie}; SameSite=None; Secure; Path=/`
              ),
            }
          : undefined,
      body:
        typeof response.body === "string"
          ? response.body
          : JSON.stringify(response.body || {}),
    };
  } catch (error) {
    console.error("Handler error:", error);
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

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
  console.error("Error details:", {
    message: err.message,
    stack: err.stack,
    type: err.name,
  });

  // Lambda 환경에 맞는 에러 응답 형식
  return {
    statusCode: err.status || 500,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": FRONTEND_ORIGIN,
      "Access-Control-Allow-Credentials": "true",
    },
    body: JSON.stringify({
      error: err.message || "Internal Server Error",
      status: err.status || 500,
    }),
  };
});

// Lambda 핸들러
const handler = serverless(app);

module.exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

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

    // 카카오 콜백 경로 특별 처리
    if (event.rawPath.includes("/auth/kakao/callback")) {
      console.log("Processing kakao callback");
      const response = await handler(event, context);
      console.log("Kakao callback response:", response);

      if (response.body && typeof response.body === "string") {
        try {
          const parsedBody = JSON.parse(response.body);
          if (parsedBody.token) {
            console.log("Token found in response:", parsedBody.token);
            return {
              statusCode: 302,
              headers: {
                ...corsHeaders,
                Location: `https://main.d2agnx57wvpluz.amplifyapp.com/login?token=${parsedBody.token}`,
                "Cache-Control": "no-cache",
              },
            };
          }
        } catch (e) {
          console.error("Error parsing response body:", e);
        }
      }

      // 기본 리다이렉션
      return {
        statusCode: 302,
        headers: {
          ...corsHeaders,
          Location:
            "https://main.d2agnx57wvpluz.amplifyapp.com/login?error=auth_failed",
          "Cache-Control": "no-cache",
        },
      };
    }

    // Express 앱 처리
    const response = await handler(event, context);

    // 리다이렉트 응답 처리
    if (response.statusCode === 302 && response.headers?.Location) {
      console.log("Processing redirect to:", response.headers.Location);
      return {
        statusCode: 302,
        headers: {
          ...corsHeaders,
          Location: response.headers.Location,
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

    console.log("Final response headers:", finalResponse.headers);
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

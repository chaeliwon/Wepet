require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const serverless = require("serverless-http");
const passport = require("passport");
require("./config/passport");

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

// CORS 옵션 설정 - location 헤더 추가
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
    "Location",
  ],
  exposedHeaders: ["Set-Cookie", "Location"],
  maxAge: 86400,
};

app.use(passport.initialize());
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/user", userRouter);
app.use("/main", mainRouter);
app.use("/findfet", findfetRouter);
app.use("/like", likeRouter);
app.use("/auth", authRouter);

const handler = serverless(app);

module.exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  console.log("Incoming event:", JSON.stringify(event, null, 2));

  const origin = event.headers?.origin || event.headers?.Origin;
  const allowedOrigin = FRONTEND_ORIGIN.includes(origin)
    ? origin
    : FRONTEND_ORIGIN[0];

  const corsHeaders = {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS,PATCH",
    "Access-Control-Allow-Headers":
      "Content-Type,Authorization,X-Requested-With,Accept,Cookie,Location", // location 헤더 추가
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Expose-Headers": "Set-Cookie,Location",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };

  try {
    if (event.rawPath) {
      const path = event.rawPath.replace("/dev", "");
      event.path = path;
      event.rawPath = path;
      if (event.requestContext?.http) {
        event.requestContext.http.path = path;
      }
    }

    if (event.requestContext?.http?.method === "OPTIONS") {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: "",
      };
    }

    const response = await handler(event, context);

    // 리다이렉트 응답 처리
    if (response.statusCode === 302 || response.statusCode === 301) {
      return {
        statusCode: response.statusCode,
        headers: {
          ...corsHeaders,
          Location: response.headers.location || response.headers.Location,
          "Cache-Control": "no-cache",
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

    // 일반 응답 처리
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

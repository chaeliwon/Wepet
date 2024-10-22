const express = require("express");
const cors = require("cors");
const passport = require("passport");

const userRouter = require("./routes/userRouter");
const mainRouter = require("./routes/mainRouter");
const authRouter = require("./routes/authRouter");
const likeRouter = require("./routes/likeRouter");
const findfetRouter = require("./routes/findfetRouter");
const chatbotRouter = require("./routes/chatbotRouter");

require("./config/passport"); // passport 설정 불러오기

const path = require("path");
const app = express();

// 미들웨어 설정
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(passport.initialize()); // 세션 제거, 초기화만 유지

// 라우터 등록
app.use("/user", userRouter);
app.use("/main", mainRouter);
app.use("/auth", authRouter);
app.use("/findfet", findfetRouter);
app.use("/chatbot", chatbotRouter);

// 정적 파일 제공 (React 빌드 폴더)
app.use(express.static(path.join(__dirname, "..", "frontend", "build")));

// React 프론트엔드의 모든 경로에 대해 index.html 파일 제공
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "frontend", "build", "index.html"));
});

// 포트 설정
app.set("port", process.env.PORT || 3001);

// 서버 시작
app.listen(app.get("port"), () => {
  console.log(`Server is running on port ${app.get("port")}`);
});

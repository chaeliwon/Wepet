const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const app = express();

// 미들웨어
app.use(bodyParser.json());

// React 정적 파일 제공
app.use(express.static(path.join(__dirname, "../frontend/build")));

// 라우터 등록
const mainRouter = require("./routes/mainRouter");
const userRouter = require("./routes/userRouter");

// API 라우트
app.use("/api/user", userRouter); // user 관련 API는 /api/user로 설정

// 메인 페이지 라우트
app.use("/", mainRouter); // 루트 경로는 mainRouter로 설정

// 포트 설정
app.set("port", process.env.PORT || 3001);

// 서버 시작
app.listen(app.get("port"), () => {
  console.log(`Server is running on port ${app.get("port")}`);
});

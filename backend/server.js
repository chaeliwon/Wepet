const express = require("express");
const path = require("path");
const app = express();

const mainRouter = require("./routes/mainRouter");
const userRouter = require("./routes/userRouter");

const cors = require("cors");

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(cors());

// 정적 파일 제공
app.use(express.static(path.join(__dirname, "../frontend/build")));

// 라우터 등록
app.use("/", mainRouter);
app.use("/user", userRouter);

// 모든 경로에서 index.html 제공
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

// 포트 설정
app.set("port", process.env.PORT || 3001);

// 서버 시작
app.listen(app.get("port"), () => {
  console.log(`Server is running on port ${app.get("port")}`);
});

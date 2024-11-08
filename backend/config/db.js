const mysql = require("mysql2");

// DB연결정보를 설정
const conn = mysql.createConnection({
  host: "project-db-stu3.smhrd.com",
  port: 3307,
  user: "Insa5_JSB_final_3",
  password: "aischool3",
  database: "Insa5_JSB_final_3",
  connectTimeout: 60000, // 타임아웃 설정 추가
  // Lambda 환경을 위한 추가 설정
  keepAliveInitialDelay: 10000,
  enableKeepAlive: true,
});

// 연결 진행!!
conn.connect((err) => {
  if (err) {
    console.error("데이터베이스 연결 실패:", err);
    return;
  }
  console.log("db 연결!");
});

// 연결 에러 핸들링 추가
conn.on("error", function (err) {
  console.error("DB 에러:", err);
  if (err.code === "PROTOCOL_CONNECTION_LOST") {
    console.log("DB 연결 재시도...");
    conn.connect((err) => {
      if (err) {
        console.error("재연결 실패:", err);
        return;
      }
      console.log("DB 재연결 성공!");
    });
  }
});

module.exports = conn;

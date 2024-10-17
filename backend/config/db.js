const mysql = require("mysql2");

// DB연결정보를 설정
const conn = mysql.createConnection({
  host: "project-db-stu3.smhrd.com",
  port: 3307,
  user: "Insa5_JSB_final_3",
  password: "aischool3",
  database: "Insa5_JSB_final_3",
});

// 연결 진행!!
conn.connect((err) => {
  if (err) {
    console.error("데이터베이스 연결 실패:", err);
    return;
  }
  console.log("db 연결!");
});

module.exports = conn;

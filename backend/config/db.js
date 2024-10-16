// DB와 연결정보를 관리하는 공간
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
conn.connect();
console.log("db연결");

module.exports = conn;

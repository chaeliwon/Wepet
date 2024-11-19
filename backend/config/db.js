const knex = require("knex");

const db = knex({
  client: "mysql2",
  connection: {
    host: "project-db-stu3.smhrd.com",
    port: 3307,
    user: "Insa5_JSB_final_3",
    password: "aischool3",
    database: "Insa5_JSB_final_3",
    // mysql2 specific options
    connectTimeout: 60000,
    ssl: false,
  },
  pool: {
    min: 0,
    max: 7,
    acquireTimeoutMillis: 60000,
    createTimeoutMillis: 60000,
    idleTimeoutMillis: 60000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 100,
    propagateCreateError: false,
  },
  // Lambda 환경을 위한 추가 설정
  acquireConnectionTimeout: 60000,
});

// 연결 테스트
const testConnection = async () => {
  try {
    await db.raw("SELECT 1");
    console.log("db 연결!");
  } catch (err) {
    console.error("데이터베이스 연결 실패:", err);
    // 연결 실패 시 재시도 로직
    setTimeout(testConnection, 5000);
  }
};

testConnection();

// 에러 이벤트 리스너
db.on("error", (err) => {
  console.error("DB 에러:", err);
  if (err.code === "PROTOCOL_CONNECTION_LOST") {
    console.log("DB 연결 재시도...");
    testConnection();
  }
});

// 종료 시 정리
process.on("SIGINT", async () => {
  try {
    await db.destroy();
    console.log("DB 연결 종료");
    process.exit(0);
  } catch (err) {
    console.error("DB 연결 종료 실패:", err);
    process.exit(1);
  }
});

module.exports = db;

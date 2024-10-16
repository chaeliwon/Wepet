const express = require("express");
const router = express.Router();
const path = require("path");
const conn = require("../config/db");

router.get("/", (req, res) => {
  console.log("서버 동작!");
  let mainPetsql = `SELECT pet_img 
                    FROM pet_info 
                    WHERE pet_num = ? OR pet_num = ? OR pet_num = ? OR pet_num = ? OR pet_num = ?`;
  conn.query(mainPetsql, [], (err, rows) => {
    if (err) {
      console.log("메인 이미지 검색 오류", err);
      res.json({ result: "에러발생" });
      return;
    }
    if (rows.length > 4) {
      console.log("이미지 검색 성공");
      res.json({ resul: "이미지 검색 성공" });
    }
  });

  res.sendFile(
    path.join(__dirname, "..", "..", "frontend", "build", "index.html")
  );
});

module.exports = router;

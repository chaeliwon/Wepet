const express = require("express");
const router = express.Router();
const conn = require("../config/db"); // DB 연결

// 메인 페이지 동물 이미지 가져오기
router.get("/", (req, res) => {
  console.log("메인 페이지 데이터 요청!");

  let mainPetsql = `
    SELECT pet_img 
    FROM pet_info 
    WHERE pet_num IN (?, ?, ?, ?, ?)`;

  conn.query(
    mainPetsql,
    ["pet_num01", "pet_num02", "pet_num03", "pet_num04", "pet_num05"],
    (err, rows) => {
      if (err) {
        console.log("이미지 검색 오류", err);
        return res.json({ result: "에러발생" });
      }

      if (rows.length === 5) {
        console.log("이미지 검색 성공");

        res.json({
          result: "이미지 검색 성공",
          images: rows.map((row) => row.pet_img),
        });
      } else {
        console.log("이미지 검색 실패");
        res.json({ result: "이미지 검색 실패" });
      }
    }
  );
});

module.exports = router;

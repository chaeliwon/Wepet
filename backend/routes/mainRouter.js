const express = require("express");
const router = express.Router();
const conn = require("../config/db"); // DB 연결

// 메인 페이지 동물 이미지 가져오기
router.get("/", (req, res) => {
  console.log("메인 페이지 데이터 요청!");

  let mainPetsql = `
    SELECT pet_img, pet_num
    FROM pet_info 
    WHERE pet_num IN (?, ?, ?, ?, ?)`;

  conn.query(
    mainPetsql,
    [
      "경북-포항-2024-00156",
      "광주-광산-2024-00646",
      "경기-수원-2023-00802",
      "부산-동래-2024-00156",
      "강원-강릉-2024-00230",
    ],
    (err, rows) => {
      if (err) {
        console.log("이미지 검색 오류", err);
        return res.json({ result: "에러발생" });
      }

      if (rows.length === 5) {
        console.log("이미지 검색 성공");

        res.json({
          result: "이미지 검색 성공",
          images: rows.map((row) => {
            row.pet_img, row.pet_num;
          }),
        });
      } else {
        console.log("이미지 검색 실패");
        res.json({ result: "이미지 검색 실패" });
      }
    }
  );
});

module.exports = router;

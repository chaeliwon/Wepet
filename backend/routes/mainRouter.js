const express = require("express");
const router = express.Router();
const conn = require("../config/db"); // DB 연결

// 메인 페이지 동물 이미지 가져오기
router.get("/", (req, res) => {
  console.log("메인 페이지 데이터 요청!");

  // 에러 처리 추가
  if (!req.session) {
    console.log("세션 없음");
    return res.json({
      result: "success",
      images: [],
      nums: [],
    });
  }

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
      "인천-서구-2024-00678",
    ],
    (err, rows) => {
      if (err) {
        console.log("이미지 검색 오류", err);
        return res.json({
          result: "에러발생",
          images: [],
          nums: [],
        });
      }

      if (rows.length === 5) {
        console.log("이미지 검색 성공");
        return res.json({
          result: "이미지 검색 성공",
          images: rows.map((row) => row.pet_img),
          nums: rows.map((row) => row.pet_num),
        });
      }

      console.log("이미지 검색 실패");
      return res.json({
        result: "이미지 검색 실패",
        images: [],
        nums: [],
      });
    }
  );
});
module.exports = router;

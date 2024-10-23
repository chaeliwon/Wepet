const conn = require("../config/db");

// 찜한 동물 목록 가져오기
exports.getLikedPets = (req, res) => {
  const { user_id } = req.body; // POST 요청이므로 req.body에서 user_id를 받음

  const sql = `
    SELECT pet_info.pet_breed, pet_info.pet_gender, pet_info.pet_age, pet_info.pet_img, pet_info.pet_num, pet_info.pet_shelter
    FROM favorite_info 
    JOIN pet_info ON favorite_info.pet_num = pet_info.pet_num
    WHERE favorite_info.user_id = ?`;
  conn.query(sql, [user_id], (err, results) => {
    if (err) {
      console.error("찜한 동물 목록 가져오기 실패:", err);
      res.status(500).json({ result: "에러 발생" });
      return;
    }

    res.json({ result: "찜한 동물 목록 가져오기 성공", pets: results });
  });
};

// 찜하기/찜 해제 토글
exports.toggleFavorite = (req, res) => {
  const { pet_num, user_id } = req.body;

  // 찜한 상태인지 확인하는 SQL 쿼리
  const checkSql =
    "SELECT * FROM favorite_info WHERE pet_num = ? AND user_id = ?";
  conn.query(checkSql, [pet_num, user_id], (err, results) => {
    if (err) {
      console.error("찜하기 체크 실패:", err);
      res.status(500).json({ result: "에러 발생" });
      return;
    }

    if (results.length > 0) {
      // 이미 찜한 상태면 찜 목록에서 삭제
      const deleteSql =
        "DELETE FROM favorite_info WHERE pet_num = ? AND user_id = ?";
      conn.query(deleteSql, [pet_num, user_id], (err, result) => {
        if (err) {
          console.error("찜 해제 실패:", err);
          res.status(500).json({ result: "찜 해제 실패" });
          return;
        }
        res.json({ result: "찜 해제 성공" });
      });
    } else {
      // 찜하지 않은 상태면 찜 목록에 추가
      const insertSql =
        "INSERT INTO favorite_info (pet_num, user_id, fav_at) VALUES (?, ?, NOW())";
      conn.query(insertSql, [pet_num, user_id], (err, result) => {
        if (err) {
          console.error("찜하기 실패:", err);
          res.status(500).json({ result: "찜하기 실패" });
          return;
        }
        res.json({ result: "찜하기 성공" });
      });
    }
  });
};

const conn = require("../config/db");

// 찜한 동물 목록 가져오기
exports.getLikedPets = (req, res) => {
  const { user_id } = req.query;

  // 찜한 동물 목록을 가져오는 SQL 쿼리
  const sql = `
    SELECT pet_info.pet_breed, pet_info.pet_gender, pet_info.pet_age
    FROM favorite_info 
    JOIN pet_info ON favorite_info.pet_num = pet_info.pet_num
    WHERE favorite_info.user_id = ?
  `;

  conn.query(sql, [user_id], (err, results) => {
    if (err) {
      console.error("찜한 동물 목록 가져오기 실패:", err);
      res.status(500).json({ result: "에러 발생" });
      return;
    }

    res.json({ result: "찜한 동물 목록 가져오기 성공", pets: results });
  });
};

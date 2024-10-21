const conn = require("../config/db");

// 유기동물 전체 이미지 또는 필터 조건에 따른 이미지 가져오기
exports.getFilteredPets = (req, res) => {
  const { type } = req.query; // 예: type=dog, type=cat, type=other
  let sql = "SELECT pet_img, pet_num FROM pet_info";

  if (type === "dog") {
    sql += " WHERE pet_breed LIKE '%개%'";
  } else if (type === "cat") {
    sql += " WHERE pet_breed LIKE '%고양이%'";
  } else if (type === "other") {
    sql += " WHERE pet_breed NOT LIKE '%개%' AND pet_breed NOT LIKE '%고양이%'";
  }

  conn.query(sql, (err, results) => {
    if (err) {
      console.error("유기동물 정보 가져오기 실패:", err);
      res.status(500).json({ result: "에러 발생" });
      return;
    }

    res.json({ result: "유기동물 정보 가져오기 성공", pets: results });
  });
};

// 유기동물 상세 정보 가져오기
exports.getPetDetails = (req, res) => {
  const { pet_num } = req.params; // pet_num을 URL 파라미터에서 가져옴

  const sql = "SELECT * FROM pet_info WHERE pet_num = ?";
  conn.query(sql, [pet_num], (err, results) => {
    if (err) {
      console.error("유기동물 상세 정보 가져오기 실패:", err);
      res.status(500).json({ result: "에러 발생" });
      return;
    }

    if (results.length > 0) {
      res.json({ result: "유기동물 상세 정보 가져오기 성공", pet: results[0] });
    } else {
      res.status(404).json({ result: "유기동물 정보를 찾을 수 없습니다" });
    }
  });
};

// 찜하기 (favorite_info에 추가)
exports.addFavorite = (req, res) => {
  const { pet_num, user_id } = req.body;

  const checkSql =
    "SELECT * FROM favorite_info WHERE pet_num = ? AND user_id = ?";
  conn.query(checkSql, [pet_num, user_id], (err, results) => {
    if (err) {
      console.error("찜하기 체크 실패:", err);
      res.status(500).json({ result: "에러 발생" });
      return;
    }

    if (results.length > 0) {
      // 이미 찜한 상태이면 favorite_info에서 삭제
      const deleteSql =
        "DELETE FROM favorite_info WHERE pet_num = ? AND user_id = ?";
      conn.query(deleteSql, [pet_num, user_id], (err, results) => {
        if (err) {
          console.error("찜 해제 실패:", err);
          res.status(500).json({ result: "찜 해제 실패" });
          return;
        }
        res.json({ result: "찜 해제 성공" });
      });
    } else {
      // 찜하지 않은 상태이면 favorite_info에 추가
      const insertSql =
        "INSERT INTO favorite_info (pet_num, user_id, fav_at) VALUES (?, ?, NOW())";
      conn.query(insertSql, [pet_num, user_id], (err, results) => {
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

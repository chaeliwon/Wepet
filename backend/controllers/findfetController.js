const conn = require("../config/db");

// 유기동물 전체 이미지 또는 필터 조건에 따른 이미지 가져오기
exports.getFilteredPets = (req, res) => {
  const { type, user_id } = req.query; // user_id도 쿼리로 받음

  // 유저의 찜한 동물 목록 가져오기
  const favoriteSql = "SELECT pet_num FROM favorite_info WHERE user_id = ?";
  conn.query(favoriteSql, [user_id], (err, favoriteResults) => {
    if (err) {
      console.error("찜 목록 가져오기 실패:", err);
      res.status(500).json({ result: "에러 발생" });
      return;
    }

    const favoritePetNums = favoriteResults.map((fav) => fav.pet_num); // 유저가 찜한 pet_num 목록

    let sql = "SELECT pet_img, pet_num FROM pet_info";
    if (type === "dog") {
      sql += " WHERE pet_breed LIKE '%개%'";
    } else if (type === "cat") {
      sql += " WHERE pet_breed LIKE '%고양이%'";
    } else if (type === "other") {
      sql +=
        " WHERE pet_breed NOT LIKE '%개%' AND pet_breed NOT LIKE '%고양이%'";
    }

    // 필터 조건에 맞는 유기동물 가져오기
    conn.query(sql, (err, petResults) => {
      if (err) {
        console.error("유기동물 정보 가져오기 실패:", err);
        res.status(500).json({ result: "에러 발생" });
        return;
      }

      // 각 유기동물에 대해 찜 여부(isFavorite) 추가
      const petsWithFavoriteStatus = petResults.map((pet) => ({
        ...pet,
        isFavorite: favoritePetNums.includes(pet.pet_num), // 찜한 동물인지 확인
      }));

      res.json({
        result: "유기동물 정보 가져오기 성공",
        pets: petsWithFavoriteStatus,
      });
    });
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

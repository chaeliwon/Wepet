const conn = require("../config/db");

// 유기동물 전체 이미지 또는 필터 조건에 따른 이미지 가져오기
exports.getFilteredPets = (req, res) => {
  const { type } = req.body;
  const user_id = req.session.user_id;
  console.log(user_id, type);

  // 모든 동물들의 이미지와 번호를 가져오는 기본 쿼리
  let sql = "SELECT pet_img, pet_num FROM pet_info";

  // 필터링 조건 추가
  if (type === "dog") {
    sql += " WHERE pet_breed LIKE '%개%'";
  } else if (type === "cat") {
    sql += " WHERE pet_breed LIKE '%고양이%'";
  } else if (type === "other") {
    sql += " WHERE pet_breed NOT LIKE '%개%' AND pet_breed NOT LIKE '%고양이%'";
  }

  // 모든 동물 데이터와 사용자의 찜 목록을 병렬로 가져오기
  const getAllPets = new Promise((resolve, reject) => {
    conn.query(sql, (err, pets) => {
      if (err) {
        return reject("유기동물 정보 가져오기 실패:", err);
      }
      resolve(pets);
    });
  });

  const getUserFavorites = new Promise((resolve, reject) => {
    const favSql = "SELECT pet_num FROM favorite_info WHERE user_id = ?";
    conn.query(favSql, [user_id], (err, favPets) => {
      if (err) {
        return reject("찜 목록 가져오기 실패:", err);
      }
      resolve(favPets.map((fav) => fav.pet_num));
    });
  });

  Promise.all([getAllPets, getUserFavorites])
    .then(([pets, userFavorites]) => {
      // 동물 목록을 순회하면서 찜한 동물 여부를 확인
      const resultPets = pets.map((pet) => ({
        pet_img: pet.pet_img,
        pet_num: pet.pet_num,
        isFavorite: userFavorites.includes(pet.pet_num), // 찜 목록에 있는지 확인
      }));

      res.json({ result: "유기동물 정보 가져오기 성공", pets: resultPets });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ result: "에러 발생" });
    });
};

// 유기동물 상세 정보 가져오기 (POST 방식)
exports.getPetDetails = (req, res) => {
  const { pet_num } = req.body; // user_id와 pet_num을 body에서 가져옴
  const user_id = req.session.user_id;

  const sql = "SELECT * FROM pet_info WHERE pet_num = ?";

  // 유기동물 상세 정보 가져오기 쿼리
  const getPetDetails = new Promise((resolve, reject) => {
    conn.query(sql, [pet_num], (err, results) => {
      if (err) {
        console.error("유기동물 상세 정보 가져오기 실패:", err);
        return reject("유기동물 상세 정보 가져오기 실패");
      }

      if (results.length > 0) {
        resolve(results[0]); // 동물 정보 반환
      } else {
        reject("유기동물 정보를 찾을 수 없습니다");
      }
    });
  });

  // 해당 동물이 찜 목록에 있는지 확인하는 쿼리
  const checkFavorite = new Promise((resolve, reject) => {
    const favSql =
      "SELECT * FROM favorite_info WHERE pet_num = ? AND user_id = ?";
    conn.query(favSql, [pet_num, user_id], (err, results) => {
      if (err) {
        console.error("찜 목록 조회 실패:", err);
        return reject("찜 목록 조회 실패");
      }
      resolve(results.length > 0); // 찜 여부를 반환 (true 또는 false)
    });
  });

  // Promise.all로 두 쿼리 병렬 실행
  Promise.all([getPetDetails, checkFavorite])
    .then(([petDetails, isFavorite]) => {
      res.json({
        result: "유기동물 상세 정보 가져오기 성공",
        pet: { ...petDetails, isFavorite }, // 찜 여부 추가
      });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ result: "에러 발생", error });
    });
};

// 찜하기 (favorite_info에 추가)
exports.addFavorite = (req, res) => {
  const { pet_num } = req.body;
  const user_id = req.session.user_id;
  console.log("찜하기 확인", user_id);

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

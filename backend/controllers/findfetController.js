const conn = require("../config/db");
const jwt = require("jsonwebtoken");

// 토큰 체크를 선택적으로 하는 함수
const getUserIdFromTokenOptional = (req) => {
  try {
    const token =
      req.headers.authorization?.split(" ")[1] || req.cookies?.jwtToken;
    if (!token) {
      return null;
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.userId;
  } catch (error) {
    return null;
  }
};

// 유기동물 전체 이미지 또는 필터 조건에 따른 이미지 가져오기
exports.getFilteredPets = (req, res) => {
  try {
    const { type } = req.body;
    const user_id = getUserIdFromTokenOptional(req);
    console.log("User ID (optional):", user_id);

    let sql = "SELECT pet_img, pet_num FROM pet_info";

    // 필터링 조건 추가
    if (type === "dog") {
      sql += " WHERE pet_breed LIKE '%개%'";
    } else if (type === "cat") {
      sql += " WHERE pet_breed LIKE '%고양이%'";
    } else if (type === "other") {
      sql +=
        " WHERE pet_breed NOT LIKE '%개%' AND pet_breed NOT LIKE '%고양이%'";
    }

    // 무작위 정렬과 54개 제한 추가
    sql += " ORDER BY RAND() LIMIT 54";

    // 동물 데이터 가져오기
    conn.query(sql, (err, pets) => {
      if (err) {
        console.error("유기동물 정보 가져오기 실패:", err);
        return res.status(500).json({ result: "에러 발생" });
      }

      // 로그인한 경우에만 찜 목록 확인
      if (user_id) {
        const favSql = "SELECT pet_num FROM favorite_info WHERE user_id = ?";
        conn.query(favSql, [user_id], (err, favPets) => {
          if (err) {
            console.error("찜 목록 가져오기 실패:", err);
            return res.status(500).json({ result: "에러 발생" });
          }

          const userFavorites = favPets.map((fav) => fav.pet_num);
          const resultPets = pets.map((pet) => ({
            pet_img: pet.pet_img,
            pet_num: pet.pet_num,
            isFavorite: userFavorites.includes(pet.pet_num),
          }));

          res.json({ result: "유기동물 정보 가져오기 성공", pets: resultPets });
        });
      } else {
        // 로그인하지 않은 경우 모든 isFavorite을 false로 설정
        const resultPets = pets.map((pet) => ({
          pet_img: pet.pet_img,
          pet_num: pet.pet_num,
          isFavorite: false,
        }));

        res.json({ result: "유기동물 정보 가져오기 성공", pets: resultPets });
      }
    });
  } catch (error) {
    console.error("에러 발생:", error);
    res.status(500).json({ result: "에러 발생" });
  }
};

// 유기동물 상세 정보 가져오기 (POST 방식)
exports.getPetDetails = async (req, res) => {
  try {
    const { pet_num } = req.body;
    let user_id = null;

    // 토큰이 있는 경우에만 사용자 ID 가져오기 시도
    try {
      const authHeader = req.headers.authorization;
      if (authHeader) {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        user_id = decoded.userId;
      }
    } catch (error) {
      console.log("토큰이 없거나 유효하지 않음 - 비로그인 사용자");
    }

    const sql = "SELECT * FROM pet_info WHERE pet_num = ?";

    // 유기동물 상세 정보 가져오기
    const getPetDetails = new Promise((resolve, reject) => {
      conn.query(sql, [pet_num], (err, results) => {
        if (err) {
          console.error("유기동물 상세 정보 가져오기 실패:", err);
          return reject("유기동물 상세 정보 가져오기 실패");
        }

        if (results.length > 0) {
          resolve(results[0]);
        } else {
          reject("유기동물 정보를 찾을 수 없습니다");
        }
      });
    });

    // 로그인한 사용자인 경우에만 찜 목록 확인
    const checkFavorite = user_id
      ? new Promise((resolve, reject) => {
          const favSql =
            "SELECT * FROM favorite_info WHERE pet_num = ? AND user_id = ?";
          conn.query(favSql, [pet_num, user_id], (err, results) => {
            if (err) {
              console.error("찜 목록 조회 실패:", err);
              return reject("찜 목록 조회 실패");
            }
            resolve(results.length > 0);
          });
        })
      : Promise.resolve(false);

    const [petDetails, favoriteStatus] = await Promise.all([
      getPetDetails,
      checkFavorite,
    ]);

    res.json({
      result: "유기동물 상세 정보 가져오기 성공",
      pet: { ...petDetails, isFavorite: favoriteStatus },
    });
  } catch (error) {
    console.error("에러 발생:", error);
    res.status(500).json({
      result: "에러 발생",
      error: error.message,
    });
  }
};

// 찜하기 (favorite_info에 추가)
exports.addFavorite = (req, res) => {
  try {
    const { pet_num } = req.body;
    const user_id = getUserIdFromTokenOptional(req);
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
  } catch (error) {
    console.error("인증 오류:", error);
    res.status(401).json({ result: error.message });
  }
};

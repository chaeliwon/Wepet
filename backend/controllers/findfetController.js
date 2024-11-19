const knex = require("../config/db");
const jwt = require("jsonwebtoken");

const getUserIdFromTokenOptional = (req) => {
  try {
    const token =
      req.headers.authorization?.split(" ")[1] || req.cookies?.jwtToken;
    if (!token) return null;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.userId;
  } catch (error) {
    return null;
  }
};

exports.getFilteredPets = async (req, res) => {
  try {
    const { type } = req.body;
    const userId = getUserIdFromTokenOptional(req);

    // 기본 쿼리 생성
    let query = knex.select("pet_img", "pet_num").from("pet_info");

    // 필터링 조건 추가
    if (type === "dog") {
      query = query.where("pet_breed", "like", "%개%");
    } else if (type === "cat") {
      query = query.where("pet_breed", "like", "%고양이%");
    } else if (type === "other") {
      query = query
        .whereNot("pet_breed", "like", "%개%")
        .whereNot("pet_breed", "like", "%고양이%");
    }

    // 랜덤 정렬 및 제한
    const pets = await query.orderByRaw("RAND()").limit(54);

    if (!userId) {
      return res.json({
        result: "유기동물 정보 가져오기 성공",
        pets: pets.map((pet) => ({ ...pet, isFavorite: false })),
      });
    }

    // 찜 목록 조회
    const favorites = await knex("favorite_info")
      .select("pet_num")
      .where("user_id", userId);

    const userFavorites = favorites.map((fav) => fav.pet_num);
    const resultPets = pets.map((pet) => ({
      pet_img: pet.pet_img,
      pet_num: pet.pet_num,
      isFavorite: userFavorites.includes(pet.pet_num),
    }));

    res.json({ result: "유기동물 정보 가져오기 성공", pets: resultPets });
  } catch (error) {
    console.error("에러 발생:", error);
    res.status(500).json({ result: "에러 발생" });
  }
};

exports.getPetDetails = async (req, res) => {
  try {
    const { pet_num } = req.body;
    const userId = getUserIdFromTokenOptional(req);

    const [petDetails] = await knex("pet_info")
      .select("*")
      .where("pet_num", pet_num);

    if (!petDetails) {
      throw new Error("유기동물 정보를 찾을 수 없습니다");
    }

    let isFavorite = false;
    if (userId) {
      const [favorite] = await knex("favorite_info").select("*").where({
        pet_num: pet_num,
        user_id: userId,
      });
      isFavorite = !!favorite;
    }

    res.json({
      result: "유기동물 상세 정보 가져오기 성공",
      pet: { ...petDetails, isFavorite },
    });
  } catch (error) {
    console.error("에러 발생:", error);
    res.status(500).json({
      result: "에러 발생",
      error: error.message,
    });
  }
};

exports.addFavorite = async (req, res) => {
  try {
    const { pet_num } = req.body;
    const userId = getUserIdFromTokenOptional(req);
    if (!userId) {
      return res.status(401).json({ result: "인증이 필요합니다" });
    }

    const [favorite] = await knex("favorite_info").select("*").where({
      pet_num: pet_num,
      user_id: userId,
    });

    if (favorite) {
      await knex("favorite_info")
        .where({
          pet_num: pet_num,
          user_id: userId,
        })
        .delete();
      res.json({ result: "찜 해제 성공" });
    } else {
      await knex("favorite_info").insert({
        pet_num: pet_num,
        user_id: userId,
        fav_at: knex.fn.now(),
      });
      res.json({ result: "찜하기 성공" });
    }
  } catch (error) {
    console.error("인증 오류:", error);
    res.status(500).json({ result: error.message });
  }
};

const knex = require("../config/db");
const jwt = require("jsonwebtoken");

// 찜한 동물 목록 가져오기
exports.getLikedPets = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ result: "인증이 필요합니다" });
  }

  try {
    const decoded = jwt.verify(
      authHeader.split(" ")[1],
      process.env.JWT_SECRET
    );
    const userId = decoded.userId;

    const pets = await knex("pet_info")
      .select(
        "pet_info.pet_breed",
        "pet_info.pet_gender",
        "pet_info.pet_age",
        "pet_info.pet_img",
        "pet_info.pet_num",
        "pet_info.pet_shelter"
      )
      .join("favorite_info", "favorite_info.pet_num", "pet_info.pet_num")
      .where("favorite_info.user_id", userId);

    const resultPets = pets.map((pet) => ({
      ...pet,
      isFavorite: true,
    }));

    res.json({
      result: "찜한 동물 목록 가져오기 성공",
      pets: resultPets,
    });
  } catch (error) {
    console.error("찜한 동물 목록 가져오기 실패:", error);
    res.status(401).json({ result: "인증 실패" });
  }
};

exports.toggleFavorite = async (req, res) => {
  const { pet_num } = req.body;
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ result: "인증이 필요합니다" });
  }

  try {
    const decoded = jwt.verify(
      authHeader.split(" ")[1],
      process.env.JWT_SECRET
    );
    const userId = decoded.userId;

    const favorite = await knex("favorite_info")
      .where({
        pet_num: pet_num,
        user_id: userId,
      })
      .first();

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
    console.error("토큰 검증 실패:", error);
    res.status(401).json({ result: "인증 실패" });
  }
};

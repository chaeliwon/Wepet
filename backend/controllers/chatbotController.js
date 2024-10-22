const axios = require("axios");

// .env 파일에서 필요한 환경 변수 로드
require("dotenv").config();

// 챗봇과의 대화를 처리하는 함수
exports.chatWithOpenAI = async (req, res) => {
  try {
    const { input } = req.body; // 사용자로부터 받은 입력

    // FastAPI로 요청을 보내 OpenAI와의 대화 결과를 받아옴
    const response = await axios.post(
      "http://localhost:8000/openai/chat", // FastAPI 백엔드의 경로
      { input }
    );

    // OpenAI 응답 결과를 프론트엔드로 전달
    res.json({ response: response.data.response });
  } catch (error) {
    console.error("챗봇 응답 처리 중 오류 발생:", error);
    res.status(500).json({ result: "에러 발생", error: error.message });
  }
};

const express = require("express");
const { chatWithOpenAI } = require("../controllers/chatbotController");
const router = express.Router();

// 상담 페이지에서 챗봇 응답 처리
router.post("/chat", chatWithOpenAI);

module.exports = router;

import React, { useState } from "react";
import "../css/ChatBot.css";
import AiMaru from "../assets/AiMaru.png";
import sendBtn from "../assets/sendbtn.png"; // 보내기 버튼 이미지

const ChatBot = () => {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "반갑습니다! 멍!" },
  ]);
  const [input, setInput] = useState("");

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const sendMessage = async () => {
    if (input.trim() === "") return;

    const newMessages = [...messages, { sender: "user", text: input }];
    setMessages(newMessages);
    setInput("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
        }),
      });

      const data = await response.json();
      const botReply = data.message;

      setMessages([...newMessages, { sender: "bot", text: botReply }]);
    } catch (error) {
      console.error("ChatGPT API 에러:", error);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-window">
        <div className="chat-header">
          <img src={AiMaru} alt="뒤로" className="chat-icon" />
          <h1 className="chat-title">AI 마루</h1>
        </div>

        <div className="chat-messages">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`message ${message.sender === "bot" ? "bot" : "user"}`}
            >
              {message.text}
            </div>
          ))}
        </div>

        <div className="chat-input">
          <textarea
            value={input}
            onChange={handleInputChange}
            placeholder="텍스트를 입력하세요."
          ></textarea>
          <button onClick={sendMessage}>
            <img src={sendBtn} alt="보내기" className="send-icon" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;

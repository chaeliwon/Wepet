import React, { useState, useEffect, useRef } from "react";
import "../css/ChatBot.css";
import AiMaru from "../assets/AiMaru.png";
import sendBtn from "../assets/sendbtn.png"; // 보내기 버튼 이미지
import background from "../assets/background.png"; // 배경 이미지 import

const ChatBot = () => {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "반갑습니다! 멍!" },
  ]);
  const [input, setInput] = useState("");
  const messagesRef = useRef(null);  // 스크롤 참조를 위한 useRef

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {  // Enter 키를 누를 때 메시지 전송
      e.preventDefault();  // 줄바꿈 방지
      sendMessage();
    }
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

  // 메시지가 업데이트될 때마다 스크롤을 맨 아래로 이동
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      className="chat-container"
      style={{
        backgroundImage: `url(${background})`,  // 인라인 스타일로 배경 이미지 설정
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="chat-window">
        <div className="chat-header">
          <img src={AiMaru} alt="뒤로" className="chat-icon" />
          <h1 className="chat-title">AI 마루</h1>
        </div>

        <div className="chat-messages" ref={messagesRef}>
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
            onKeyPress={handleKeyPress}  // Enter 키 이벤트 추가
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

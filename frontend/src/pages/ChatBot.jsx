import React, { useState, useEffect, useRef } from "react";
import "../css/ChatBot.css";
import AiMaru from "../assets/AiMaru.png";
import sendBtn from "../assets/sendbtn.png"; // 보내기 버튼 이미지
import background from "../assets/background.png"; // 배경 이미지 import
import axios from 'axios';  // Axios 사용

const ChatBot = () => {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "반갑습니다! 멍!", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
  ]);
  const [input, setInput] = useState("");
  const messagesRef = useRef(null);  // 스크롤 참조를 위한 useRef

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {  // Enter 키를 누를 때 메시지 전송
      e.preventDefault();
      sendMessage();
    }
  };

  const sendMessage = async () => {
    if (input.trim() === "") return;

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMessages = [...messages, { sender: "user", text: input, time: currentTime }];
    setMessages(newMessages);
    setInput("");

    try {
      // Node.js 서버로 메시지를 보내고 FastAPI 응답을 받음
      const response = await axios.post('http://localhost:3000/api/chat', {
        message: input,
      });

      // FastAPI 응답 메시지를 받아서 업데이트
      const botReply = response.data.message;
      setMessages([...newMessages, { sender: "bot", text: botReply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    } catch (error) {
      console.error('Node.js 요청 중 오류:', error);
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
            <div key={index} className={`message-wrapper ${message.sender === "bot" ? "bot-wrapper" : "user-wrapper"}`}>
              <div className={`message ${message.sender === "bot" ? "bot" : "user"}`}>
                {message.text}
              </div>
              <div className="message-time">{message.time}</div> {/* 메시지 아래에 시간 표시 */}
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

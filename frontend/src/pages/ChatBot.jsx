import React, { useState, useEffect, useRef } from "react";
import "../css/ChatBot.css";
import AiMaru from "../assets/AiMaru.png";
import sendBtn from "../assets/sendbtn.png";
import imgSend from "../assets/imgsend.png"; // 이미지 전송 버튼
import background from "../assets/background.png";
import axios from "axios";

const ChatBot = () => {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "반갑습니다! 멍!",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState(null); // 파일 상태
  const [previewUrl, setPreviewUrl] = useState(null); // 이미지 미리보기 URL 상태
  const messagesRef = useRef(null);

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file)); // 이미지 미리보기 URL 생성
  };

  const sendMessage = async () => {
    if (input.trim() === "") return;

    const currentTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const newMessages = [...messages, { sender: "user", text: input, time: currentTime }];
    setMessages(newMessages);
    setInput("");

    try {
      const response = await axios.post("https://<your-lambda-url>.lambda.amazonaws.com/api/chat", {
        message: input,
      });

      const botReply = response.data.message;
      setMessages([...newMessages, { sender: "bot", text: botReply, time: currentTime }]);
    } catch (error) {
      console.error("메시지 전송 중 오류:", error);
    }
  };

  const sendImage = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    const currentTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMessages((prev) => [...prev, { sender: "user", text: "이미지 전송 중...", time: currentTime }]);

    try {
      const response = await axios.post("https://<your-lambda-url>.lambda.amazonaws.com/api/search_by_image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const botReply = response.data.similar_pets ? `유사한 동물: ${response.data.similar_pets.join(", ")}` : "이미지 분석 결과가 없습니다.";
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { sender: "bot", text: botReply, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
      ]);
      setSelectedFile(null);
      setPreviewUrl(null); // 미리보기 URL 초기화
    } catch (error) {
      console.error("이미지 전송 중 오류:", error);
    }
  };

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      className="chat-container"
      style={{
        backgroundImage: `url(${background})`,
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
              <div className={`message ${message.sender === "bot" ? "bot" : "user"}`}>{message.text}</div>
              <div className="message-time">{message.time}</div>
            </div>
          ))}
        </div>

        {previewUrl && (
          <div className="image-preview">
            <img src={previewUrl} alt="미리보기" className="preview-image" />
          </div>
        )}

        <div className="chat-input">
          <label htmlFor="file-input" style={{ display: "none" }}>
            파일 선택
          </label>
          <input type="file" id="file-input" style={{ display: "none" }} onChange={handleFileChange} />
          <button onClick={() => document.getElementById("file-input").click()}>
            <img src={imgSend} alt="이미지 전송" className="send-icon" />
          </button>

          <textarea value={input} onChange={handleInputChange} onKeyPress={handleKeyPress} placeholder="텍스트를 입력하세요." />

          <button onClick={sendMessage}>
            <img src={sendBtn} alt="보내기" className="send-icon" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;

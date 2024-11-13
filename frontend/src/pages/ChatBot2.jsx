import React, { useState, useEffect, useRef } from "react";
import "../css/ChatBot2.css";
import AiNaru from "../assets/AiNaru.png";
import sendBtn from "../assets/sendbtn.png";
import axios from "axios";
import "swiper/css";
import "swiper/css/pagination";
import api from "../api";

const ChatBot2 = () => {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "반가워, 냥!",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [userId, setUserId] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const messagesRef = useRef(null);
  const loadingImage = "/static/LoadingImg.png";

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    api
      .get("/user/checkLoginStatus", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      })
      .then((response) => {
        if (response.data.isLoggedIn) {
          setIsLoggedIn(true);
          setUserId(response.data.userId);
        } else {
          setIsLoggedIn(false);
          setUserId(null);
        }
      })
      .catch((error) => {
        console.error("로그인 상태 확인 오류:", error);
        setIsLoggedIn(false);
      });
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
  });

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const cancelImagePreview = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const sendMessage = async () => {
    if (input.trim() === "") return;
    setShowModal(true);
    const currentTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const newMessages = [
      ...messages,
      { sender: "user", text: input, time: currentTime },
    ];
    setMessages(newMessages);
    setInput("");

    try {
      const token = localStorage.getItem("jwtToken");
      const response = await axios.post(
        "https://1ylnvxbbb9.execute-api.ap-northeast-2.amazonaws.com/openai/chat",
        { text: input, user_id: userId },
        {
          headers: {
            Authorization: `Bearer ${token}`, // JWT 토큰 추가
          },
        }
      );

      const botReply = (
        <div>
          <p>{response}</p>
        </div>
      );

      setMessages([
        ...newMessages,
        {
          sender: "bot",
          text: botReply,
          time: currentTime,
          isHtml: true,
        },
      ]);
    } catch (error) {
      console.error("메시지 전송 중 오류:", error);
      setMessages([
        ...newMessages,
        {
          sender: "bot",
          text: "찾고 싶은 동물의 특징을 적어주세요!",
          time: currentTime,
        },
      ]);
    }
    setShowModal(false);
  };

  const Modal = () => (
    <div className="modal-overlay2">
      <div className="modal-content2">
        <img src={loadingImage} alt="로딩 중..." className="loading-image2" />
      </div>
    </div>
  );

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="chat-container2">
      {showModal && <Modal />}
      <div className="chat-window2">
        <div className="chat-header2">
          <img src={AiNaru} alt="뒤로" className="chat-icon2" />
          <h1 className="chat-title2">AI 나루</h1>
        </div>

        <div className="chat-messages2" ref={messagesRef}>
          {messages.map((message, index) => (
            <div
              key={index}
              className={`message-wrapper2 ${
                message.sender === "bot" ? "bot-wrapper2" : "user-wrapper2"
              }`}
            >
              <div
                className={`message2 ${
                  message.sender === "bot" ? "bot2" : "user2"
                }`}
              >
                {message.isHtml ? (
                  <div>{message.text}</div>
                ) : (
                  <div>{message.text}</div>
                )}
              </div>
              <div className="message-time2">{message.time}</div>
            </div>
          ))}
        </div>

        <div className="chat-input2">
          <textarea
            value={input}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="텍스트를 입력하세요."
            className="textarea2"
          />
          <button onClick={sendMessage}>
            <img src={sendBtn} alt="보내기" className="send-icon2" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot2;

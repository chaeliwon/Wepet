import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
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
  const [userId, setUserId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const messagesRef = useRef(null);
  const loadingImage = "/static/NaruLoadingImg.png";

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

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
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
      const formData = new FormData();
      formData.append("user_id", userId);
      formData.append("input", input);
      const response = await axios({
        method: "post",
        url: "https://1ylnvxbbb9.execute-api.ap-northeast-2.amazonaws.com/openai/chat",
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      const botReply = response.data?.response || "응답을 받지 못했습니다.";

      setMessages([
        ...newMessages,
        {
          sender: "bot",
          text: botReply,
          time: currentTime,
        },
      ]);
    } catch (error) {
      console.error("메시지 전송 중 오류:", error);
      setMessages([
        ...newMessages,
        {
          sender: "bot",
          text: "현재 동물의 상태를 알려주세요!",
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
      {isLoggedIn ? (
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
      ) : (
        <div className="mylogin-prompt">
          <p>로그인 회원만 이용 가능합니다.</p>
          <Link to="/login">
            <button className="mylogin-btn">로그인 하러 가기</button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default ChatBot2;

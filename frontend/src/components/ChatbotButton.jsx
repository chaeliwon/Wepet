import React, { useState } from "react";
import { Link } from "react-router-dom";
import chatbotIcon from "../assets/ChatIcon.png";
import MaruIcon from "../assets/Maru.png";
import NaruIcon from "../assets/Naru.png";
import "../css/ChatbotButton.css"; // 스타일을 따로 관리할 경우

const ChatbotButton = () => {
  const [showOptions, setShowOptions] = useState(false);

  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };

  return (
    <div className="home-chatbot-button-container">
      <img
        src={chatbotIcon}
        alt="챗봇 버튼"
        className="home-chatbot-button"
        onClick={toggleOptions}
      />

      {showOptions && (
        <div className="home-chatbot-options">
          <Link to="/chatbot" className="icon-wrapper">
            <img src={MaruIcon} alt="마루 챗봇" className="option-button maru-option" />
            <span className="icon-text">입양문의</span>
          </Link>
          <Link to="/chatbot2" className="icon-wrapper">
            <img src={NaruIcon} alt="나루 챗봇" className="option-button naru-option" />
            <span className="icon-text">케어문의</span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default ChatbotButton;

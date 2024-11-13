import React, { useState } from "react";
import { Link } from "react-router-dom";
import chatbotIcon from "../assets/ChatIcon.png";
import MaruIcon from "../assets/Maru.png";
import NaruIcon from "../assets/Naru.png";
import "../css/ChatbotButton.css";

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
            <div className="balloon">
              <img
                src={`${process.env.PUBLIC_URL}/static/TxtMessage.png`}
                alt="말풍선"
                className="balloon-image"
              />
              <span className="balloon-text">
                저는 입양매칭을 도와주는 <br />
                <span className="bold-text">AI마루</span>입니다! 멍!
              </span>
            </div>
            <img src={MaruIcon} alt="마루 챗봇" className="option-button maru-option" />
          </Link>
          <Link to="/chatbot2" className="icon-wrapper">
            <div className="balloon">
              <img
                src={`${process.env.PUBLIC_URL}/static/TxtMessage.png`}
                alt="말풍선"
                className="balloon-image"
              />
              <span className="balloon-text">
                나는 문제행동을 분석하는 <br />
                <span className="bold-text">AI나루</span>다, 냥!
              </span>
            </div>
            <img src={NaruIcon} alt="나루 챗봇" className="option-button naru-option" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default ChatbotButton;

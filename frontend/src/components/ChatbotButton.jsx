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
    <div className="home-chatbot-button-container-botbtn">
      <img
        src={chatbotIcon}
        alt="챗봇 버튼"
        className="home-chatbot-button-botbtn"
        onClick={toggleOptions}
      />

      {showOptions && (
        <div className="home-chatbot-options-botbtn">
          <Link to="/chatbot" className="icon-wrapper-botbtn">
            <div className="balloon-botbtn">
              <img
                src={`${process.env.PUBLIC_URL}/static/TxtMessage.png`}
                alt="말풍선"
                className="balloon-image-botbtn"
              />
              <span className="balloon-text-botbtn">
                저는 입양매칭을 도와주는 <br />
                <span className="bold-text-botbtn">AI마루</span>입니다! 멍!
              </span>
            </div>
            <img src={MaruIcon} alt="마루 챗봇" className="option-button maru-option-botbtn" />
          </Link>
          <Link to="/chatbot2" className="icon-wrapper-botbtn">
            <div className="balloon-botbtn">
              <img
                src={`${process.env.PUBLIC_URL}/static/TxtMessage.png`}
                alt="말풍선"
                className="balloon-image-botbtn"
              />
              <span className="balloon-text-botbtn">
                나는 문제행동을 분석하는 <br />
                <span className="bold-text-botbtn">AI나루</span>다, 냥!
              </span>
            </div>
            <img src={NaruIcon} alt="나루 챗봇" className="option-button naru-option-botbtn" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default ChatbotButton;

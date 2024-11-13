import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../css/ChatBot2.css";
import AiNaru from "../assets/AiNaru.png";
import sendBtn from "../assets/sendbtn.png";
import imgSend from "../assets/imgsend.png";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination } from "swiper/modules";
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
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const messagesRef = useRef(null);
  const navigate = useNavigate();
  const loadingImage = "/static/LoadingImg.png";

  useEffect(() => {
    api
      .get("/user/checkLoginStatus", {
        withCredentials: true,
      })
      .then((response) => {
        if (response.data.isLoggedIn) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
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
      const response = await axios.post(
        "https://1ylnvxbbb9.execute-api.ap-northeast-2.amazonaws.com/search_by_text",
        { text: input }
      );

      const similarPetsList = response.data.similar_pets.map((pet) => ({
        num: pet.pet_num,
        imgUrl: pet.pet_img,
      }));

      const botReply = (
        <div>
          <p>이 친구들은 어떠세요?</p>
          <Swiper
            slidesPerView={2}
            centeredSlides={false}
            spaceBetween={5}
            grabCursor={true}
            pagination={{ clickable: true }}
            modules={[Pagination]}
            className="chatMySwiper2"
          >
            {similarPetsList.map((pet, index) => (
              <SwiperSlide
                key={index}
                onClick={() =>
                  window.open(`/findpet/petdetail/${pet.num}`, "_blank")
                }
              >
                <img
                  src={pet.imgUrl}
                  alt={`유사한 동물 ${index + 1}`}
                  className="swiper-pet-img2"
                />
              </SwiperSlide>
            ))}
          </Swiper>
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

  const sendImage = async () => {
    if (!selectedFile) return;

    setShowModal(true);

    const formData = new FormData();
    formData.append("file", selectedFile);

    const currentTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text: (
          <img
            src={previewUrl}
            alt="이미지 전송 중..."
            className="pet-img2"
            style={{ maxWidth: "100px", borderRadius: "8px" }}
          />
        ),
        time: currentTime,
        isHtml: true,
      },
    ]);

    setSelectedFile(null);
    setPreviewUrl(null);

    try {
      const response = await axios.post(
        "https://1ylnvxbbb9.execute-api.ap-northeast-2.amazonaws.com/search_by_image",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      console.log(response);

      const similarPetsList = response.data.similar_pets.map((pet) => ({
        num: pet.pet_num,
        imgUrl: pet.pet_img,
      }));
      const botReply = (
        <div>
          <p>이 친구들은 어떠세요?</p>
          <Swiper
            slidesPerView={2}
            centeredSlides={false}
            spaceBetween={5}
            grabCursor={true}
            pagination={{ clickable: true }}
            modules={[Pagination]}
            className="chatMySwiper2"
          >
            {similarPetsList.map((pet, index) => (
              <SwiperSlide
                key={index}
                onClick={() =>
                  window.open(`/findpet/petdetail/${pet.num}`, "_blank")
                }
              >
                <img
                  src={pet.imgUrl}
                  alt={`유사한 동물 ${index + 1}`}
                  className="swiper-pet-img2"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      );

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: botReply,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isHtml: true,
        },
      ]);
    } catch (error) {
      console.error("이미지 전송 중 오류:", error);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "이미지를 전송할 수 없습니다. 다시 시도해주세요.",
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
          <h1 className="chat-title2">AI 마루</h1>
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

        {previewUrl && (
          <div className="image-preview2">
            <img src={previewUrl} alt="미리보기" className="preview-image2" />
            <button className="cancel-preview2" onClick={cancelImagePreview}>
              X
            </button>
            <button onClick={sendImage} className="send-image-btn2">
              전송
            </button>
          </div>
        )}

        <div className="chat-input2">
          <label htmlFor="file-input" style={{ display: "none" }}>
            파일 선택
          </label>
          <input
            type="file"
            id="file-input"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          <button
            onClick={() => document.getElementById("file-input").click()}
          >
            <img src={imgSend} alt="이미지 전송" className="send-icon2" />
          </button>

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

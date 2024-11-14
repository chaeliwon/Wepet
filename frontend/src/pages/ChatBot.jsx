import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../css/ChatBot.css";
import AiMaru from "../assets/AiMaru.png";
import sendBtn from "../assets/sendbtn.png";
import imgSend from "../assets/imgsend.png";
import background from "../assets/background.png";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination } from "swiper/modules";
import api from "../api";

const ChatBot = () => {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      "text": "멍멍! 반갑습니다! 🐾\n\n저는 여러분의 새로운 가족을 찾아주는 AI 매칭 도우미 마루예요!\n\n제가 도와드리는 방법은 간단해요:\n\n플러스(+) 버튼을 눌러 찾고 싶은 동물 사진을 올려주시거나 원하시는 동물의 특징을 채팅으로 설명해주세요\n(예: 하얀 털에 검은 귀를 가진 강아지)\n\n외모나 체형 등 눈에 보이는 특징을 자세히 알려주시면 더 정확한 매칭이 가능합니다!\n\n함께 여러분의 평생 동반자를 찾아보아요! 🐶",
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
  const [similarPets, setSimilarPets] = useState([]);
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
            className="chatMySwiper"
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
                  className="swiper-pet-img"
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

    // 업로드한 이미지 미리보기 메시지를 JSX로 채팅에 추가
    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text: (
          <img
            src={previewUrl}
            alt="이미지 전송 중..."
            className="pet-img"
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
            className="chatMySwiper"
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
                  className="swiper-pet-img"
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
    <div className="modal-overlay">
      <div className="modal-content">
        <img src={loadingImage} alt="로딩 중..." className="loading-image" />
      </div>
    </div>
  );

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
      {showModal && <Modal />}
      {isLoggedIn ? (
        <div className="chat-window">
          <div className="chat-header">
            <img src={AiMaru} alt="뒤로" className="chat-icon" />
            <h1 className="chat-title">AI 마루</h1>
          </div>

          <div className="chat-messages" ref={messagesRef}>
            {messages.map((message, index) => (
              <div
                key={index}
                className={`message-wrapper ${
                  message.sender === "bot" ? "bot-wrapper" : "user-wrapper"
                }`}
              >
                <div
                  className={`message ${
                    message.sender === "bot" ? "bot" : "user"
                  }`}
                >
                  {message.isHtml ? (
                    <div>{message.text}</div> // JSX 요소를 직접 출력
                  ) : (
                    <div>{message.text}</div>
                  )}
                </div>
                <div className="message-time">{message.time}</div>
              </div>
            ))}
          </div>

          {previewUrl && (
            <div className="image-preview">
              <img src={previewUrl} alt="미리보기" className="preview-image" />
              <button className="cancel-preview" onClick={cancelImagePreview}>
                X
              </button>
              <button onClick={sendImage} className="send-image-btn">
                전송
              </button>
            </div>
          )}

          <div className="chat-input">
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
              <img src={imgSend} alt="이미지 전송" className="send-icon" />
            </button>

            {previewUrl && <div className="image-preview"></div>}
            <textarea
              value={input}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="텍스트를 입력하세요."
            />
            <button onClick={sendMessage}>
              <img src={sendBtn} alt="보내기" className="send-icon" />
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

export default ChatBot;

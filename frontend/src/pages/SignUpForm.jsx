import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../css/SignUpForm.css";
import api from "../api";

const SignupForm = () => {
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);
  const [nicknameError, setNicknameError] = useState(false);
  const [showDomain, setShowDomain] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isEmailChecked, setIsEmailChecked] = useState(false);
  const [checkEmailDup, setCheckEmailDup] = useState(false);
  const [codeSentMessage, setCodeSentMessage] = useState(false);
  const [matchCode, setMatchCode] = useState({
    message: "",
    status: ""
  });

  const pattern = /^[A-Za-z0-9_.@-]+@[A-Za-z0-9-]+\.[A-za-z0-9-]+/;
  const pwdSpecial = /[~`!@#$%^&*(),.?":{}|<>_\-/]/;

  const emailRef = useRef();
  const nickRef = useRef();
  const pwdRef = useRef();
  const codeRef = useRef();

  const nav = useNavigate();

  useEffect(() => {});

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setEmailError(false);
    setShowDomain(e.target.value === "");
    setIsEmailChecked(false);
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordError(false);
    if (confirmPassword) {
      setConfirmPasswordError(newPassword !== confirmPassword);
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const newConfirmPassword = e.target.value;
    setConfirmPassword(newConfirmPassword);
    setConfirmPasswordError(password !== newConfirmPassword);
  };

  const handleNicknameChange = (e) => {
    setNickname(e.target.value);
    setNicknameError(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    joinMember()
      .then(() => {
        console.log("Form submitted successfully!");
      })
      .catch((error) => {
        console.error("Form submission failed:", error);
      });
  };

  const emailCheck = async (e) => {
    e.preventDefault();

    setEmailError(false);
    setNicknameError(false);
    setPasswordError(false);
    setConfirmPasswordError(false);

    if (!pattern.test(email)) {
      setEmailError(true);
      return;
    }

    try {
      const response = await api.post("/user/check-email", { id: email });

      if (response.data.result === "사용 가능") {
        setModalMessage("이 이메일은 사용 가능합니다.");
        setIsEmailChecked(true);
        setCheckEmailDup(true);
        console.log("중복 확인 완료");
      } else {
        setModalMessage("이 이메일은 사용 불가능합니다.");
        setIsEmailChecked(false);
      }
      setShowModal(true);
    } catch (error) {
      console.error("이메일 중복 확인 중 오류 발생:", error);
    }
  };

  const Modal = ({ message, onClose }) => (
    <div className="modal-overlay">
      <div className="modal-content">
        <p>{message}</p>
        <button onClick={onClose}>닫기</button>
      </div>
    </div>
  );

  const closeModal = () => {
    setShowModal(false);
    setModalMessage("");
    if (modalMessage === "가입이 완료되었습니다.") {
      nav("/login");
    }
  };

  const joinMember = async () => {
    // 필수값 검증
    if (nickname.length === 0 || nickname.length > 8) {
      setNicknameError(true);
      setModalMessage("닉네임을 확인해주세요.");
      setShowModal(true);
      return;
    }
  
    if (!email || !pattern.test(email)) {
      setEmailError(true);
      setModalMessage("이메일을 확인해주세요.");
      setShowModal(true);
      return;
    }
  
    if (password.length < 10 || !pwdSpecial.test(password)) {
      setPasswordError(true);
      setModalMessage("비밀번호를 확인해주세요.");
      setShowModal(true);
      return;
    }
  
    if (password !== confirmPassword) {
      setConfirmPasswordError(true);
      setModalMessage("비밀번호가 일치하지 않습니다.");
      setShowModal(true);
      return;
    }
  
    if (!isEmailChecked) {
      setModalMessage("이메일 중복 확인을 완료해주세요.");
      setShowModal(true);
      return;
    }
  
    // 이메일 인증 코드 확인
    if (matchCode.status !== "success") {
      setModalMessage("이메일 인증을 완료해주세요.");
      setShowModal(true);
      return;
    }
  
    try {
      const response = await api.post("/user/join", {
        id: email,
        pw: password,
        nick: nickname,
      });
      
      if (response.data.result === "가입 성공") {
        setModalMessage("가입이 완료되었습니다.");
        setShowModal(true);
      } else {
        setModalMessage("가입에 실패했습니다.");
        setShowModal(true);
      }
    } catch (error) {
      console.error("회원가입 중 오류 발생:", error);
      setModalMessage("회원가입 중 오류가 발생했습니다.");
      setShowModal(true);
    }
  };

  const sendCode = async () => {
    let email = emailRef.current.value;
    let signup = "signup";

    try {
      const response = await api.post("/user/send-reset-code", {
        email: email,
        type: signup,
      });
      console.log(response);
      setCodeSentMessage(true);
    } catch (error) {
      console.error("인증 코드 발송 중 오류:", error);
    }
  };

  const checkCode = async () => {
    let code = codeRef.current.value;
    let email = emailRef.current.value;
    try {
      const response = await api.post("/user/verify-reset-code", {
        email: email,
        code: code,
      });
      console.log(response);
      if (response.data.result === "인증 코드 일치") {
        setMatchCode({
          message: "코드가 확인됐습니다.",
          status: "success"
        });
        setCodeSentMessage(false);  // 여기에 추가
      } else {
        setMatchCode({
          message: "코드를 다시 확인해주세요",
          status: "error"
        });
      }
    } catch (error) {
      console.error("코드 확인 중 오류 발생:", error);
      setMatchCode({
        message: "코드를 다시 확인해주세요",
        status: "error"
      });
    }
  };
  
  return (
    <div className="signup-container">
      <h1 className="signup-title">함께해요!</h1>
      <p className="signup-subtitle">회원이 되어 멍냥이들을 도와주세요!</p>
      <form onSubmit={handleSubmit} className="signup-form">
        <label htmlFor="nickname" className="signup-label">
          닉네임
        </label>
        <div className="input-container-signup">
          <input
            type="text"
            id="nickname"
            name="nickname"
            value={nickname}
            onChange={handleNicknameChange}
            placeholder="최대 8글자까지 입력 가능합니다."
            required
            ref={nickRef}
          />
        </div>
        {nicknameError && (
          <p className=" dation-error-signup">
            닉네임을 최대 8글자까지 입력해주세요.
          </p>
        )}

        <label htmlFor="email" className="signup-label">
          이메일
        </label>
        <div className="input-container">
          <input
            type="text"
            id="email"
            name="email"
            value={email}
            onChange={handleEmailChange}
            placeholder="이메일을 입력하세요"
            onFocus={() => setShowDomain(false)}
            onBlur={() => setShowDomain(email === "")}
            required
            ref={emailRef}
          />
          {showDomain}
          <input
            type="button"
            className="check-email-signup"
            onClick={emailCheck}
            value="중복확인"
          ></input>
        </div>
        {checkEmailDup ? (
          <div className="check-code-box">
            <div className="check-code-label">
              <label htmlFor="email" className="signup-label">
                이메일 인증코드
              </label>
            </div>
            <div className="input-container-signup">
              <input
                type="number"
                placeholder="인증코드를 입력하세요"
                ref={codeRef}
              />
              {showDomain}

              <div className="check-code-btn-box">
                <input
                  type="button"
                  className="send-signup-code-btn"
                  value="인증코드 발송"
                  onClick={() => sendCode()}
                ></input>
                <input
                  type="button"
                  className="submit-code-btn"
                  value="입력"
                  onClick={() => checkCode()}
                ></input>
              </div>
              {matchCode.message && (
                <p className={`validation-message ${matchCode.status}`}>
                  {matchCode.message}
                </p>
              )}
            </div>
          </div>
        ) : (
          ""
        )}
        {emailError && (
          <p className="validation-error-signup">이메일을 정확하게 입력해주세요.</p>
        )}
        {showModal && <Modal message={modalMessage} onClose={closeModal} />}
        {codeSentMessage && (
          <p className="validation-message">인증코드가 발송되었습니다.</p>
        )}

        <label htmlFor="password" className="signup-label">
          비밀번호
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={password}
          onChange={handlePasswordChange}
          placeholder="비밀번호 입력 (숫자, 특수문자 포함 10글자 이상)"
          required
          ref={pwdRef}
        />
        {passwordError && (
          <p className="validation-error-signup">
            비밀번호는 10글자 이상으로 특수기호를 조합해서 사용해주세요.
          </p>
        )}

        <label htmlFor="confirmPassword" className="signup-label">
          비밀번호 확인
        </label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={confirmPassword}
          onChange={handleConfirmPasswordChange}
          placeholder="비밀번호 재입력"
          required
        />
        {confirmPasswordError && (
          <p className="validation-error-signup">비밀번호가 일치하지 않습니다.</p>
        )}

        <button type="submit" className="signup-btn">
          가입 완료 🐾
        </button>
      </form>
    </div>
  );
};

export default SignupForm;
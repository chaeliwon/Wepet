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
  const [matchCode, setMatchCode] = useState(false);

  // 이메일 형식 구성
  const pattern = /^[A-Za-z0-9_\.\-]+@[A-Za-z0-9\-]+\.[A-za-z0-9\-]+/;
  // 비밀번호 특수문자 포함
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
    setPassword(e.target.value);
    setPasswordError(false);
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    setConfirmPasswordError(false);
  };

  const handleNicknameChange = (e) => {
    setNickname(e.target.value);
    setNicknameError(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setEmailError(false);
    setNicknameError(false);
    setPasswordError(false);
    setConfirmPasswordError(false);

    let valid = true;

    // 닉네임 검사
    if (nickname.length === 0 || nickname.length > 8) {
      setNicknameError(true);
      valid = false;
    }

    if (email === "") {
      setEmailError(true);
      valid = false;
    } else if (pattern.test(email) === false) {
      setEmailError(true);
      valid = false;
    }

    if (password.length < 10 || !pwdSpecial.test(password)) {
      setPasswordError(true);
      valid = false;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError(true);
      valid = false;
    }

    if (!isEmailChecked) {
      // 중복확인을 누르지 않은 경우 모든 에러 메시지 표시
      setEmailError(true);
      setNicknameError(true);
      setPasswordError(true);
      setConfirmPasswordError(true);
      setModalMessage("중복 확인을 완료해주세요.");
      setShowModal(true);
      return;
    }

    // if (valid) {
    //   console.log("Form submitted successfully!");
    //   // 가입 완료 로직을 여기서 처리합니다.
    // }
  };

  // 이메일 중복확인
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
    let email = emailRef.current.value;
    let nick = nickRef.current.value;
    let pwd = pwdRef.current.value;

    const response = await api.post("/user/join", {
      id: email,
      pw: pwd,
      nick: nick,
    });
    if (response.data.result === "가입 성공") {
      setModalMessage("가입이 완료되었습니다.");
      setShowModal(true);
    } else {
      setModalMessage("가입에 실패했습니다.");
      setShowModal(true);
    }
  };
  // 인증코드 발송
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

  // 인증코드 확인
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
        setMatchCode("코드가 확인됐습니다.");
      } else {
        setMatchCode("코드를 다시 확인해주세요");
      }
    } catch (error) {
      console.error("코드 확인 중 오류 발생:", error);
      setMatchCode("코드를 다시 확인해주세요");
    }
  };

  return (
    <div className="signup-container">
      <h1 className="signup-title">회원가입</h1>
      <p className="signup-subtitle">회원이 되어 멍냥이들을 도와주세요!</p>
      <form onSubmit={handleSubmit} className="signup-form">
        <label htmlFor="nickname" className="signup-label">
          닉네임
        </label>
        <div className="input-container">
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
          <p className="validation-error">
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
            className="check-email"
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
            <div className="input-container">
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
            </div>
          </div>
        ) : (
          ""
        )}
        {emailError && (
          <p className="validation-error">이메일을 정확하게 입력해주세요.</p>
        )}
        {showModal && <Modal message={modalMessage} onClose={closeModal} />}
        {codeSentMessage && (
          <p className="validation-error">인증코드가 발송되었습니다.</p>
        )}
        {matchCode && <p className="validation-error">{matchCode}</p>}
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
          <p className="validation-error">
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
          <p className="validation-error">비밀번호가 일치하지 않습니다.</p>
        )}

        <button type="submit" className="signup-btn" onClick={joinMember}>
          가입 완료 🐾
        </button>
      </form>
    </div>
  );
};

export default SignupForm;

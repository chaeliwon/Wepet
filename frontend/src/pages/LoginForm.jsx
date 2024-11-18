import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/LoginForm.css";
import kakaoIcon from "../assets/kakaotalk.png";
import googleIcon from "../assets/google.png";
import WePetLoginLogo from "../assets/WePetLoginLogo.png";
import jelly from "../assets/jelly.png";
import api from "../api";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [showDomain, setShowDomain] = useState(true);
  const [loginFail, setLoginFail] = useState(false);

  const navigate = useNavigate();

  // 이메일 형식 구성
  const pattern = /^[A-Za-z0-9_\.\-]+@[A-Za-z0-9\-]+\.[A-za-z0-9\-]+/;

  // Kakao 로그인
  const handleKakaoLogin = () => {
    const authUrl = `https://5zld3up4c4.execute-api.ap-northeast-2.amazonaws.com/dev/auth/kakao`;
    window.location.href = authUrl;
  };

  // Google 로그인
  const handleGoogleLogin = () => {
    const authUrl = `https://5zld3up4c4.execute-api.ap-northeast-2.amazonaws.com/dev/auth/google`;
    window.location.href = authUrl;
  };

  // URL에서 JWT 토큰 추출 및 저장
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const error = urlParams.get("error");

    if (token) {
      localStorage.setItem("token", token);
      navigate("/");
    } else if (error) {
      setLoginFail(true);
    }
  }, [navigate]);

  // // 소셜 로그인 완료 후 처리를 위한 이벤트 리스너
  // useEffect(() => {
  //   console.log("Setting up social login message listener");

  //   const handleSocialLogin = (event) => {
  //     console.log("Received message:", event);

  //     if (
  //       event.origin !==
  //       "https://5zld3up4c4.execute-api.ap-northeast-2.amazonaws.com"
  //     ) {
  //       console.log("Message from unauthorized origin:", event.origin);
  //       return;
  //     }

  //     if (event.data.token) {
  //       console.log("Received token from social login:", event.data.token);
  //       localStorage.setItem("token", event.data.token);
  //       navigate("/");
  //     }
  //   };

  //   window.addEventListener("message", handleSocialLogin);
  //   return () => {
  //     console.log("Cleaning up message listener");
  //     window.removeEventListener("message", handleSocialLogin);
  //   };
  // }, [navigate]);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setEmailError(false);
    setShowDomain(e.target.value === "");
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setPasswordError(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let valid = true;

    if (email === "") {
      setEmailError(true);
      valid = false;
    } else if (pattern.test(email) === false) {
      setEmailError(true);
      valid = false;
    }

    if (password.length < 8) {
      setPasswordError(true);
      valid = false;
    }

    if (!valid) return;

    try {
      const response = await api.post("/user/login", {
        id: email,
        pw: password,
      });

      if (response.data.result === "로그인 성공") {
        console.log("로그인 성공:", response.data);
        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
        }
        navigate("/");
      } else {
        console.error("로그인 실패:", response.data.message);
      }
    } catch (error) {
      console.error("로그인 중 오류 발생:", error);
      setLoginFail(true);
    }
  };

  return (
    <div className="login-container">
      <img
        src={WePetLoginLogo}
        alt="We Pet Login Logo"
        className="login-logo"
      />
      <form onSubmit={handleSubmit}>
        <label htmlFor="useremail">이메일</label>
        <div className="input-container-login">
          <input
            type="text"
            id="useremail"
            name="useremail"
            value={email}
            onChange={handleEmailChange}
            placeholder="이메일을 입력하세요"
            onFocus={() => setShowDomain(false)}
            onBlur={() => setShowDomain(email === "")}
            required
          />
          {showDomain && <span className="email-domain-login">@email.com</span>}
        </div>
        {emailError && (
          <p className="validation-error-login">
            이메일 주소를 정확하게 입력해주세요.
          </p>
        )}
        <label htmlFor="password" className="password-label-login">
          비밀번호
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={password}
          onChange={handlePasswordChange}
          placeholder="비밀번호를 입력하세요"
          required
        />
        {passwordError && (
          <p className="validation-error-login">
            비밀번호를 정확하게 입력해주세요.
          </p>
        )}

        <Link
          to="/find-id-password"
          className="find-link-login"
          style={{ textDecoration: "none" }}
        >
          비밀번호 찾기
        </Link>

        <button type="submit" className="login-btn-login">
          로그인 🐾
        </button>
        {loginFail && (
          <p className="validity-message">입력 정보를 확인해주세요.</p>
        )}
      </form>

      {/* 소셜 로그인 부분을 form 밖으로 이동 */}
      <div className="social-login-box">
        <div className="social-login-lg">
          <button
            type="button"
            className="kakao-login-lg"
            onClick={handleKakaoLogin}
          >
            <img src={kakaoIcon} alt="Kakao" />
          </button>
        </div>
        <div className="social-login-lg">
          <button
            type="button"
            className="google-login-lg"
            onClick={handleGoogleLogin}
          >
            <img src={googleIcon} alt="Google" />
          </button>
        </div>
      </div>

      <Link to="/signup" className="signup-link-login">
        <p className="not-member-login" style={{ textDecoration: "none" }}>
          아직 회원이 아니신가요?
          <span className="signup-text-login">회원가입하기!</span>
        </p>
      </Link>
    </div>
  );
};

export default LoginForm;

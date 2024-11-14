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
  const handleKakaoLogin = async () => {
    try {
      console.log("Starting Kakao login process");
      const response = await fetch(
        "https://5zld3up4c4.execute-api.ap-northeast-2.amazonaws.com/dev/auth/kakao",
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json();
      console.log("Received response:", data);

      if (response.status === 302 && data.url) {
        console.log("Redirecting to:", data.url);
        window.location.href = data.url;
      } else if (response.headers.get("Location")) {
        console.log("Redirecting to:", response.headers.get("Location"));
        window.location.href = response.headers.get("Location");
      } else {
        console.error("No redirect URL found in response");
      }
    } catch (error) {
      console.error("Error during Kakao login:", error);
    }
  };

  // Google 로그인
  const handleGoogleLogin = () => {
    console.log("Initiating Google login");
    const googleAuthUrl = `https://5zld3up4c4.execute-api.ap-northeast-2.amazonaws.com/dev/auth/google`;

    window.location.href = googleAuthUrl; // 팝업 대신 전체 페이지 리다이렉션
  };

  // URL에서 JWT 토큰 추출 및 저장
  useEffect(() => {
    console.log("Checking URL for token");
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    console.log("Token from URL:", token);

    if (token) {
      console.log("Token found, storing in localStorage");
      localStorage.setItem("token", token);
      console.log("Navigating to home page");
      navigate("/");
    } else {
      console.log("No token found in URL");
    }
  }, [navigate]);

  // 소셜 로그인 완료 후 처리를 위한 이벤트 리스너
  useEffect(() => {
    console.log("Setting up social login message listener");

    const handleSocialLogin = (event) => {
      console.log("Received message:", event);

      if (
        event.origin !==
        "https://5zld3up4c4.execute-api.ap-northeast-2.amazonaws.com"
      ) {
        console.log("Message from unauthorized origin:", event.origin);
        return;
      }

      if (event.data.token) {
        console.log("Received token from social login:", event.data.token);
        localStorage.setItem("token", event.data.token);
        navigate("/");
      }
    };

    window.addEventListener("message", handleSocialLogin);
    return () => {
      console.log("Cleaning up message listener");
      window.removeEventListener("message", handleSocialLogin);
    };
  }, [navigate]);

  // 소셜 로그인 완료 후 처리를 위한 이벤트 리스너
  useEffect(() => {
    const handleSocialLogin = (event) => {
      if (
        event.origin !==
        "https://5zld3up4c4.execute-api.ap-northeast-2.amazonaws.com"
      )
        return;

      if (event.data.token) {
        localStorage.setItem("token", event.data.token);
        navigate("/");
      }
    };

    window.addEventListener("message", handleSocialLogin);
    return () => window.removeEventListener("message", handleSocialLogin);
  }, [navigate]);

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
        <div className="input-container">
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
          {showDomain && <span className="email-domain">@email.com</span>}
        </div>
        {emailError && (
          <p className="validation-error">
            이메일 주소를 정확하게 입력해주세요.
          </p>
        )}
        <label htmlFor="password" className="password-label">
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
          <p className="validation-error">비밀번호를 정확하게 입력해주세요.</p>
        )}

        <Link
          to="/find-id-password"
          className="find-link"
          style={{ textDecoration: "none" }}
        >
          비밀번호 찾기
        </Link>

        <button type="submit" className="login-btn">
          로그인
          <img src={jelly} alt="paw" className="jelleyicon" />
        </button>
        {loginFail && (
          <p className="validation-error-login">입력 정보를 확인해주세요.</p>
        )}
      </form>

      {/* 소셜 로그인 부분을 form 밖으로 이동 */}
      <div className="social-login-box">
        <div className="social-login">
          <button
            type="button"
            className="kakao-login"
            onClick={handleKakaoLogin}
          >
            <img src={kakaoIcon} alt="Kakao" />
          </button>
        </div>
        <div className="social-login">
          <button
            type="button"
            className="google-login"
            onClick={handleGoogleLogin}
          >
            <img src={googleIcon} alt="Google" />
          </button>
        </div>
      </div>

      <Link to="/signup" className="signup-link">
        <p className="not-member" style={{ textDecoration: "none" }}>
          아직 회원이 아니신가요?
        </p>
      </Link>
    </div>
  );
};

export default LoginForm;

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useGoogleLogin } from '@react-oauth/google';  // Google Login Hook 추가
import "../css/LoginForm.css";
import googleIcon from "../assets/google.png";
import kakaoIcon from "../assets/kakaotalk.png";
import WePetLoginLogo from "../assets/WePetLoginLogo.png";
import jelly from "../assets/jelly.png";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [showDomain, setShowDomain] = useState(true);

  useEffect(() => {
    if (!window.Kakao.isInitialized()) {
      window.Kakao.init(process.env.REACT_APP_KAKAO_JS_KEY); 
      console.log(window.Kakao.isInitialized());
    }
  }, []);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setEmailError(false);
    setShowDomain(e.target.value === "");
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setPasswordError(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let valid = true;

    if (!email.includes("@")) {
      setEmailError(true);
      valid = false;
    }

    if (password.length < 8) {
      setPasswordError(true);
      valid = false;
    }

    if (valid) {
      fetch("http://yourserver.com/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            console.log("로그인 성공:", data);
          } else {
            console.log("로그인 실패:", data.message);
          }
        })
        .catch((error) => {
          console.error("로그인 중 오류 발생:", error);
        });
    }
  };

  const handleKakaoLogin = () => {
    window.Kakao.Auth.authorize({
      redirectUri: "http://localhost:3000/login", 
    });
  };

  // 구글 로그인 버튼 클릭 시 호출되는 함수
  const googleLogin = useGoogleLogin({
    onSuccess: (response) => {
      console.log("Google 로그인 성공:", response);
      fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: {
          Authorization: `Bearer ${response.access_token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("Google User Data:", data);
          // 여기서 data를 가지고 로그인 처리
        })
        .catch((error) => console.error("Google User Data Fetch Error:", error));
    },
    onError: (error) => {
      console.error("Google 로그인 실패:", error);
    },
  });

  return (
    <div className="login-container">
      <img src={WePetLoginLogo} alt="We Pet Login Logo" className="login-logo" />
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
          {showDomain && <span className="email-domain">@gmail.com</span>}
        </div>
        {emailError && <p className="validation-error">이메일 주소를 정확하게 입력해주세요.</p>}
        <label htmlFor="password" className="password-label">비밀번호</label>
        <input
          type="password"
          id="password"
          name="password"
          value={password}
          onChange={handlePasswordChange}
          placeholder="비밀번호를 입력하세요"
          required
        />
        {passwordError && <p className="validation-error">비밀번호를 정확하게 입력해주세요.</p>}
        
        <Link to="/find-id-password" className="find-link" style={{ textDecoration: "none" }}>
        비밀번호 찾기
        </Link>
        
        <button type="submit" className="login-btn">
          로그인
          <img src={jelly} alt="paw" className="jellyicon" />
        </button>

        <div className="social-login">
          <button className="kakao-login" onClick={handleKakaoLogin}>
            <img src={kakaoIcon} alt="Kakao" />
          </button>
          <button className="google-login" onClick={() => googleLogin()}>
            <img src={googleIcon} alt="Google" />
          </button>
        </div>

        <Link to="/signup" className="signup-link">
          <p className="not-member" style={{ textDecoration: "none" }}>
            아직 회원이 아니신가요?
          </p>
        </Link>
      </form>
    </div>
  );
};

export default LoginForm;

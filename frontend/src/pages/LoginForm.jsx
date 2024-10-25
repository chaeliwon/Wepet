import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";  // useNavigate 추가
import { useGoogleLogin } from '@react-oauth/google';  
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

  const navigate = useNavigate(); 

  // Kakao SDK 초기화 로직
  useEffect(() => {
    const kakaoAppKey = process.env.REACT_APP_KAKAO_JS_KEY;
    if (!window.Kakao) {
      console.error("Kakao SDK가 로드되지 않았습니다. 스크립트를 확인하세요.");
      return;
    }

    if (kakaoAppKey && !window.Kakao.isInitialized()) {
      window.Kakao.init(kakaoAppKey); 
      console.log(window.Kakao.isInitialized());
    }
  }, []);

  // URL에서 JWT 토큰 추출 및 저장
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
      localStorage.setItem('jwtToken', token);
      navigate('/'); // 메인 페이지로 리디렉션
    }
  }, [navigate]);

  // 로그인된 사용자가 있으면 자동으로 메인 페이지로 이동
  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      navigate('/');  // 로그인된 사용자는 메인 페이지로 리디렉션
    }
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
      fetch("http://localhost:3001/api/login", {  
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
          if (data.success && data.token) {
            console.log("로그인 성공:", data);
            localStorage.setItem('jwtToken', data.token);  // JWT 저장
            navigate("/");  // 메인 페이지로 리디렉션
          } else {
            console.log("로그인 실패:", data.message);
          }
        })
        .catch((error) => {
          console.error("로그인 중 오류 발생:", error);
        });
    }
  };

  // Kakao 로그인
  const handleKakaoLogin = () => {
    window.Kakao.Auth.authorize({
      redirectUri: "http://localhost:3000/login",  
    });
  };

  // 구글 로그인
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
          console.log("Google 사용자 정보:", data);
          // Google 사용자 정보를 백엔드로 전송하여 JWT 발급
          fetch("http://localhost:3001/api/google-login", {  
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              googleId: data.sub,
              email: data.email,
            }),
          })
          .then((res) => res.json())
          .then((data) => {
            if (data.token) {
              localStorage.setItem('jwtToken', data.token);  // JWT 저장
              navigate("/");  // 메인 페이지로 리디렉션
            } else {
              alert("로그인 실패. 다시 시도해주세요.");
            }
          })
          .catch((error) => {
            console.error("Google 로그인 처리 중 오류 발생:", error);
          });
        })
        .catch((error) => console.error("Google 사용자 정보 가져오기 실패:", error));
    },
    onError: (error) => {
      console.error("Google 로그인 실패:", error);
      alert("Google 로그인 실패. 다시 시도해주세요.");
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

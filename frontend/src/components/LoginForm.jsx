import React from 'react';
import { Link } from 'react-router-dom';
import './css/LoginForm.css';

const LoginForm = () => {
  return (
    <div className="login-container">
      <h1>로 그 인</h1>
      <form>
        <label htmlFor="useremail">이메일</label>
        <input type="text" id="useremail" name="useremail" required />
        
        <label htmlFor="password">비밀번호</label>
        <input type="password" id="password" name="password" required />
        
        <Link to="/password-reset" className="find-link">아이디/비밀번호 찾기</Link> {/* 여기에 추가 */}
        
        <button type="submit" className="login-btn">로그인🥑</button>
      </form>
    </div>
  );
}

export default LoginForm;

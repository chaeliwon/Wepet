import React from 'react';
import './css/LoginForm.css';

const LoginForm = () => {
  return (
    <div className="login-container">
      <h1>로 그 인</h1>
      <form>
        <label htmlFor="username">아이디</label>
        <input type="text" id="username" name="username" required />
        
        <label htmlFor="password">비밀번호</label>
        <input type="password" id="password" name="password" required />
        
        <button type="submit" className="login-btn">로그인🥑</button>
      </form>
    </div>
  );
}

export default LoginForm;
 
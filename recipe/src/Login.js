import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "./UserContext";
import "./Login.css";
import FormGroup from "./FormGroup";
import API_URL from "./config";

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 백엔드 API에 로그인 요청
      const response = await fetch(`${API_URL}/api/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      // 로그인 성공 시
      if (response.ok) {
        // JWT 토큰을 문자열로 받아옴
        const token = await response.text();

        // JWT 토큰을 localStorage에 저장
        localStorage.setItem("jwt", token);

        // JWT 토큰을 디코딩하여 유저 정보를 추출 (예시: 이메일과 역할)
        // const decodedToken = JSON.parse(atob(token.split('.')[1])); // JWT 디코딩
        // const { email: userEmail, role } = decodedToken;

        // 유저 정보 저장
        setUser({ email, role: "member" });

        // 홈 화면으로 이동
        navigate("/");
      } else {
        const errorData = await response.json();
        setError(errorData.message || "로그인에 실패했습니다.");
      }
    } catch (err) {
      setError("서버와의 통신 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>로그인</h2>
      <form className="login-form" onSubmit={handleLogin}>
        <FormGroup
          label="이메일"
          name="email"
          type="email"
          placeholder="예) abc@gmail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <FormGroup
          label="비밀번호"
          name="password"
          type="password"
          placeholder="비밀번호를 입력하세요"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <div className="error-message">{error}</div>}
        <button type="submit" disabled={loading}>
          {loading ? "로그인 중..." : "로그인"}
        </button>
      </form>
      <div className="login-links">
        <p onClick={() => navigate("/findEmail")}>이메일 찾기</p>
        <p onClick={() => navigate("/findPw")}>비밀번호 찾기</p>
        <p onClick={() => navigate("/signUp")}>회원가입</p>
      </div>
    </div>
  );
}
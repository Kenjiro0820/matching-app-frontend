import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signupUserApi } from "../api/authApi";
import { useAuth } from "../context/AuthContext";

export default function SignupPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setLoading(true);
      setErrorMessage("");
      const result = await signupUserApi({ name, email, password });
      login(result);
      navigate("/swipe", { replace: true });
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message || "新規登録に失敗しました。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <section className="auth-hero surface-card auth-hero--signup">
        <p className="eyebrow">NEW ACCOUNT</p>
        <h1 className="hero-title">まずはアカウントを作って、今日の合コン相手を探そう。</h1>
        <p className="section-description">
          登録後は代表者プロフィールとグループプロフィールを整えるだけで、すぐに出会いを始められます。
        </p>
      </section>

      <section className="auth-card surface-card">
        <p className="eyebrow">SIGN UP</p>
        <h2 className="section-title">新規登録</h2>
        <p className="section-description">基本情報を入力してスタートしましょう。</p>

        <form className="form-stack" onSubmit={handleSubmit}>
          <label className="field-block">
            <span className="field-label">ニックネーム</span>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="例: ken"
              required
            />
          </label>

          <label className="field-block">
            <span className="field-label">メールアドレス</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="例: ken@example.com"
              required
            />
          </label>

          <label className="field-block">
            <span className="field-label">パスワード</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="6文字以上を推奨"
              required
            />
          </label>

          {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

          <button type="submit" className="primary-button primary-button--full" disabled={loading}>
            {loading ? "登録中..." : "新規登録"}
          </button>
        </form>

        <p className="auth-switch">
          すでにアカウントをお持ちですか？ <Link to="/login">ログインへ</Link>
        </p>
      </section>
    </div>
  );
}

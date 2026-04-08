import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUserApi } from "../api/authApi";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setLoading(true);
      setErrorMessage("");
      const result = await loginUserApi({ email, password });
      login(result);
      navigate("/swipe", { replace: true });
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message || "ログインに失敗しました。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <section className="auth-hero surface-card auth-hero--login">
        <p className="eyebrow">GOKON MATCH</p>
        <h1 className="hero-title">みんなで出会うから、自然に距離が縮まる。</h1>
        <p className="section-description">
          代表者プロフィールとグループ情報を整えて、雰囲気の合う相手とマッチしよう。
        </p>
        <div className="auth-hero__chips">
          <span className="soft-chip">2対2 / 3対3 / 4対4</span>
          <span className="soft-chip">日程調整はチャットで</span>
          <span className="soft-chip">スマホで使いやすいUI</span>
        </div>
      </section>

      <section className="auth-card surface-card">
        <p className="eyebrow">LOGIN</p>
        <h2 className="section-title">ログイン</h2>
        <p className="section-description">登録済みのメールアドレスとパスワードを入力してください。</p>

        <form className="form-stack" onSubmit={handleSubmit}>
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
              placeholder="パスワードを入力"
              required
            />
          </label>

          {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

          <button type="submit" className="primary-button primary-button--full" disabled={loading}>
            {loading ? "ログイン中..." : "ログイン"}
          </button>
        </form>

        <p className="auth-switch">
          アカウントをお持ちでないですか？ <Link to="/signup">新規登録へ</Link>
        </p>
      </section>
    </div>
  );
}

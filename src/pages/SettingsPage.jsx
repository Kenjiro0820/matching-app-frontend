import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function SettingsPage() {
  const { loginUser, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/settings");
  }

  return (
    <div className="page-container">
      <div className="hero-card">
        <p className="hero-badge">SETTINGS</p>
        <h1 className="page-title">設定</h1>
      </div>

      {!isLoggedIn ? (
        <div className="card stack-gap">
          <p className="muted">ログインすると募集応募と管理ができます。</p>
          <Link className="primary-button" to="/login">ログイン</Link>
          <Link className="secondary-button" to="/signup">新規登録</Link>
        </div>
      ) : (
        <>
          <div className="card">
            <h2 className="section-title">アカウント</h2>
            <p>名前: {loginUser?.name}</p>
            <p>メール: {loginUser?.email}</p>
            <p>ID: {loginUser?.id}</p>
          </div>

          <div className="card stack-gap">
            <Link className="secondary-button" to="/my-posts">自分の募集</Link>
            <button className="danger-button" type="button" onClick={handleLogout}>ログアウト</button>
          </div>
        </>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { closePostApi, getMyPostsApi } from "../api/postApi";

function formatDateTime(value) {
  if (!value) return "未設定";
  return new Date(value).toLocaleString("ja-JP");
}

export default function MyPostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  async function loadPosts() {
    try {
      setLoading(true);
      setErrorMessage("");
      const data = await getMyPostsApi();
      setPosts(Array.isArray(data) ? data : []);
    } catch (error) {
      setErrorMessage(error.message || "自分の募集取得に失敗しました。");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPosts();
  }, []);

  async function handleClose(postId) {
    try {
      setInfoMessage("");
      setErrorMessage("");
      await closePostApi(postId);
      setInfoMessage("募集を終了しました。");
      await loadPosts();
    } catch (error) {
      setErrorMessage(error.message || "募集終了に失敗しました。");
    }
  }

  return (
    <div className="page-container">
      <div className="hero-card">
        <p className="hero-badge">MY POSTS</p>
        <h1 className="page-title">自分の募集</h1>
      </div>

      {infoMessage && <p className="success-text">{infoMessage}</p>}
      {errorMessage && <p className="error-text">{errorMessage}</p>}

      {loading ? (
        <div className="card">読み込み中...</div>
      ) : posts.length === 0 ? (
        <div className="card">まだ募集がありません。</div>
      ) : (
        posts.map((post) => (
          <div className="card" key={post.id}>
            <div className="card-header-row">
              <h2 className="section-title">{post.title}</h2>
              <span className="pill">{post.status}</span>
            </div>

            <div className="info-list">
              <div><span>エリア</span><strong>{post.area || "-"}</strong></div>
              <div><span>開催日時</span><strong>{formatDateTime(post.scheduledAt)}</strong></div>
            </div>

            <p className="card-description">{post.description || "説明なし"}</p>

            <div className="inline-actions">
              <Link className="secondary-button" to={`/posts/${post.id}/applications`}>
                応募一覧
              </Link>
              <button className="danger-button" type="button" onClick={() => handleClose(post.id)}>
                終了
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

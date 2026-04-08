import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPostApi } from "../api/postApi";

export default function CreatePostPage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [area, setArea] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setLoading(true);
      setErrorMessage("");
      await createPostApi({ title, description, area, scheduledAt });
      navigate("/my-posts");
    } catch (error) {
      setErrorMessage(error.message || "募集作成に失敗しました。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="discover-page">
      <section className="hero-card">
        <span className="hero-badge">HOST</span>
        <h1 className="hero-title">募集を作成する</h1>
        <p className="hero-description">
          日時やエリアを入力して、参加者を募集できます。
        </p>
      </section>

      <form className="card form-card" onSubmit={handleSubmit}>
        <div className="field-group">
          <label className="field-label">タイトル</label>
          <input
            className="text-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例：週末に渋谷で飲みませんか？"
            required
          />
        </div>

        <div className="field-group">
          <label className="field-label">説明</label>
          <textarea
            className="textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="お店の雰囲気や参加してほしい人などを書きましょう。"
            required
          />
        </div>

        <div className="field-group">
          <label className="field-label">エリア</label>
          <input
            className="text-input"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            placeholder="例：渋谷、新宿、池袋"
            required
          />
        </div>

        <div className="field-group">
          <label className="field-label">開催日時</label>
          <input
            className="text-input"
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            required
          />
        </div>

        {errorMessage && <p className="error-text">{errorMessage}</p>}

        <button className="primary-button full-button" type="submit" disabled={loading}>
          {loading ? "作成中..." : "募集を作成する"}
        </button>
      </form>
    </div>
  );
}
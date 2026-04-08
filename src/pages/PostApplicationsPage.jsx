import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  approveApplicationApi,
  getApplicationsByPostApi,
  rejectApplicationApi,
} from "../api/applicationApi";

function formatDateTime(value) {
  if (!value) return "未設定";
  return new Date(value).toLocaleString("ja-JP");
}

export default function PostApplicationsPage() {
  const { postId } = useParams();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  async function loadApplications() {
    try {
      setLoading(true);
      setErrorMessage("");

      const data = await getApplicationsByPostApi(postId);
      const nextApplications = Array.isArray(data) ? data : [];
      setApplications(nextApplications);
      return nextApplications;
    } catch (error) {
      setErrorMessage(error.message || "応募一覧の取得に失敗しました。");
      return [];
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadApplications();
  }, [postId]);

  async function handleApprove(id) {
    try {
      setErrorMessage("");
      setInfoMessage("");

      await approveApplicationApi(id);
      setInfoMessage("承認しました。");
      window.dispatchEvent(new Event("app:applications-decrement"));
      await loadApplications();
    } catch (error) {
      setErrorMessage(error.message || "承認に失敗しました。");
    }
  }

  async function handleReject(id) {
    try {
      setErrorMessage("");
      setInfoMessage("");

      await rejectApplicationApi(id);
      setInfoMessage("却下しました。");
      window.dispatchEvent(new Event("app:applications-decrement"));
      await loadApplications();
    } catch (error) {
      setErrorMessage(error.message || "却下に失敗しました。");
    }
  }
  return (
    <div>
      <div>APPLICATIONS</div>
      <h1>応募一覧</h1>
      <p>投稿ID: {postId}</p>
      <p>{loading ? "読み込み中..." : `${applications.length}件`}</p>

      {infoMessage && <p className="success-text">{infoMessage}</p>}
      {errorMessage && <p className="error-text">{errorMessage}</p>}

      {loading ? (
        <section className="card">読み込み中...</section>
      ) : applications.length === 0 ? (
        <section className="card">まだ応募がありません。</section>
      ) : (
        applications.map((app) => (
          <section key={app.id} className="card">
            <h2>応募ID: {app.id}</h2>
            <p>{app.status}</p>
            <p>応募者ID: {app.applicantUserId}</p>
            <p>応募日時: {formatDateTime(app.createdAt)}</p>
            <p>{app.message || "メッセージなし"}</p>

            {app.status === "PENDING" && (
              <div>
                <button type="button" onClick={() => handleApprove(app.id)}>
                  承認
                </button>
                <button type="button" onClick={() => handleReject(app.id)}>
                  却下
                </button>
              </div>
            )}
          </section>
        ))
      )}
    </div>
  );
}
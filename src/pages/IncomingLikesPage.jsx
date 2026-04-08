import { useEffect, useState } from "react";
import { approveApplicationApi, getReceivedApplicationsApi, rejectApplicationApi } from "../api/applicationApi";
import { useAuth } from "../context/AuthContext";
import StatusView from "../components/StatusView";
import PageIntro from "../components/PageIntro";

function formatDateTime(value) {
  if (!value) return "未設定";
  return new Date(value).toLocaleString("ja-JP");
}

export default function IncomingLikesPage() {
  const { loginUser } = useAuth();
  const userId = loginUser?.id;

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  async function loadApplications() {
    try {
      setLoading(true);
      setMessage("");
      const data = await getReceivedApplicationsApi();
      setApplications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setMessage(error.message || "応募一覧の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!userId) return;
    loadApplications();
  }, [userId]);

  async function handleApprove(id) {
    try {
      setMessage("");
      setInfoMessage("");
      await approveApplicationApi(id);
      window.dispatchEvent(new Event("app:applications-decrement"));
      setInfoMessage("応募を承認しました。");
      await loadApplications();
    } catch (error) {
      setMessage(error.message || "承認に失敗しました");
    }
  }

  async function handleReject(id) {
    try {
      setMessage("");
      setInfoMessage("");
      await rejectApplicationApi(id);
      window.dispatchEvent(new Event("app:applications-decrement"));
      setInfoMessage("応募を却下しました。");
      await loadApplications();
    } catch (error) {
      setMessage(error.message || "却下に失敗しました");
    }
  }

  if (!userId) {
    return (
      <div className="page-container">
        <StatusView
          eyebrow="APPLICATIONS"
          title="ログイン後に利用できます"
          description="ログイン後に応募一覧を確認できます。"
        />
      </div>
    );
  }

  return (
    <div className="page-container page-container--with-bottom-nav">

      {infoMessage && <p className="success-text">{infoMessage}</p>}

      {loading ? (
        <StatusView title="応募一覧を読み込み中です..." description="最新の応募情報を取得しています。" />
      ) : message ? (
        <StatusView title="一覧を表示できませんでした" description={message} />
      ) : applications.length === 0 ? (
        <StatusView
          title="まだ応募はありません"
        />
      ) : (
        <section className="applications-grid">
          {applications.map((app) => (
            <article key={app.id} className="application-card surface-card">
              <div className="application-card__header">
                <div>
                  <h3 className="application-card__title">応募ID #{app.id}</h3>
                  <p className="application-card__caption">募集ID #{app.postId} への応募</p>
                </div>
                <span className="status-badge">{app.status}</span>
              </div>

              <div className="application-card__meta">
                <p><span>応募者</span> {app.applicantUserId}</p>
                <p><span>応募日時</span> {formatDateTime(app.createdAt)}</p>
              </div>

              <div className="application-card__message">
                {app.message || "メッセージなし"}
              </div>

              {app.status === "PENDING" && (
                <div className="application-card__actions">
                  <button
                    className="primary-button"
                    type="button"
                    onClick={() => handleApprove(app.id)}
                  >
                    承認
                  </button>
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() => handleReject(app.id)}
                  >
                    却下
                  </button>
                </div>
              )}
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
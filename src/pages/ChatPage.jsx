import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  getMessagesApi,
  markMatchAsReadApi,
  sendMessageApi,
} from "../api/messageApi";
import { useAuth } from "../context/AuthContext";
import PageIntro from "../components/PageIntro";

function normalizeMessages(messages) {
  return [...messages].sort((a, b) => {
    const aTime = new Date(a.createdAt || a.sentAt || a.timestamp || 0).getTime();
    const bTime = new Date(b.createdAt || b.sentAt || b.timestamp || 0).getTime();
    return aTime - bTime;
  });
}

function formatBubbleTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ChatPage() {
  const { matchId } = useParams();
  const { loginUser } = useAuth();
  const userId = loginUser?.id;
  const [messages, setMessages] = useState([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const listRef = useRef(null);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      const data = await getMessagesApi(matchId);
      setMessages(Array.isArray(data) ? data : []);

      if (userId) {
        await markMatchAsReadApi(userId, matchId);
        window.dispatchEvent(new Event("app:badge-refresh"));
      }
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message || "メッセージ取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [matchId, userId]);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  const orderedMessages = useMemo(() => normalizeMessages(messages), [messages]);

  const handleSend = async () => {
    if (!body.trim() || !userId) return;

    try {
      setSending(true);
      await sendMessageApi(userId, matchId, { body: body.trim() });
      setBody("");
      await fetchMessages();
      window.dispatchEvent(new Event("app:badge-refresh"));
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message || "送信に失敗しました");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="page-container">
      <PageIntro
        eyebrow="CHAT"
        title="メッセージ"
        description="合コンの日程、人数、場所の調整に使ってください。"
        action={<Link to="/matches" className="ghost-button">一覧へ戻る</Link>}
      />

      <section className="chat-shell card">
        {loading ? (
          <div className="empty-state">読み込み中...</div>
        ) : errorMessage ? (
          <div className="empty-state empty-state--error">{errorMessage}</div>
        ) : orderedMessages.length === 0 ? (
          <div className="empty-state">
            まだメッセージはありません。最初のひとことを送ってみましょう。
          </div>
        ) : (
          <div className="chat-thread" ref={listRef}>
            {orderedMessages.map((message, index) => {
              const isMine = message.senderUserId === userId;
              const time = message.createdAt || message.sentAt || message.timestamp;

              return (
                <article
                  key={`${message.id || index}-${time || index}`}
                  className={isMine ? "chat-bubble chat-bubble--mine" : "chat-bubble"}
                >
                  <span className="chat-bubble__author">{isMine ? "自分" : "相手"}</span>
                  <p>{message.body}</p>
                  <time className="chat-bubble__time">{formatBubbleTime(time)}</time>
                </article>
              );
            })}
          </div>
        )}

        <div className="chat-compose">
          <label className="form-field chat-compose__field">
            <span className="form-field__label">メッセージを送る</span>
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="例: 来週の金曜か土曜でご都合いかがですか？"
              rows={3}
            />
          </label>
          <button
            type="button"
            className="primary-button chat-compose__button"
            onClick={handleSend}
            disabled={sending}
          >
            {sending ? "送信中..." : "送信"}
          </button>
        </div>
      </section>
    </div>
  );
}

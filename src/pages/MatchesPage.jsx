import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMatchesApi } from "../api/matchApi";
import { useAuth } from "../context/AuthContext";
import PageIntro from "../components/PageIntro";
import StatusView from "../components/StatusView";

function normalizeMatch(match) {
  const partnerName =
    match.partnerName ||
    match.partnerNickname ||
    match.otherUserNickname ||
    match.otherNickname ||
    match.nickname ||
    match.name ||
    "相手";

  const lastMessage =
    match.lastMessage || match.lastMessageBody || match.latestMessage || match.message || "";

  const lastMessageAt =
    match.lastMessageAt || match.latestMessageAt || match.updatedAt || match.matchedAt || null;

  const imageUrl =
    match.partnerImageUrl ||
    match.partnerProfileImageUrl ||
    match.otherUserProfileImageUrl ||
    match.profileImageUrl ||
    match.groupImageUrl ||
    null;

  const matchId = match.matchId || match.id;

  return {
    matchId,
    partnerName,
    lastMessage,
    lastMessageAt,
    imageUrl,
  };
}

function formatDateTime(value) {
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

export default function MatchesPage() {
  const { loginUser } = useAuth();
  const userId = loginUser?.id;
  const navigate = useNavigate();

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!userId) return;

    const fetchMatches = async () => {
      try {
        setLoading(true);
        setErrorMessage("");
        const data = await getMatchesApi(userId);
        setMatches(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
        setErrorMessage(error.message || "マッチ一覧の取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [userId]);

  const normalizedMatches = useMemo(() => matches.map(normalizeMatch), [matches]);

  if (!userId) {
    return (
      <div className="page-container">
        <StatusView eyebrow="MATCHES" title="ログイン後に確認できます" description="マッチした相手との会話が表示されます。" />
      </div>
    );
  }

  return (
    <div className="page-container page-container--with-bottom-nav">

      {loading ? (
        <StatusView title="マッチ一覧を読み込み中です..." />
      ) : errorMessage ? (
        <StatusView title="マッチ一覧を表示できませんでした" description={errorMessage} />
      ) : normalizedMatches.length === 0 ? (
        <StatusView title="まだマッチがありません"/>
      ) : (
        <section className="match-list">
          {normalizedMatches.map((match) => (
            <button
              key={match.matchId}
              type="button"
              className="match-row surface-card"
              onClick={() => navigate(`/chat/${match.matchId}`)}
            >
              <div className="match-row__avatar">
                {match.imageUrl ? (
                  <img src={match.imageUrl} alt={match.partnerName} />
                ) : (
                  <span>{match.partnerName.slice(0, 1) || "?"}</span>
                )}
              </div>

              <div className="match-row__body">
                <div className="match-row__top">
                  <h3>{match.partnerName}</h3>
                  <time>{formatDateTime(match.lastMessageAt)}</time>
                </div>
                <p>{match.lastMessage || "メッセージを始めましょう"}</p>
              </div>
            </button>
          ))}
        </section>
      )}
    </div>
  );
}

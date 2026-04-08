import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getPostsApi } from "../api/postApi";
import { applyToPostApi, getMyActiveAppliedPostIdsApi } from "../api/applicationApi";
import { getSwipeCandidatesApi } from "../api/swipeApi";
import { useAuth } from "../context/AuthContext";

function formatDateTime(value) {
  if (!value) return "日時未設定";
  return new Date(value).toLocaleString("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function splitTags(value) {
  if (!value) return [];
  return value
    .split(/[、,\s]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildFallbackCandidate(post) {
  return {
    targetUserId: post.organizerUserId,
    targetGroupProfileId: `post-${post.id}`,
    nickname: post.organizerNickname || `主催者 ${post.organizerUserId}`,
    ageRange: "",
    occupation: "",
    preferredArea: post.area || "",
    bio: post.description || "",
    groupTitle: post.title || "",
    introduction: post.description || "",
    area: post.area || "",
    meetingStyle: "",
    availableDays: "",
    preferredGroupDescription: "",
    personalityTags: "",
    profileImageUrl: "",
    groupImageUrl: "",
    maleCount: null,
    femaleCount: null,
    ageMin: null,
    ageMax: null,
    budgetPerPerson: null,
  };
}

export default function DiscoverPage() {
  const navigate = useNavigate();
  const { isLoggedIn, loginUser } = useAuth();
  const [posts, setPosts] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [appliedPostIds, setAppliedPostIds] = useState([]);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [message, setMessage] = useState("参加したいです。よろしくお願いします。");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [applyingPostId, setApplyingPostId] = useState(null);

  async function loadData() {
    try {
      setLoading(true);
      setErrorMessage("");

      const [postData, candidateData, appliedIdsData] = await Promise.all([
        getPostsApi(),
        loginUser?.id ? getSwipeCandidatesApi(loginUser.id) : Promise.resolve([]),
        loginUser?.id ? getMyActiveAppliedPostIdsApi() : Promise.resolve([]),
      ]);

      setPosts(Array.isArray(postData) ? postData : []);
      setCandidates(Array.isArray(candidateData) ? candidateData : []);
      setAppliedPostIds(Array.isArray(appliedIdsData) ? appliedIdsData : []);
    } catch (error) {
      setErrorMessage(error.message || "募集一覧の取得に失敗しました。");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [loginUser?.id]);

  const candidateMap = useMemo(() => {
    return new Map(candidates.map((candidate) => [candidate.targetUserId, candidate]));
  }, [candidates]);

  const appliedPostIdSet = useMemo(() => new Set(appliedPostIds), [appliedPostIds]);

  const visiblePosts = useMemo(() => {
    return posts
      .filter((post) => post.status === "OPEN")
      .filter((post) => post.organizerUserId !== loginUser?.id)
      .filter((post) => !appliedPostIdSet.has(post.id))
      .map((post) => {
        const matchedCandidate = candidateMap.get(post.organizerUserId);
        const profile = matchedCandidate || buildFallbackCandidate(post);

        return {
          ...post,
          profile,
          tags: splitTags(profile.personalityTags).slice(0, 2),
        };
      });
  }, [posts, loginUser, candidateMap, appliedPostIdSet]);

  async function handleApply(postId) {
    try {
      setApplyingPostId(postId);
      setErrorMessage("");
      setInfoMessage("");

      await applyToPostApi(postId, message);
      setInfoMessage("応募を送信しました。");
      setSelectedPostId(null);
      setMessage("参加したいです。よろしくお願いします。");
      await loadData();
    } catch (error) {
      setErrorMessage(error.message || "応募に失敗しました。");
    } finally {
      setApplyingPostId(null);
    }
  }

  function handleOpenProfile(post) {
    navigate(`/candidates/${post.profile.targetUserId}`, {
      state: { candidate: post.profile },
    });
  }

  if (!isLoggedIn) {
    return (
      <>
        <div>GROUP MATCH</div>
        <h1>みんなで、自然に出会える。</h1>
        <p>気になる合コン募集を探して、安心して参加してみましょう。</p>

        <h2>まずはログイン</h2>
        <p>募集の閲覧や応募にはログインが必要です。</p>

        <Link to="/login">ログイン</Link>
        <Link to="/signup">新規登録</Link>
      </>
    );
  }

  return (
    <div>

      {infoMessage && <p className="success-text">{infoMessage}</p>}
      {errorMessage && <p className="error-text">{errorMessage}</p>}

      {loading ? (
        <section className="card">読み込み中です...</section>
      ) : visiblePosts.length === 0 ? (

        <section className="card">
          <h3 className="section-title">まだ募集がありません</h3>
        </section>

      ) : (
        <section className="discover-card-grid">
          {visiblePosts.map((post) => {
            const displayName =
              post.profile.nickname || post.organizerNickname || `主催者 ${post.organizerUserId}`;

            return (
              <article
                key={post.id}
                className="discover-post-card surface-card"
                role="button"
                tabIndex={0}
                onClick={() => handleOpenProfile(post)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handleOpenProfile(post);
                  }
                }}
              >
                <div className="discover-post-card__top">
                  <div className="discover-post-card__avatar">{displayName.slice(0, 1)}</div>
                  <div className="discover-post-card__host">
                    <p className="discover-post-card__name">{displayName}</p>
                    <p className="discover-post-card__group">
                      {post.profile.groupTitle || "プロフィールを見る"}
                    </p>
                  </div>
                </div>

                <div className="discover-post-card__status-row">
                  <span className="status-badge">募集中</span>
                  <span className="discover-post-card__time">
                    {formatDateTime(post.scheduledAt)}
                  </span>
                </div>

                <h2 className="discover-post-card__title">{post.title}</h2>
                <p className="discover-post-card__meta">{post.area || "エリア未設定"}</p>
                <p className="discover-post-card__description">
                  {post.description || "説明はまだ登録されていません。"}
                </p>

                <div className="discover-post-card__chips">
                  {post.tags.length > 0 ? (
                    post.tags.map((tag) => (
                      <span key={tag} className="soft-chip soft-chip--small">
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="discover-post-card__hint">
                      タップでプロフィール
                    </span>
                  )}
                </div>

                <div className="discover-post-card__footer">
                  <button
                    type="button"
                    className="primary-button discover-post-card__apply-button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelectedPostId(post.id);
                      setInfoMessage("");
                      setErrorMessage("");
                    }}
                    disabled={applyingPostId === post.id}
                  >
                    いいね！
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      )}
      {selectedPostId && (
        <section className="card">
          <h2>応募メッセージ</h2>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="参加したい気持ちや、簡単な自己紹介を書いてみましょう。"
          />

          <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
            <button
              type="button"
              className="secondary-button"
              onClick={() => {
                setSelectedPostId(null);
                setMessage("参加したいです。よろしくお願いします。");
              }}
            >
              キャンセル
            </button>

            <button
              type="button"
              className="primary-button"
              onClick={() => handleApply(selectedPostId)}
              disabled={applyingPostId === selectedPostId}
            >
              {applyingPostId === selectedPostId ? "送信中..." : "この内容で送信"}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
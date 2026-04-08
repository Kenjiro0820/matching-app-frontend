import { useMemo, useState } from "react";
import { Link, Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { sendSwipeApi } from "../api/swipeApi";
import { useAuth } from "../context/AuthContext";
import ImageCarousel, { buildGalleryImages } from "../components/ImageCarousel";
import StatusView from "../components/StatusView";

function splitTags(value) {
  if (!value) return [];

  return value
    .split(/[、,\s]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildQuestionCards(candidate) {
  return [
    { title: "合コンの雰囲気", answer: candidate.meetingStyle || "まだ未設定です" },
    { title: "会いやすい日", answer: candidate.availableDays || "まだ未設定です" },
    {
      title: "希望する相手像",
      answer: candidate.preferredGroupDescription || "まだ未設定です",
    },
  ];
}

export default function CandidateProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { targetUserId } = useParams();
  const { loginUser } = useAuth();
  const userId = loginUser?.id;
  const candidate = location.state?.candidate;
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState("");

  const tags = useMemo(() => splitTags(candidate?.personalityTags), [candidate?.personalityTags]);
  const questionCards = useMemo(() => buildQuestionCards(candidate || {}), [candidate]);
  const galleryImages = useMemo(
    () => buildGalleryImages(candidate?.profileImageUrl, candidate?.groupImageUrl),
    [candidate?.profileImageUrl, candidate?.groupImageUrl]
  );

  if (!userId) {
    return <Navigate to="/login" replace />;
  }

  if (!candidate) {
    return (
      <div className="page-container page-container--with-bottom-nav">
        <StatusView
          eyebrow="PROFILE"
          title="プロフィールを表示できません"
          description="一覧画面からもう一度プロフィールを開いてください。"
          action={<Link to="/swipe" className="secondary-button">さがす画面へ戻る</Link>}
        />
      </div>
    );
  }

  const handleSwipe = async (action) => {
    if (sending) return;

    try {
      setSending(true);
      setFeedback("");

      const result = await sendSwipeApi(userId, {
        targetUserId: candidate.targetUserId,
        targetGroupProfileId: candidate.targetGroupProfileId,
        action,
      });

      const message = typeof result === "string" ? result : result?.message || "処理が完了しました";

      if (result?.matched) {
        setFeedback(message || "マッチ成立！メッセージ一覧から日程調整を始められます。");
        setTimeout(() => navigate("/matches"), 900);
        return;
      }

      setFeedback(action === "LIKE" ? message || "いいかもを送りました。" : message || "今回は見送りました。");
      setTimeout(() => navigate("/swipe"), 900);
    } catch (error) {
      console.error(error);
      setFeedback(error.message || "アクションの送信に失敗しました。");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="page-container page-container--with-bottom-nav profile-page">
      <button type="button" className="text-link-button" onClick={() => navigate("/swipe")}>
        ← さがすに戻る
      </button>

      <section className="profile-hero surface-card">
        <div className="profile-hero__gallery">
          <ImageCarousel images={galleryImages} alt={candidate.nickname || "候補の画像"} aspect="portrait" />
        </div>

        <div className="profile-hero__summary">
          <div className="eyebrow-row">
            <span className="eyebrow">PROFILE</span>
            <span className="pill pill--soft">user #{targetUserId}</span>
          </div>
          <h1 className="hero-title hero-title--profile">{candidate.nickname}</h1>
          <p className="section-description profile-lead">
            {candidate.ageRange || "年齢未設定"} ・ {candidate.occupation || "職業未設定"}
          </p>
          <p className="section-description">希望エリア: {candidate.preferredArea || candidate.area || "未設定"}</p>
          <p className="profile-bio">{candidate.bio || "自己紹介はまだ設定されていません。"}</p>

          <div className="chip-row chip-row--spacious">
            {tags.length > 0 ? (
              tags.map((tag) => (
                <span key={tag} className="soft-chip">
                  {tag}
                </span>
              ))
            ) : (
              <span className="soft-chip soft-chip--muted">価値観タグ未設定</span>
            )}
          </div>
        </div>
      </section>

      <section className="detail-grid">
        <article className="surface-card detail-panel">
          <p className="eyebrow">GROUP INFO</p>
          <h2 className="section-title">グループ情報</h2>
          <dl className="info-list">
            <div className="info-list__row">
              <dt>グループ名</dt>
              <dd>{candidate.groupTitle || "未設定"}</dd>
            </div>
            <div className="info-list__row">
              <dt>開催エリア</dt>
              <dd>{candidate.area || "未設定"}</dd>
            </div>
            <div className="info-list__row">
              <dt>人数構成</dt>
              <dd>男性 {candidate.maleCount ?? 0} / 女性 {candidate.femaleCount ?? 0}</dd>
            </div>
            <div className="info-list__row">
              <dt>年齢帯</dt>
              <dd>
                {candidate.ageMin ?? "-"} 〜 {candidate.ageMax ?? "-"}
              </dd>
            </div>
            <div className="info-list__row">
              <dt>予算</dt>
              <dd>{candidate.budgetPerPerson ? `${candidate.budgetPerPerson}円 / 人` : "未設定"}</dd>
            </div>
            <div className="info-list__row info-list__row--multiline">
              <dt>グループ紹介</dt>
              <dd>{candidate.introduction || "未設定"}</dd>
            </div>
          </dl>
        </article>

      </section>

      {feedback ? <p className="feedback-banner">{feedback}</p> : null}

    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSwipeCandidatesApi } from "../api/swipeApi";
import { useAuth } from "../context/AuthContext";
import ImageCarousel, { buildGalleryImages } from "../components/ImageCarousel";
import PageIntro from "../components/PageIntro";
import StatusView from "../components/StatusView";

function splitTags(value) {
  if (!value) return [];

  return value
    .split(/[、,\s]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildSearchText(candidate) {
  return [
    candidate.nickname,
    candidate.ageRange,
    candidate.occupation,
    candidate.preferredArea,
    candidate.bio,
    candidate.groupTitle,
    candidate.introduction,
    candidate.area,
    candidate.meetingStyle,
    candidate.availableDays,
    candidate.preferredGroupDescription,
    candidate.personalityTags,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export default function SwipePage() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();
  const userId = loginUser?.id;

  const [candidates, setCandidates] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!userId) return;

    const fetchCandidates = async () => {
      try {
        setLoading(true);
        setMessage("");
        const data = await getSwipeCandidatesApi(userId);
        setCandidates(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
        setMessage(error.message || "候補の取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, [userId]);

  const areaOptions = useMemo(
    () => [...new Set(candidates.map((candidate) => candidate.area).filter(Boolean))],
    [candidates]
  );

  const filteredCandidates = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return candidates.filter((candidate) => {
      const matchesKeyword =
        !normalizedKeyword || buildSearchText(candidate).includes(normalizedKeyword);
      const matchesArea = !selectedArea || candidate.area === selectedArea;
      return matchesKeyword && matchesArea;
    });
  }, [candidates, keyword, selectedArea]);

  if (!userId) {
    return (
      <div className="page-container">
        <StatusView eyebrow="SWIPE" title="ログイン後に利用できます" description="ログイン後に相手を探せます。" />
      </div>
    );
  }

  return (
    <div className="page-container page-container--with-bottom-nav">
      <PageIntro
        eyebrow="DISCOVER"
        title="合コン相手をさがす"
        description="気になる相手を見つけたらカードを開いて雰囲気や希望条件を確認し、いいかもを送れます。"
        aside={
          <div className="intro-stat">
            <strong>{filteredCandidates.length}</strong>
            <span>表示中</span>
          </div>
        }
      />

      <section className="surface-card filter-card">
        <div className="filter-grid">
          <label className="field-block field-block--compact">
            <span className="field-label">キーワード</span>
            <input
              type="text"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="名前・職業・エリア・雰囲気で検索"
            />
          </label>

          <label className="field-block field-block--compact">
            <span className="field-label">エリア</span>
            <select value={selectedArea} onChange={(event) => setSelectedArea(event.target.value)}>
              <option value="">すべてのエリア</option>
              {areaOptions.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {loading ? (
        <StatusView title="候補を読み込み中です..." description="プロフィールとグループ情報を確認しています。" />
      ) : message ? (
        <StatusView title="候補を表示できませんでした" description={message} />
      ) : filteredCandidates.length === 0 ? (
        <StatusView title="該当する相手がいません" description="検索条件を変えてもう一度お試しください。" />
      ) : (
        <section className="candidate-grid">
          {filteredCandidates.map((candidate) => {
            const tags = splitTags(candidate.personalityTags).slice(0, 3);
            const images = buildGalleryImages(candidate.profileImageUrl, candidate.groupImageUrl);

            return (
              <article
                key={`${candidate.targetUserId}-${candidate.targetGroupProfileId}`}
                className="candidate-card surface-card"
                onClick={() => navigate(`/candidates/${candidate.targetUserId}`, { state: { candidate } })}
              >
                <ImageCarousel
                  images={images}
                  alt={candidate.nickname || "候補プロフィール画像"}
                  compact
                  aspect="square"
                />

                <div className="candidate-card__content">
                  <div className="candidate-card__heading">
                    <h3 className="candidate-card__name">{candidate.nickname || "未設定"}</h3>
                    <span className="candidate-card__age">{candidate.ageRange || "年齢未設定"}</span>
                  </div>

                  <p className="candidate-card__meta">
                    {candidate.occupation || "職業未設定"} ・ {candidate.preferredArea || candidate.area || "エリア未設定"}
                  </p>
                  <p className="candidate-card__group">{candidate.groupTitle || "グループ名未設定"}</p>
                  <p className="candidate-card__sub">
                    {candidate.area || "開催エリア未設定"} / {candidate.femaleCount ?? 0}人 + {candidate.maleCount ?? 0}人
                  </p>

                  <div className="chip-row">
                    {tags.length > 0 ? (
                      tags.map((tag) => (
                        <span key={tag} className="soft-chip soft-chip--small">
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="soft-chip soft-chip--small soft-chip--muted">タグ未設定</span>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}

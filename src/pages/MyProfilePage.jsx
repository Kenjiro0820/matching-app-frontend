import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getMyGroupProfileApi } from "../api/groupProfileApi";
import { getMyProfileApi } from "../api/profileApi";
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

export default function MyProfilePage() {
  const { loginUser } = useAuth();
  const userId = loginUser?.id;

  const [profile, setProfile] = useState(null);
  const [groupProfile, setGroupProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const [profileData, groupData] = await Promise.allSettled([
          getMyProfileApi(userId),
          getMyGroupProfileApi(userId),
        ]);

        if (profileData.status === "fulfilled") {
          setProfile(profileData.value || null);
        }
        if (groupData.status === "fulfilled") {
          setGroupProfile(groupData.value || null);
        }

        if (profileData.status === "rejected" && groupData.status === "rejected") {
          throw new Error("プロフィール情報の取得に失敗しました");
        }
      } catch (error) {
        console.error(error);
        setErrorMessage(error.message || "プロフィール情報の取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const tags = useMemo(() => splitTags(profile?.personalityTags).slice(0, 5), [profile?.personalityTags]);
  const galleryImages = useMemo(
    () => buildGalleryImages(profile?.profileImageUrl, groupProfile?.groupImageUrl),
    [profile?.profileImageUrl, groupProfile?.groupImageUrl]
  );

  if (!userId) {
    return (
      <div className="page-container">
        <StatusView eyebrow="MY PROFILE" title="ログイン後にご利用いただけます" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page-container page-container--with-bottom-nav">
        <StatusView eyebrow="MY PROFILE" title="プロフィールを読み込み中です..." />
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="page-container page-container--with-bottom-nav">
        <StatusView eyebrow="MY PROFILE" title="プロフィールを表示できませんでした" description={errorMessage} />
      </div>
    );
  }

  return (
    <div className="page-container page-container--with-bottom-nav">
      <section className="surface-card my-profile-hero">

        <ImageCarousel images={galleryImages} alt={profile?.nickname || "プロフィール画像"} aspect="portrait" />

        <div className="my-profile-hero__content">
          <h2 className="section-title">{profile?.nickname || loginUser?.name || "ゲストユーザー"}</h2>
          <p className="section-description">
            {profile?.ageRange || "年齢未設定"} ・ {profile?.occupation || "職業未設定"}
          </p>
          <p className="profile-bio">{profile?.bio || "自己紹介はまだ設定されていません。"}</p>

          <div className="chip-row">
            {tags.length > 0 ? (
              tags.map((tag) => <span key={tag} className="soft-chip">{tag}</span>)
            ) : (
              <span className="soft-chip soft-chip--muted">タグ未設定</span>
            )}
          </div>
        </div>
      </section>
      <section>
        <article className="surface-card summary-card">
          <p className="eyebrow">GROUP</p>
          <h3>{groupProfile?.title || "グループプロフィール"}</h3>
          <p>{groupProfile?.area || "開催エリア未設定"}</p>
          <p>
            男性 {groupProfile?.maleCount ?? 0} / 女性 {groupProfile?.femaleCount ?? 0}
          </p>
          <div className="inline-actions">
            <Link to="/edit-group-profile" className="secondary-button secondary-button--small">
              編集する
            </Link>
            <Link to="/create-post" className="primary-button primary-button--small">
              投稿する
            </Link>
          </div>

          <div style={{ marginTop: "12px" }}>
            <Link to="/my-posts" className="secondary-button secondary-button--small">
              自分の募集を見る
            </Link>
          </div>
        </article>
      </section>
    </div>
  );
}

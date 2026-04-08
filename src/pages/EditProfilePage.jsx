import { useEffect, useState } from "react";
import { getMyProfileApi, saveMyProfileApi } from "../api/profileApi";
import { useAuth } from "../context/AuthContext";
import PageIntro from "../components/PageIntro";
import StatusView from "../components/StatusView";

const initialForm = {
  nickname: "",
  profileImageUrl: "",
  bio: "",
  ageRange: "",
  occupation: "",
  drinkingLevel: "",
  personalityTags: "",
  preferredArea: "",
  isActive: true,
};

export default function EditProfilePage() {
  const { loginUser } = useAuth();
  const userId = loginUser?.id;

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!userId) return;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await getMyProfileApi(userId);
        setForm({
          ...initialForm,
          ...data,
          nickname: data?.nickname ?? "",
          profileImageUrl: data?.profileImageUrl ?? "",
          bio: data?.bio ?? "",
          ageRange: data?.ageRange ?? "",
          occupation: data?.occupation ?? "",
          drinkingLevel: data?.drinkingLevel ?? "",
          personalityTags: data?.personalityTags ?? "",
          preferredArea: data?.preferredArea ?? "",
          isActive: data?.isActive ?? true,
        });
      } catch (error) {
        console.error(error);
        setToast(error.message || "読み込みに失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setToast("");
      await saveMyProfileApi(userId, form);
      setToast("保存しました");
    } catch (error) {
      console.error(error);
      setToast(error.message || "保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container page-container--with-bottom-nav">
        <StatusView eyebrow="REPRESENTATIVE" title="代表者プロフィールを読み込み中です..." />
      </div>
    );
  }

  return (
    <div className="page-container page-container--with-bottom-nav">
      <PageIntro
        eyebrow="REPRESENTATIVE"
        title="代表者プロフィール編集"
        description="第一印象につながる代表者プロフィールを整えましょう。"
      />

      <section className="surface-card form-card">
        <form className="form-grid" onSubmit={handleSubmit}>
          <label className="toggle-row form-grid__full">
            <span>
              <strong>公開設定</strong>
              <small>{form.isActive ? "公開中" : "非公開"}</small>
            </span>
            <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} />
          </label>

          <label className="field-block">
            <span className="field-label">ニックネーム</span>
            <input type="text" name="nickname" value={form.nickname} onChange={handleChange} />
          </label>

          <label className="field-block">
            <span className="field-label">年齢帯</span>
            <input type="text" name="ageRange" value={form.ageRange} onChange={handleChange} placeholder="例: 25-29" />
          </label>

          <label className="field-block">
            <span className="field-label">職業</span>
            <input type="text" name="occupation" value={form.occupation} onChange={handleChange} />
          </label>

          <label className="field-block">
            <span className="field-label">お酒の頻度</span>
            <input type="text" name="drinkingLevel" value={form.drinkingLevel} onChange={handleChange} placeholder="例: 週1 / たまに" />
          </label>

          <label className="field-block form-grid__full">
            <span className="field-label">プロフィール画像URL</span>
            <input type="url" name="profileImageUrl" value={form.profileImageUrl} onChange={handleChange} />
          </label>

          <label className="field-block form-grid__full">
            <span className="field-label">性格タグ</span>
            <input type="text" name="personalityTags" value={form.personalityTags} onChange={handleChange} placeholder="例: 明るい,落ち着き,話しやすい" />
          </label>

          <label className="field-block form-grid__full">
            <span className="field-label">希望エリア</span>
            <input type="text" name="preferredArea" value={form.preferredArea} onChange={handleChange} placeholder="例: 恵比寿,銀座" />
          </label>

          <label className="field-block form-grid__full">
            <span className="field-label">自己紹介</span>
            <textarea name="bio" value={form.bio} onChange={handleChange} rows={6} />
          </label>

          {toast ? <p className="form-note form-grid__full">{toast}</p> : null}

          <div className="form-actions form-grid__full">
            <button type="submit" className="primary-button" disabled={saving}>
              {saving ? "保存中..." : "保存"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

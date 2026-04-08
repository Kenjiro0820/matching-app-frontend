import { useEffect, useState } from "react";
import { getMyGroupProfileApi, saveMyGroupProfileApi } from "../api/groupProfileApi";
import { useAuth } from "../context/AuthContext";
import PageIntro from "../components/PageIntro";
import StatusView from "../components/StatusView";

const initialForm = {
  title: "",
  groupImageUrl: "",
  introduction: "",
  area: "",
  preferredArea: "",
  maleCount: 0,
  femaleCount: 0,
  ageMin: "",
  ageMax: "",
  preferredAgeMin: "",
  preferredAgeMax: "",
  budgetPerPerson: "",
  meetingStyle: "",
  availableDays: "",
  preferredGroupDescription: "",
  status: "ACTIVE",
};

export default function EditGroupProfilePage() {
  const { loginUser } = useAuth();
  const userId = loginUser?.id;

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!userId) return;

    const fetchGroupProfile = async () => {
      try {
        setLoading(true);
        const data = await getMyGroupProfileApi(userId);
        setForm({
          ...initialForm,
          ...data,
          title: data?.title ?? "",
          groupImageUrl: data?.groupImageUrl ?? "",
          introduction: data?.introduction ?? "",
          area: data?.area ?? "",
          preferredArea: data?.preferredArea ?? "",
          maleCount: data?.maleCount ?? 0,
          femaleCount: data?.femaleCount ?? 0,
          ageMin: data?.ageMin ?? "",
          ageMax: data?.ageMax ?? "",
          preferredAgeMin: data?.preferredAgeMin ?? "",
          preferredAgeMax: data?.preferredAgeMax ?? "",
          budgetPerPerson: data?.budgetPerPerson ?? "",
          meetingStyle: data?.meetingStyle ?? "",
          availableDays: data?.availableDays ?? "",
          preferredGroupDescription: data?.preferredGroupDescription ?? "",
          status: data?.status ?? "ACTIVE",
        });
      } catch (error) {
        console.error(error);
        setToast(error.message || "読み込みに失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchGroupProfile();
  }, [userId]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setToast("");
      await saveMyGroupProfileApi(userId, {
        ...form,
        maleCount: Number(form.maleCount),
        femaleCount: Number(form.femaleCount),
        ageMin: form.ageMin === "" ? null : Number(form.ageMin),
        ageMax: form.ageMax === "" ? null : Number(form.ageMax),
        preferredAgeMin: form.preferredAgeMin === "" ? null : Number(form.preferredAgeMin),
        preferredAgeMax: form.preferredAgeMax === "" ? null : Number(form.preferredAgeMax),
        budgetPerPerson: form.budgetPerPerson === "" ? null : Number(form.budgetPerPerson),
      });
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
        <StatusView eyebrow="GROUP" title="グループプロフィールを読み込み中です..." />
      </div>
    );
  }

  return (
    <div className="page-container page-container--with-bottom-nav">
      <PageIntro
        eyebrow="GROUP"
        title="グループプロフィール編集"
        description="人数構成や希望条件を整えて、マッチしやすい募集情報にしましょう。"
      />

      <section className="surface-card form-card">
        <form className="form-grid" onSubmit={handleSubmit}>
          <label className="field-block form-grid__full">
            <span className="field-label">タイトル</span>
            <input type="text" name="title" value={form.title} onChange={handleChange} />
          </label>

          <label className="field-block form-grid__full">
            <span className="field-label">グループ画像URL</span>
            <input type="url" name="groupImageUrl" value={form.groupImageUrl} onChange={handleChange} />
          </label>

          <label className="field-block form-grid__full">
            <span className="field-label">紹介文</span>
            <textarea name="introduction" value={form.introduction} onChange={handleChange} rows={5} />
          </label>

          <label className="field-block">
            <span className="field-label">開催エリア</span>
            <input type="text" name="area" value={form.area} onChange={handleChange} placeholder="例: 渋谷" />
          </label>

          <label className="field-block">
            <span className="field-label">希望エリア</span>
            <input type="text" name="preferredArea" value={form.preferredArea} onChange={handleChange} placeholder="例: 恵比寿,銀座" />
          </label>

          <label className="field-block">
            <span className="field-label">男性人数</span>
            <input type="number" name="maleCount" value={form.maleCount} onChange={handleChange} />
          </label>

          <label className="field-block">
            <span className="field-label">女性人数</span>
            <input type="number" name="femaleCount" value={form.femaleCount} onChange={handleChange} />
          </label>

          <label className="field-block">
            <span className="field-label">年齢下限</span>
            <input type="number" name="ageMin" value={form.ageMin} onChange={handleChange} />
          </label>

          <label className="field-block">
            <span className="field-label">年齢上限</span>
            <input type="number" name="ageMax" value={form.ageMax} onChange={handleChange} />
          </label>

          <label className="field-block">
            <span className="field-label">希望年齢下限</span>
            <input type="number" name="preferredAgeMin" value={form.preferredAgeMin} onChange={handleChange} />
          </label>

          <label className="field-block">
            <span className="field-label">希望年齢上限</span>
            <input type="number" name="preferredAgeMax" value={form.preferredAgeMax} onChange={handleChange} />
          </label>

          <label className="field-block">
            <span className="field-label">予算 / 人</span>
            <input type="number" name="budgetPerPerson" value={form.budgetPerPerson} onChange={handleChange} placeholder="例: 5000" />
          </label>

          <label className="field-block">
            <span className="field-label">雰囲気</span>
            <input type="text" name="meetingStyle" value={form.meetingStyle} onChange={handleChange} placeholder="例: にぎやか" />
          </label>

          <label className="field-block form-grid__full">
            <span className="field-label">空いている日</span>
            <input type="text" name="availableDays" value={form.availableDays} onChange={handleChange} placeholder="例: 金曜夜,土曜夜" />
          </label>

          <label className="field-block form-grid__full">
            <span className="field-label">希望する相手</span>
            <textarea name="preferredGroupDescription" value={form.preferredGroupDescription} onChange={handleChange} rows={5} />
          </label>

          <label className="field-block">
            <span className="field-label">ステータス</span>
            <select name="status" value={form.status} onChange={handleChange}>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
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

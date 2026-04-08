const BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function handleResponse(response, defaultMessage) {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || defaultMessage);
  }
  if (response.status === 204) return null;
  return response.json();
}

function getLoginUser() {
  const raw = localStorage.getItem("loginUser");
  return raw ? JSON.parse(raw) : null;
}

export async function getPostsApi() {
  const response = await fetch(`${BASE_URL}/posts`);
  return handleResponse(response, "募集一覧の取得に失敗しました。");
}

export async function createPostApi(payload) {
  const loginUser = getLoginUser();
  if (!loginUser?.id) throw new Error("ログインしてください。");

  const response = await fetch(`${BASE_URL}/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...payload,
      organizerUserId: loginUser.id,
    }),
  });
  return handleResponse(response, "募集作成に失敗しました。");
}

export async function getMyPostsApi() {
  const loginUser = getLoginUser();
  if (!loginUser?.id) throw new Error("ログインしてください。");

  const response = await fetch(`${BASE_URL}/posts/my?userId=${loginUser.id}`);
  return handleResponse(response, "自分の募集取得に失敗しました。");
}

export async function closePostApi(postId) {
  const response = await fetch(`${BASE_URL}/posts/${postId}/close`, {
    method: "POST",
  });
  return handleResponse(response, "募集終了に失敗しました。");
}

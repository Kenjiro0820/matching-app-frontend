const BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function handleResponse(response, defaultMessage) {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || defaultMessage);
  }

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function getLoginUser() {
  const raw = localStorage.getItem("loginUser");
  return raw ? JSON.parse(raw) : null;
}

export async function applyToPostApi(postId, message) {
  const loginUser = getLoginUser();
  if (!loginUser?.id) throw new Error("ログインしてください。");

  const response = await fetch(`${BASE_URL}/applications`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      postId,
      applicantUserId: loginUser.id,
      message,
    }),
  });

  return handleResponse(response, "応募に失敗しました。");
}

export async function getApplicationsByPostApi(postId) {
  const response = await fetch(`${BASE_URL}/applications/post/${postId}`);
  return handleResponse(response, "応募一覧の取得に失敗しました。");
}

export async function approveApplicationApi(applicationId) {
  const response = await fetch(`${BASE_URL}/applications/${applicationId}/approve`, {
    method: "POST",
  });
  return handleResponse(response, "承認に失敗しました。");
}

export async function rejectApplicationApi(applicationId) {
  const response = await fetch(`${BASE_URL}/applications/${applicationId}/reject`, {
    method: "POST",
  });
  return handleResponse(response, "却下に失敗しました。");
}

export async function getReceivedApplicationsApi() {
  const loginUser = getLoginUser();
  if (!loginUser?.id) throw new Error("ログインしてください。");

  const response = await fetch(`${BASE_URL}/applications/received?userId=${loginUser.id}`);
  return handleResponse(response, "応募一覧の取得に失敗しました。");
}

export async function getMyActiveAppliedPostIdsApi() {
  const loginUser = getLoginUser();
  if (!loginUser?.id) throw new Error("ログインしてください。");

  const response = await fetch(`${BASE_URL}/applications/my-active-post-ids?userId=${loginUser.id}`);
  return handleResponse(response, "応募済み募集の取得に失敗しました。");
}
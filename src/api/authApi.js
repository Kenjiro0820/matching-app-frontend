const BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function handleResponse(response, defaultMessage) {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || defaultMessage);
  }

  return response.json();
}

export async function signupUserApi(payload) {
  const response = await fetch(`${BASE_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return handleResponse(response, "新規登録に失敗しました。");
}

export async function loginUserApi(payload) {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return handleResponse(response, "ログインに失敗しました。");
}

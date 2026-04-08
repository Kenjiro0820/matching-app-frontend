import { apiClient } from "./client";

export async function getMyProfileApi(userId) {
  const response = await apiClient.get(`/me/profile?userId=${userId}`);
  return response.data;
}

export async function saveMyProfileApi(userId, payload) {
  const response = await apiClient.put(`/me/profile?userId=${userId}`, payload);
  return response.data;
}

import { apiClient } from "./client";

export async function getMyGroupProfileApi(userId) {
  const response = await apiClient.get(`/me/group-profile?userId=${userId}`);
  return response.data;
}

export async function saveMyGroupProfileApi(userId, payload) {
  const response = await apiClient.put(`/me/group-profile?userId=${userId}`, payload);
  return response.data;
}

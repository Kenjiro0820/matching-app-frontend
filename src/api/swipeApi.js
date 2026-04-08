import { apiClient } from "./client";

export async function getSwipeCandidatesApi(userId) {
  const response = await apiClient.get(`/swipe/candidates?userId=${userId}`);
  return response.data;
}

export async function getIncomingLikesApi(userId) {
  const response = await apiClient.get(`/swipe/incoming-likes?userId=${userId}`);
  return response.data;
}

export async function sendSwipeApi(userId, payload) {
  const response = await apiClient.post(`/swipe?userId=${userId}`, payload);
  return response.data;
}

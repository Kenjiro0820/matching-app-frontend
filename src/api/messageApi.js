import { apiClient } from "./client";

export async function getMessagesApi(matchId) {
  const response = await apiClient.get(`/matches/${matchId}/messages`);
  return response.data;
}

export async function sendMessageApi(userId, matchId, payload) {
  const response = await apiClient.post(
    `/matches/${matchId}/messages?userId=${userId}`,
    payload
  );
  return response.data;
}

export async function getUnreadMessageCountApi(userId) {
  const response = await apiClient.get(`/matches/unread-count?userId=${userId}`);
  return response.data;
}

export async function markMatchAsReadApi(userId, matchId) {
  const response = await apiClient.post(`/matches/${matchId}/read?userId=${userId}`);
  return response.data;
}

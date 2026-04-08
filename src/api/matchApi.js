import { apiClient } from "./client";

export async function getMatchesApi(userId) {
  const response = await apiClient.get(`/matches?userId=${userId}`);
  return response.data;
}

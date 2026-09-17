/**
 * API client for calling Cloud Functions.
 * Thin wrapper around fetch for consistent error handling.
 */
const BASE_URL = 'https://us-central1-taste-of-village-21052.cloudfunctions.net';

export const apiClient = {
  async post<T = any>(endpoint: string, body: Record<string, any>): Promise<T> {
    const response = await fetch(`${BASE_URL}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`API error ${response.status}: ${errorText}`);
    }

    return response.json();
  },

  async get<T = any>(endpoint: string): Promise<T> {
    const response = await fetch(`${BASE_URL}/${endpoint}`);

    if (!response.ok) {
      throw new Error(`API error ${response.status}`);
    }

    return response.json();
  },
};

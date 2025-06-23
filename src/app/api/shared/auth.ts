import axios from 'axios';

/**
 * Get access token for Microsoft Graph API
 */
export async function getAccessToken(): Promise<string> {
  const url = `https://login.microsoftonline.com/${process.env.TENANT_ID}/oauth2/v2.0/token`;
  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: process.env.CLIENT_ID!,
    client_secret: process.env.CLIENT_SECRET!,
    scope: `${process.env.RESOURCE}/.default`
  });

  const response = await axios.post(url, params);
  return response.data.access_token;
}

/**
 * Get base API configuration
 */
export function getApiConfig() {
  const baseUrl = `${process.env.RESOURCE}/api/data/v9.2`;
  return { baseUrl };
}

/**
 * Create authorization headers
 */
export function createAuthHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

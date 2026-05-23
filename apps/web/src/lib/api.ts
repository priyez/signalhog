const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function apiRequest(path: string, options: RequestInit = {}, token?: string) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || res.statusText);
  }

  return res.json();
}

export const projectsApi = {
  list: (token: string) => apiRequest('/projects', {}, token),
  create: (name: string, token: string) =>
    apiRequest('/projects', { method: 'POST', body: JSON.stringify({ name }) }, token),
};

export const flagsApi = {
  list: (projectId: string, environmentId: string, token: string) =>
    apiRequest(`/flags?projectId=${projectId}&environmentId=${environmentId}`, {}, token),
  create: (
    data: { projectId: string; environmentId: string; key: string; enabled?: boolean; rolloutPercentage?: number; rules?: any[]; createInAllEnvs?: boolean },
    token: string
  ) => apiRequest('/flags', { method: 'POST', body: JSON.stringify(data) }, token),
  update: (id: string, data: any, token: string) =>
    apiRequest(`/flags/${id}`, { method: 'PATCH', body: JSON.stringify(data) }, token),
  delete: (id: string, token: string) =>
    apiRequest(`/flags/${id}`, { method: 'DELETE' }, token),
};

export const funnelsApi = {
  list: (projectId: string, environmentId: string, token: string) =>
    apiRequest(`/funnels?projectId=${projectId}&environmentId=${environmentId}`, {}, token),
  create: (data: { projectId: string; environmentId: string; name: string; steps: string[] }, token: string) =>
    apiRequest('/funnels', { method: 'POST', body: JSON.stringify(data) }, token),
  delete: (id: string, token: string) =>
    apiRequest(`/funnels/${id}`, { method: 'DELETE' }, token),
};

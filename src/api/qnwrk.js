export async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Request failed: ${response.status}`);
  }

  return data;
}

export function listProjects() {
  return api('/api/projects');
}

export function createProject({ name, type }) {
  return api('/api/projects', {
    method: 'POST',
    body: JSON.stringify({ name, type })
  });
}

export function listFiles(slug, path = '.') {
  const query = new URLSearchParams({ path }).toString();
  return api(`/api/projects/${slug}/files?${query}`);
}

export function readFile(slug, path) {
  const query = new URLSearchParams({ path }).toString();
  return api(`/api/projects/${slug}/file?${query}`);
}

export function saveFile(slug, path, content) {
  return api(`/api/projects/${slug}/file`, {
    method: 'PUT',
    body: JSON.stringify({ path, content })
  });
}

export function createFolder(slug, path) {
  return api(`/api/projects/${slug}/folder`, {
    method: 'POST',
    body: JSON.stringify({ path })
  });
}

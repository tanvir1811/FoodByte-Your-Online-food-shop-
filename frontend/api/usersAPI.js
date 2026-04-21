export const usersAPI = async (operation, payload = {}) => {
  const map = {
    register: { method: 'POST',   url: '/api/users' },
    login:    { method: 'POST',   url: '/api/users/login' },
    logout:   { method: 'POST',   url: '/api/users/logout' },
    getMe:    { method: 'GET',    url: '/api/users/me' },           // ← added
    getAll:   { method: 'GET',    url: '/api/users' },
    getOne:   { method: 'GET',    url: `/api/users/${payload.id}` },
    updateMe: { method: 'PUT',    url: '/api/users/me' },
    delete:   { method: 'DELETE', url: `/api/users/${payload.id}` },
  };

  const route = map[operation];
  if (!route) {
    console.error(`Operation "${operation}" is missing from usersAPI map.`);
    throw new Error(`usersAPI: unknown operation "${operation}"`);
  }

  // Helper — handles session expiry and errors
  const handleResponse = async (res) => {
    if (res.status === 401 || res.status === 403) {
      alert("⚠️ Session expired. Please log in again.");
      window.location.replace("/index.html");
      return;
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${res.status}`);
    }
    return res.json();
  };

  const options = {
    method:      route.method,
    credentials: 'include',       // ← sends session cookie
    headers:     { 'Content-Type': 'application/json' },
  };
  if (route.method !== 'GET') options.body = JSON.stringify(payload);

  const res = await fetch(route.url, options);
  return handleResponse(res);
};

// usersAPI('register', { username, password, phone })
// usersAPI('login',    { username, password })
// usersAPI('logout')
// usersAPI('getMe')
// usersAPI('getAll')
// usersAPI('getOne',   { id: 3 })
// usersAPI('updateMe', { phone, ... })
// usersAPI('delete',   { id: 3 })
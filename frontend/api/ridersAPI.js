export const ridersAPI = async (operation, payload = {}) => {
  const map = {
    login:        { method: 'POST',   url: '/api/riders/login' },
     logout:       { method: 'POST',   url: '/api/riders/logout' },
    register:     { method: 'POST',   url: '/api/riders' },
    getAll:       { method: 'GET',    url: '/api/riders' },
    getOne:       { method: 'GET',    url: `/api/riders/${payload.id}` },
     getMe:        { method: 'GET',   url: '/api/riders/me' }, 
    updateStatus: { method: 'PATCH',  url: `/api/riders/${payload.id}/status` },
    updateall: { method: 'PATCH',  url: `/api/riders/${payload.id}/all` },
    delete:       { method: 'DELETE', url: `/api/riders/${payload.id}` },
  };

  const route = map[operation];
  if (!route) throw new Error(`ridersAPI: unknown operation "${operation}"`);

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

  // All operations use JSON (no file uploads in riders)
  const options = {
    method:      route.method,
    credentials: 'include',
    headers:     { 'Content-Type': 'application/json' },
  };
  if (route.method !== 'GET') options.body = JSON.stringify(payload);

  const res = await fetch(route.url, options);
  return handleResponse(res);
};

// ridersAPI('register',     { username, password, confirmPassword, phone, license_link, photo_link, joining_date })
// ridersAPI('getAll')
// ridersAPI('getOne',        { id: 3 })
// ridersAPI('updateMe',      { phone, license_link, photo_link })
// ridersAPI('updateStatus',  { id: 3, status: 'inactive' })
// ridersAPI('delete',        { id: 3 })
// ridersAPI('logout')
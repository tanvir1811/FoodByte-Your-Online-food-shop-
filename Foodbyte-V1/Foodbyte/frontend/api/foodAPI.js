export const foodAPI = async (operation, payload = {}) => {
  const map = {
    add:    { method: 'POST',   url: '/api/food' },
    getAll: { method: 'GET',    url: '/api/food' },
    getOne: { method: 'GET',    url: `/api/food/${payload.id}` },
    update: { method: 'PUT',    url: `/api/food/${payload.id}` },
    delete: { method: 'DELETE', url: `/api/food/${payload.id}` },
  };

  const route = map[operation];
  if (!route) throw new Error(`foodAPI: unknown operation "${operation}"`);

  // FormData branch — add & update (supports image upload)
  if (operation === 'add' || operation === 'update') {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, val]) => {
      if (val !== undefined && val !== null) formData.append(key, val);
    });

    const res = await fetch(route.url, {
      method: route.method,
      credentials: 'include',   // sends session cookie
      body: formData,           // DO NOT set Content-Type manually with FormData
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${res.status}`);
    }
    return res.json();
  }

  // JSON branch — getOne, delete, getAll
  const options = {
    method: route.method,
    credentials: 'include',     // sends session cookie
    headers: { 'Content-Type': 'application/json' },
  };
  if (route.method !== 'GET') options.body = JSON.stringify(payload);

  const res = await fetch(route.url, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
};
// foodAPI('add',    { food_name, price, description, payment_number, payment_account, image: fileObject })
// foodAPI('getAll')
// foodAPI('getOne', { id: 2 })
// foodAPI('update', { id: 2, food_name, price, description, payment_number, payment_account })
// foodAPI('delete', { id: 2 })
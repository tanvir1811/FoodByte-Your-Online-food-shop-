export const ordersAPI = async (operation, payload = {}) => {
  const map = {
    place:           { method: 'POST',   url: '/api/orders' },
    getAll:          { method: 'GET',    url: '/api/orders' },
    getOne:          { method: 'GET',    url: `/api/orders/${payload.id}` },
    getMyOrders:     { method: 'GET',    url: '/api/orders/mine' },
    getAvailable:    { method: 'GET',    url: '/api/orders/available' },
    getMyDeliveries: { method: 'GET',    url: '/api/orders/my-deliveries' },
    accept:          { method: 'PATCH',  url: `/api/orders/${payload.id}/accept` },
    deliver:         { method: 'PATCH',  url: `/api/orders/${payload.id}/deliver` },
    cancel:          { method: 'PATCH',  url: `/api/orders/${payload.id}/cancel` },
    delete:          { method: 'DELETE', url: `/api/orders/${payload.id}` },
  };

  const route = map[operation];
  if (!route) throw new Error(`ordersAPI: unknown operation "${operation}"`);

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
    credentials: 'include',     // ← sends session cookie
    headers:     { 'Content-Type': 'application/json' },
  };
  if (route.method !== 'GET') options.body = JSON.stringify(payload);

  const res = await fetch(route.url, options);
  return handleResponse(res);
};

// ordersAPI('place',          { food_item_name, price, payment_method, sender_number, transaction_id, street, area, city, state, zip, landmark, instructions })
// ordersAPI('getAll')
// ordersAPI('getOne',          { id: 7 })
// ordersAPI('getMyOrders')
// ordersAPI('getAvailable')
// ordersAPI('getMyDeliveries')
// ordersAPI('accept',          { id: 7 })
// ordersAPI('deliver',         { id: 7 })
// ordersAPI('cancel',          { id: 7 })
// ordersAPI('delete',          { id: 7 })
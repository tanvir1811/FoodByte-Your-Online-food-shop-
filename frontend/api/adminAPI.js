export const adminAPI= async (operation, payload = {}) =>{
    const map = {
        login:  { method: 'POST', url: '/api/admin/login' },
        logout: { method: 'POST', url: '/api/admin/logout' }
    };

    const route = map[operation];
    if (!route) throw new Error(`Unknown operation: ${operation}`);

    try {
        const response = await fetch(route.url, {
            method: route.method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        return await response.json();
    } catch (err) {
        console.error("Admin API Error:", err);
        return { status: 'fail', message: 'Server connection failed' };
    }
}
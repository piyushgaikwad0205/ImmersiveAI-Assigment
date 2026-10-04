const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? '/api' : 'http://localhost:5000/api');

const request = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    
    let token = null;
    let userId = null;
    if (typeof window !== 'undefined') {
        token = localStorage.getItem('taskly_token');
        userId = localStorage.getItem('taskly_user_id');
    }

    const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(userId && { 'x-user-id': userId }),
        ...options.headers
    };

    const config = {
        ...options,
        headers
    };

    const response = await fetch(url, config);
    const result = await response.json();

    if (!response.ok || result.success === false) {
        const message = result.message || 'An error occurred while communicating with the server';
        const error = new Error(message);
        error.statusCode = response.status;
        error.data = result;
        throw error;
    }

    return result.data;
};

export const authApi = {
    register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    me: () => request('/auth/me')
};

export const userApi = {
    getAllUsers: () => request('/users'),
    getUserById: (id) => request(`/users/${id}`)
};

export const taskApi = {
    getAllTasks: (params = {}) => {
        const query = new URLSearchParams();
        Object.entries(params).forEach(([key, val]) => {
            if (val !== undefined && val !== null && val !== '') query.append(key, val);
        });
        const queryStr = query.toString() ? `?${query.toString()}` : '';
        return request(`/tasks${queryStr}`);
    },
    getTaskById: (id) => request(`/tasks/${id}`),
    getMyTasks: (userId) => request(`/tasks/my-tasks${userId ? `?userId=${userId}` : ''}`),
    getBlockedTasks: () => request('/tasks/blocked'),
    createTask: (data) => request('/tasks', { method: 'POST', body: JSON.stringify(data) }),
    updateTask: (id, data) => request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    updateStatus: (id, status) => request(`/tasks/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    assignTask: (id, assignedTo) => request(`/tasks/${id}/assign`, { method: 'PATCH', body: JSON.stringify({ assignedTo }) }),
    addDependency: (id, dependsOnTaskId) => request(`/tasks/${id}/dependencies`, { method: 'POST', body: JSON.stringify({ dependsOnTaskId }) }),
    removeDependency: (id, dependencyId) => request(`/tasks/${id}/dependencies/${dependencyId}`, { method: 'DELETE' }),
    deleteTask: (id) => request(`/tasks/${id}`, { method: 'DELETE' })
};

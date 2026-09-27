import api from './axios';

export const getTasks         = async (params = {}) => (await api.get('/tasks', { params })).data;
export const getTaskStats     = async ()             => (await api.get('/tasks/stats')).data;
export const getAnalytics     = async ()             => (await api.get('/tasks/analytics')).data;
export const getTask          = async (id)           => (await api.get(`/tasks/${id}`)).data;
export const createTask       = async (data)         => (await api.post('/tasks', data)).data;
export const updateTask       = async (id, data)     => (await api.put(`/tasks/${id}`, data)).data;
export const updateTaskStatus = async (id, status)   => (await api.patch(`/tasks/${id}/status`, { status })).data;
export const deleteTask       = async (id)           => (await api.delete(`/tasks/${id}`)).data;

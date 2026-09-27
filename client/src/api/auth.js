import api from './axios';

export const registerUser = async (data) => (await api.post('/auth/register', data)).data;
export const loginUser    = async (data) => (await api.post('/auth/login',    data)).data;
export const getMe        = async ()     => (await api.get('/auth/me')).data;
export const updateMe     = async (data) => (await api.put('/auth/me',  data)).data;
export const deleteMe     = async ()     => (await api.delete('/auth/me')).data;

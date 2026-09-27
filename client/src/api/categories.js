import api from './axios';

export const getCategories    = async ()         => (await api.get('/categories')).data;
export const createCategory   = async (data)     => (await api.post('/categories', data)).data;
export const updateCategory   = async (id, data) => (await api.put(`/categories/${id}`, data)).data;
export const deleteCategory   = async (id)       => (await api.delete(`/categories/${id}`)).data;

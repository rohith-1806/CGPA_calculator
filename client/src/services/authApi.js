import api from './api';

export const loginUser = async (loginId, password) => {
  const response = await api.post('/auth/login', { loginId, password });
  return response.data;
};

export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

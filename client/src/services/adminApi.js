import api from './api';

const getAdminHeaders = () => {
  const token = localStorage.getItem('growx_admin_jwt_token');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

export const loginAdmin = async (email, password) => {
  const response = await api.post('/admin/login', { email, password });
  return response.data;
};

export const getAdminMe = async () => {
  const response = await api.get('/admin/me', getAdminHeaders());
  return response.data;
};

export const getAdminStats = async () => {
  const response = await api.get('/admin/stats', getAdminHeaders());
  return response.data;
};

export const getAdminStudents = async () => {
  const response = await api.get('/admin/students', getAdminHeaders());
  return response.data;
};

export const createStudent = async (studentData) => {
  const response = await api.post('/admin/students', studentData, getAdminHeaders());
  return response.data;
};

export const getStudentDetails = async (studentId) => {
  const response = await api.get(`/admin/students/${studentId}`, getAdminHeaders());
  return response.data;
};

export const updateStudentProfile = async (studentId, profileData) => {
  const response = await api.put(`/admin/students/${studentId}`, profileData, getAdminHeaders());
  return response.data;
};

export const deleteStudent = async (studentId) => {
  const response = await api.delete(`/admin/students/${studentId}`, getAdminHeaders());
  return response.data;
};

export const addSemesterAdmin = async (studentId, semesterName) => {
  const response = await api.post(
    `/admin/students/${studentId}/academic/semesters`,
    { semesterName },
    getAdminHeaders()
  );
  return response.data;
};

export const updateSemesterAdmin = async (studentId, semesterId, semesterName) => {
  const response = await api.put(
    `/admin/students/${studentId}/academic/semesters/${semesterId}`,
    { semesterName },
    getAdminHeaders()
  );
  return response.data;
};

export const deleteSemesterAdmin = async (studentId, semesterId) => {
  const response = await api.delete(
    `/admin/students/${studentId}/academic/semesters/${semesterId}`,
    getAdminHeaders()
  );
  return response.data;
};

export const addSubjectAdmin = async (studentId, semesterId, subjectData) => {
  const response = await api.post(
    `/admin/students/${studentId}/academic/semesters/${semesterId}/subjects`,
    subjectData,
    getAdminHeaders()
  );
  return response.data;
};

export const updateSubjectAdmin = async (studentId, subjectId, subjectData) => {
  const response = await api.put(
    `/admin/students/${studentId}/academic/subjects/${subjectId}`,
    subjectData,
    getAdminHeaders()
  );
  return response.data;
};

export const deleteSubjectAdmin = async (studentId, subjectId) => {
  const response = await api.delete(
    `/admin/students/${studentId}/academic/subjects/${subjectId}`,
    getAdminHeaders()
  );
  return response.data;
};
